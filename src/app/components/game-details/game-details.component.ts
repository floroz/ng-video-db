import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameFacade } from 'src/app/services/game.facade';

@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameDetailsComponent implements OnInit, OnDestroy {
  selectedGame$ = this.gameFacade.selectedGame$;
  loadingGame$ = this.gameFacade.loadingGame$;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private gameFacade: GameFacade
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (!params['id']) {
        this.router.navigate(['']);
      } else {
        this.gameFacade.findGame(params['id']);
      }
    });
  }

  ngOnDestroy(): void {
    /**
     * Open question: can we avoid the consumer (GameDetailsComponent) having
     * to worry about resetting the state?
     */
    // this.gameFacade.clearGame();
  }
}
