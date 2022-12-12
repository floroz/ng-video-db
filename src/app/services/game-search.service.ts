import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  Observable,
  of,
  retry,
  switchMap,
  tap,
} from 'rxjs';
import { env } from 'src/environments/environment';
import { APIResponse, Game, GameFilters } from '../models/game';

import { StateService } from './state.service';

type GameSearchState = {
  games: Game[];
  filters: GameFilters | undefined;
  ordering: string | undefined;
  search: string;
  loading: boolean;
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

  games$: Observable<Game[]> = combineLatest([
    this.search$,
    this.filters$,
    this.ordering$,
  ]).pipe(
    switchMap(([search, filters, ordering]) => {
      return this.search({ search, filters, ordering });
    })
  );

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

  get ALLOWED_FILTERS() {
    return [...ALLOWED_FILTERS];
  }

  private search({
    filters,
    search,
    ordering,
  }: Pick<GameSearchState, 'filters' | 'ordering' | 'search'>) {
    this.setState({ loading: true });

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
          this.setState({ loading: false });
          return of(null);
        }),
        filter(Boolean),
        tap((games) => {
          this.setState({ loading: false, games });
        })
      );
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
