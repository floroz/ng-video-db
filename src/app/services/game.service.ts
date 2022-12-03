import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
  tap,
} from 'rxjs';
import { env } from 'src/environments/environment';
import { APIResponse, Game, GameFilters } from '../models/game';

type GameState = {
  games: Game[];
  filters: GameFilters | undefined;
  ordering: string | undefined;
  search: string;
  selectedGame: null | Game;
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
  selectedGame: null,
};

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor(private http: HttpClient) {}

  private state = {
    ...initialState,
  };
  private store = new BehaviorSubject<GameState>(this.state);
  private store$ = this.store.asObservable();

  games$ = this.store$.pipe(
    map((state) => state.games),
    distinctUntilChanged()
  );
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
  selectedGame$ = this.store$.pipe(
    map((state) => state.selectedGame),
    distinctUntilChanged()
  );

  findAll() {
    const { filters, search, ordering } = this.state;

    let params = new HttpParams();

    params = addFiltersToParams(filters, params);

    if (search) {
      params = params.set('search', search);
    }

    if (ordering) {
      params = params.set('ordering', ordering);
    }

    return this.http
      .get<APIResponse<Game>>(`${env.BASE_URL}/games`, {
        params,
      })
      .pipe(
        map(({ results: games }) => games),
        tap(console.log),
        tap((games) => this.store.next({ ...this.state, games: [...games] }))
      );
  }

  setState(state: Partial<GameState>) {
    const newState = { ...this.state, ...state };
    this.store.next(newState);
  }

  getAllowedFilters() {
    return [...ALLOWED_FILTERS];
  }

  findGame(id: string) {
    const game$ = this.http.get<Game>(`${env.BASE_URL}/games/${id}`);
    const screenshots$ = this.http
      .get<APIResponse<{ image: string }>>(
        `${env.BASE_URL}/games/${id}/screenshots`
      )
      .pipe(map(({ results: screenshots }) => screenshots));

    const gameWithScreenshots$ = combineLatest([game$, screenshots$]).pipe(
      map(([game, screenshots]) => ({ ...game, screenshots: screenshots })),
      map((game) => (this.state = { ...this.state, selectedGame: game })),
      tap((state) => this.store.next(state))
    );

    return gameWithScreenshots$;
  }
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
