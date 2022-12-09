import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  combineLatest,
  delay,
  distinctUntilChanged,
  exhaustMap,
  filter,
  forkJoin,
  map,
  mergeMap,
  Observable,
  of,
  race,
  retry,
  shareReplay,
  Subscription,
  switchMap,
  tap,
} from 'rxjs';
import { env } from 'src/environments/environment';
import { APIResponse, Game, GameFilters } from '../models/game';

import { produce } from 'immer';

type GameState = {
  games: Game[];
  filters: GameFilters | undefined;
  ordering: string | undefined;
  search: string;
};

const ALLOWED_FILTERS = [
  'name',
  'released',
  'added',
  'created',
  'updated',
  'rating',
  'metacritic',
] as const;

const initialState: GameState = {
  games: [],
  filters: {},
  ordering: undefined,
  search: '',
};

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private state = produce(initialState, (draft) => draft);

  private store = new BehaviorSubject<GameState>(this.state);
  private store$ = this.store
    .asObservable()
    .pipe(tap((state) => console.log('State Updated: ', state)));

  filters$ = this.store$.pipe(
    map((state) => state.filters),
    distinctUntilChanged()
  );
  search$ = this.store$.pipe(
    map((state) => state.search),
    distinctUntilChanged()
  );
  ordering$ = this.store$.pipe().pipe(
    map((state) => state.ordering),
    distinctUntilChanged()
  );

  games$: Observable<Game[]> = combineLatest([
    this.search$,
    this.filters$,
    this.ordering$,
  ]).pipe(
    switchMap(([search, filter, ordering]) => {
      return this.findMany(search, filter, ordering);
    })
  );

  loadingAllGames = new BehaviorSubject(false);

  loadingAllGames$ = this.loadingAllGames.asObservable();

  constructor(private http: HttpClient) {}

  findMany(
    search: string,
    filters: GameFilters | undefined,
    ordering: string | undefined
  ) {
    this.startLoadingAllGames();

    const params = generateAllGamesParams({ filters, ordering, search });

    return this.http
      .get<APIResponse<Game>>(`${env.BASE_URL}/games`, {
        params,
      })
      .pipe(
        map(({ results: games }) => games),
        retry(2),
        catchError((err) => {
          console.error(err);
          this.stopLoadingAllGames();
          return of(null);
        }),
        filter(Boolean),
        tap((games) => {
          const newState = produce(this.state, (draft) => {
            draft.games = produce(games, (draft) => draft);
          });
          this.stopLoadingAllGames();
          this.setState(newState);
        })
      );
  }

  updateFilters(filters: GameFilters) {
    this.setState({ filters });
  }

  updateSearch(search: string) {
    this.setState({ search });
  }

  updateOrdering(ordering: string) {
    this.setState({ ordering });
  }

  private setState(state: Partial<GameState>) {
    this.state = produce(this.state, (draft) => ({ ...draft, ...state }));
    this.store.next(this.state);
  }

  get ALLOWED_FILTERS() {
    return [...ALLOWED_FILTERS];
  }

  private startLoadingAllGames() {
    this.loadingAllGames.next(true);
  }
  private stopLoadingAllGames() {
    this.loadingAllGames.next(false);
  }
}

function generateAllGamesParams({
  filters,
  search,
  ordering,
}: Pick<GameState, 'filters' | 'search' | 'ordering'>) {
  let params = new HttpParams();

  params = addFiltersToParams(filters, params);

  if (search) {
    params = params.set('search', search);
  }

  if (ordering) {
    params = params.set('ordering', ordering);
  }

  return params;
}

function addFiltersToParams(
  filters: GameFilters | undefined,
  params: HttpParams
): HttpParams {
  if (filters && Object.values(filters).length) {
    Object.entries(filters).forEach(([filterName, filterValue]) => {
      params = params.set(filterName, filterValue);
    });
  }

  return params;
}
