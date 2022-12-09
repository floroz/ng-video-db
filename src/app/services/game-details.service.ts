import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import produce from 'immer';
import {
  BehaviorSubject,
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
import { APIResponse, Game } from '../models/game';

const INITIAL_WAITING_TIME = 150;
const MINIMUM_TIME_TO_DISPLAY_LOADER = 250;

interface GameDetailsState {
  selectedGame: null | Game;
  loading: boolean;
  selectedGameId: string | null;
}

const initialState: GameDetailsState = {
  loading: false,
  selectedGame: null,
  selectedGameId: null,
};

@Injectable({
  providedIn: 'root',
})
export class GameDetailsService {
  private state = initialState;

  private store = new BehaviorSubject<GameDetailsState>(this.state);
  private store$ = this.store.asObservable();

  selectedGame$ = this.store$.pipe(
    map((state) => state.selectedGameId),
    distinctUntilChanged(),
    switchMap((id): Observable<null | Game> => {
      if (id == null) {
        return of(null);
      } else {
        return this.findGameDetails(id);
      }
    })
  );

  loading$ = this.store$.pipe(
    map((state) => state.loading),
    distinctUntilChanged()
  );

  constructor(private http: HttpClient) {}

  findOne(id: string) {
    this.setState({ selectedGameId: id });
  }

  clear() {
    this.setState({ selectedGameId: null });
  }

  private findGameDetails(id: string): Observable<Game> {
    const gameDetails$ = this.findGameById(id).pipe(
      catchError((err) => {
        console.error(err);
        return of(null);
      }),
      retry(2)
    );
    const screenshots$ = this.findScreenshotsById(id).pipe(
      catchError((err) => {
        console.error(err);
        return of(null);
      }),
      retry(2)
    );

    const data$ = forkJoin([gameDetails$, screenshots$]).pipe(
      filter(
        (data): data is [Game, { image: string }[]] =>
          data[0] != null && data[1] != null
      ),
      map(([gameDetails, screenshots]) => {
        // enhance game object with screenshots
        gameDetails.screenshots = screenshots;

        return gameDetails;
      }),
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

  private findGameById(id: string): Observable<Game> {
    return this.http.get<Game>(`${env.BASE_URL}/games/${id}`);
  }

  private findScreenshotsById(id: string): Observable<{ image: string }[]> {
    return this.http
      .get<APIResponse<{ image: string }>>(
        `${env.BASE_URL}/games/${id}/screenshots`
      )
      .pipe(map(({ results: screenshots }) => screenshots));
  }

  private setState<T extends Partial<GameDetailsState>>(partial: T) {
    const newState = produce(this.state, (draft) => {
      for (let key in partial) {
        // @ts-expect-error Immer.js not playing nicely with the typings here
        draft[key] = partial[key];
      }
    });
    this.state = newState;
    this.store.next(newState);
  }
}
