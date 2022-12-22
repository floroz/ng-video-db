import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import {
  delay,
  filter,
  map,
  merge,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { Game } from 'src/app/models/game';
import { GameDetailsFacade } from 'src/app/services/game-details.facade';

const MIN_RATING = 0.1;
const TIME_TO_DISPLAY_RATING = 250;

@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameDetailsComponent {
  loading$ = this.facade.loadingGame$;

  game$ = this.route.params.pipe(
    switchMap((params) => {
      const { id } = params;

      if (!id) {
        return this.redirectToHome$();
      } else {
        return this.getGameById$(id);
      }
    })
  );

  rating$: Observable<number> = merge(
    of(MIN_RATING),
    this.game$.pipe(
      filter(Boolean),
      map((game) => game.metacritic),
      delay(TIME_TO_DISPLAY_RATING)
    )
  );

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private facade: GameDetailsFacade,
    private title: Title
  ) {}

  getGameById$(id: string): Observable<Game> {
    return this.facade
      .findGameById$(id)
      .pipe(tap((game) => game && this.setPageTitle(game.name)));
  }

  setPageTitle(gameName: Game['name']) {
    this.title.setTitle(`${gameName} | Videogames DB`);
  }

  redirectToHome$() {
    return of(null).pipe(tap(() => this.router.navigate([''])));
  }

  calcRatingColor(value: number): string {
    if (value > 75) {
      return '#5ee432';
    } else if (value > 50) {
      return '#fffa50';
    } else if (value > 30) {
      return '#f7aa38';
    } else {
      return '#ef4655';
    }
  }
}
