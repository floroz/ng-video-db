import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  merge,
  NEVER,
  Observable,
  retry,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { env } from 'src/environments/environment';
import { APIResponse, Game, GameFilters } from '../models/game';

import { StateService } from './state.service';

type GameSearchState = {
  readonly games: Game[];
  readonly next: string | null;
  readonly filters: GameFilters | undefined;
  readonly ordering: string | undefined;
  readonly search: string;
  readonly loading: boolean;
};

const ALLOWED_FILTERS = [
  'name',
  'released',
  'added',
  'created',
  'updated',
  'rating',
  'metacritic',
  '-name',
  '-released',
  '-added',
  '-created',
  '-updated',
  '-rating',
  '-metacritic',
] as const;

const initialState: GameSearchState = {
  games: [],
  next: null,
  filters: {},
  ordering: undefined,
  search: '',
  loading: false,
};

@Injectable({
  providedIn: 'root',
})
export class GameSearchService extends StateService<GameSearchState> {
  private store$ = this.store.asObservable();

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

  private manualSearch$ = combineLatest([
    this.search$,
    this.filters$,
    this.ordering$,
  ]).pipe(
    switchMap(([search, filters, ordering]) => {
      this.setState({ loading: true });

      return this.search({ search, filters, ordering });
    }),
    retry(2),
    catchError(this.handleErrors),
    map(({ results: games, next }) => {
      this.setState({ loading: false, games, next });

      return games;
    })
  );

  private nextSearch = new Subject();

  private nextSearch$ = this.nextSearch.asObservable().pipe(
    tap(() => console.log(this.state)),
    filter(() => !!this.state.next),
    tap(() => {
      this.setState({ loading: true });
    }),
    switchMap(() => this.http.get<APIResponse<Game>>(this.state.next!)),
    retry(2),
    catchError(this.handleErrors),
    map(({ results: games, next, previous }) => {
      const fullGamesList = this.state.games.concat(games);

      let nextUrl: string | null = next;
      if (previous && next === previous) {
        debugger;
        nextUrl = null;
      }

      this.setState({ loading: false, games: fullGamesList, next: nextUrl });
      return fullGamesList;
    })
  );

  games$: Observable<Game[]> = merge(this.manualSearch$, this.nextSearch$);

  loading$ = this.store$.pipe().pipe(
    map((state) => state.loading),
    distinctUntilChanged()
  );

  constructor(private http: HttpClient) {
    super(initialState);
  }

  setFilters(filters: GameFilters) {
    this.setState({ filters });
  }

  setSearch(search: string) {
    this.setState({ search });
  }

  setOrdering(ordering: string) {
    this.setState({ ordering });
  }

  loadNext() {
    this.nextSearch.next(undefined);
  }

  get ALLOWED_FILTERS() {
    return [...ALLOWED_FILTERS];
  }

  private search({
    filters,
    search,
    ordering,
  }: Pick<GameSearchState, 'filters' | 'ordering' | 'search'>) {
    const params = generateAllGamesParams({ filters, ordering, search });

    return this.http.get<APIResponse<Game>>(`${env.BASE_URL}/games`, {
      params,
    });
  }

  private handleErrors(err: unknown) {
    console.error(err);
    this.setState({ loading: false });
    return NEVER;
  }
}

function generateAllGamesParams({
  filters,
  search,
  ordering,
}: Pick<GameSearchState, 'filters' | 'search' | 'ordering'>) {
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
