import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  delay,
  distinctUntilChanged,
  forkJoin,
  map,
  tap,
  throwError,
} from 'rxjs';
import { env } from 'src/environments/environment';
import { APIResponse, Game, GameFilters } from '../models/game';

import { produce } from 'immer';

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

  private state = produce(initialState, (draft) => draft);

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

  loadingGame = new BehaviorSubject(false);
  loadingAllGames = new BehaviorSubject(false);

  loadingGame$ = this.loadingGame.asObservable();
  loadingAllGames$ = this.loadingAllGames.asObservable();

  findAll() {
    this.startLoadingAllGames();

    const params = generateAllGamesParams(this.state);

    return this.http
      .get<APIResponse<Game>>(`${env.BASE_URL}/games`, {
        params,
      })
      .pipe(
        map(({ results: games }) => games),
        catchError((err) => {
          this.stopLoadingAllGames();
          return throwError(() => err);
        }),
        tap((games) => {
          const newState = produce(this.state, (draft) => {
            draft.games = produce(games, (draft) => draft);
          });
          this.stopLoadingAllGames();
          this.setState(newState);
        })
      );
  }

  setState(state: Partial<GameState>) {
    this.state = produce(this.state, (draft) => ({ ...draft, ...state }));
    this.store.next(this.state);
  }

  get ALLOWED_FILTERS() {
    return [...ALLOWED_FILTERS];
  }

  findOne(id: string) {
    this.startLoadingGame();

    const gameDetails$ = this.http.get<Game>(`${env.BASE_URL}/games/${id}`);

    const screenshots$ = this.http
      .get<APIResponse<{ image: string }>>(
        `${env.BASE_URL}/games/${id}/screenshots`
      )
      .pipe(map(({ results: screenshots }) => screenshots));

    return forkJoin([gameDetails$, screenshots$]).pipe(
      catchError((err) => {
        this.stopLoadingGame();
        return throwError(() => err);
      }),
      tap(([gameDetails, screenshots]) => {
        const newState = produce(this.state, (draft) => {
          gameDetails.screenshots = screenshots;
          draft.selectedGame = gameDetails;
        });

        this.stopLoadingGame();
        this.setState(newState);
      })
    );
  }

  private startLoadingGame() {
    this.loadingGame.next(true);
  }
  private stopLoadingGame() {
    this.loadingGame.next(false);
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
