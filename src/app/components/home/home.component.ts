import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { GameFacade } from 'src/app/services/game.facade';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  games$ = this.gameFacade.games$;
  loadingAllGames$ = this.gameFacade.loadingAllGames$;

  constructor(
    private activatedRoute: ActivatedRoute,
    private gameFacade: GameFacade,
    private router: Router
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((param) => {
      this.gameFacade.findAllGames();
      this.gameFacade.updateSearch(param['gameName'] ?? '');
    });
  }

  openGameDetails(id: number) {
    this.router.navigate(['/games', id]);
  }

  orderBy(ordering: string) {
    this.gameFacade.updateOrdering(ordering);
  }

  getFilters() {
    return this.gameFacade.getAllowedFilters();
  }
}
