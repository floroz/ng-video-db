import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameDetailsFacade } from 'src/app/services/game-details.facade';

@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameDetailsComponent implements OnInit {
  game$ = this.facade.selectedGame$;
  loading$ = this.facade.loadingGame$;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private facade: GameDetailsFacade
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (!params['id']) {
        this.router.navigate(['']);
      } else {
        this.facade.findGame(params['id']);
      }
    });
  }
}
