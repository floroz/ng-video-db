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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private gameFacade: GameFacade
  ) {}
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (!params['id']) {
        return this.router.navigate(['']);
      }

      return this.gameFacade.findGame(params['id']);
    });
  }

  ngOnDestroy(): void {
    this.gameFacade.clearGame();
  }
}
