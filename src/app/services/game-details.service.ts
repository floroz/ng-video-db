import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError,
  concat,
  delay,
  distinctUntilChanged,
  EMPTY,
  filter,
  forkJoin,
  map,
  Observable,
  of,
  race,
  retry,
  shareReplay,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import { env } from 'src/environments/environment';
import { APIResponse, Game, Screenshots, Trailer } from '../models/game';
import { StateService } from './state.service';

const INITIAL_WAITING_TIME = 150;
const MINIMUM_TIME_TO_DISPLAY_LOADER = 250;

type GameIDString = string;
type GameDetailsCache = Map<GameIDString, Game>;

type GameDetailsState = {
  readonly selectedGame: null | Game;
  readonly loading: boolean;
};

const initialState: GameDetailsState = {
  loading: false,
  selectedGame: null,
};

@Injectable({
  providedIn: 'root',
})
export class GameDetailsService extends StateService<GameDetailsState> {
  constructor(private http: HttpClient) {
    super(initialState);
  }
  private cache: GameDetailsCache = new Map();

  loading$ = this.store$.pipe(
    map((state) => state.loading),
    distinctUntilChanged()
  );

  clear() {
    this.setState({ selectedGame: null });
  }

  private dataValidator(
    data: unknown
  ): data is [Game, Screenshots[], Trailer[]] {
    return Array.isArray(data) && data[0] != null && data[1] != null;
  }

  findGameById$(id: string): Observable<Game> {
    const gameDetails$ = this.findGameDetailsById(id).pipe(
      catchError(this.handleError),
      retry(2)
    );
    const screenshots$ = this.findScreenshotsById(id).pipe(
      catchError(this.handleError),
      retry(2)
    );

    const trailers$ = this.findTrailersById(id).pipe(
      catchError(this.handleError),
      retry(2)
    );

    const data$ = forkJoin([gameDetails$, screenshots$, trailers$]).pipe(
      filter(this.dataValidator),
      map(([gameDetails, screenshots, trailers]) => ({
        ...gameDetails,
        screenshots: screenshots,
        trailers: trailers,
      })),
      tap((game) => this.addGameToCache(game)),
      shareReplay(1)
    );

    /**
     * We want to display the loading indicator only if the requests takes more than `${INITIAL_WAITING_TIME}
     * if it does, we want to wait at least `${MINIMUM_TIME_TO_DISPLAY_LOADER} before emitting
     */
    const startLoading$ = of({}).pipe(
      tap(() => this.setState({ loading: true })),
      delay(MINIMUM_TIME_TO_DISPLAY_LOADER),
      switchMap(() => EMPTY)
    );

    const hideLoading$ = of(null).pipe(
      tap(() => this.setState({ loading: false }))
    );

    const timer$ = timer(INITIAL_WAITING_TIME).pipe();

    /**
     * We want to race two streams:
     *
     * - initial waiting time: the time we want to hold on any UI updates
     * to wait for the API to get back to us
     *
     * - data: the response from the API.
     *
     * Scenario A: API comes back before the initial waiting time
     *
     * We avoid displaying the loading spinner altogether, and instead we directly update
     * the state with the new data.
     *
     * Scenario B: API doesn't come back before initial waiting time.
     *
     * We want to display the loading spinner, and to avoid awkward flash (for example the response comes back 10ms after the initial waiting time) we extend the delay to 250ms
     * to give the user the time to understand the actions happening on the screen.
     */
    const race$ = race(timer$, data$).pipe(
      switchMap((winner) =>
        typeof winner === 'number' ? startLoading$ : EMPTY
      )
    );

    return concat(race$, hideLoading$, data$).pipe(filter(Boolean));
  }

  private findGameDetailsById(id: string): Observable<Game | null> {
    if (id == null) {
      // something went wrong
      return of(null);
    }

    if (this.cache.has(id)) {
      // https://github.com/microsoft/TypeScript/issues/9619
      // apparently compiler cannot infer that map.has acts as a type guard so that map.get in the next
      // line can never be undefined.
      // @ts-expect-error
      return of(this.cache.get(id));
    }

    return this.http.get<Game>(`${env.BASE_URL}/games/${id}`);
  }

  private findScreenshotsById(id: string): Observable<Screenshots[]> {
    return this.http
      .get<APIResponse<Screenshots>>(`${env.BASE_URL}/games/${id}/screenshots`)
      .pipe(map(({ results: screenshots }) => screenshots));
  }

  private findTrailersById(id: string): Observable<Trailer[]> {
    return this.http
      .get<APIResponse<Trailer>>(`${env.BASE_URL}/games/${id}/movies`)
      .pipe(map(({ results }) => results));
  }

  private addGameToCache(game: Game) {
    this.cache.set(game.id.toString(), game);
  }

  private handleError(err: unknown): Observable<null> {
    console.error(err);
    return of(null);
  }
}
