import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  delay,
  delayWhen,
  distinctUntilChanged,
  forkJoin,
  map,
  shareReplay,
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
        tap((games) =>
          this.store.next(
            produce(this.state, (draft) => {
              draft.games = produce(games, (draft) => draft);
            })
          )
        )
      );
  }

  setState(state: Partial<GameState>) {
    this.state = produce(this.state, (draft) => ({ ...draft, ...state }));
    this.store.next(this.state);
  }

  getAllowedFilters() {
    return [...ALLOWED_FILTERS];
  }

  findGame(id: string) {
    const gameDetails$ = this.http.get<Game>(`${env.BASE_URL}/games/${id}`);

    const screenshots$ = this.http
      .get<APIResponse<{ image: string }>>(
        `${env.BASE_URL}/games/${id}/screenshots`
      )
      .pipe(map(({ results: screenshots }) => screenshots));

    return forkJoin([gameDetails$, screenshots$]).pipe(
      tap(([gameDetails, screenshots]) => {
        this.state = produce(this.state, (draft) => {
          gameDetails.screenshots = screenshots;
          draft.selectedGame = gameDetails;
        });
        this.store.next(this.state);
      })
    );
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
