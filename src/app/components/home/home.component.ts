import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { GameFacade } from 'src/app/services/game.facade';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  games$ = this.gameFacade.games$;
  loadingAllGames$ = this.gameFacade.loadingAllGames$;
  allowedFilters = this.gameFacade.ALLOWED_FILTERS;

  constructor(
    private activatedRoute: ActivatedRoute,
    private gameFacade: GameFacade,
    private router: Router
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((param) => {
      this.gameFacade.updateSearch(param['gameName'] ?? '');
    });
  }

  openGameDetails(id: number) {
    this.router.navigate(['/games', id]);
  }

  orderBy(ordering: string) {
    this.gameFacade.updateOrdering(ordering);
  }
}
