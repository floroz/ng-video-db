import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameSearchFacade } from 'src/app/services/game-search.facade';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GamesComponent implements OnInit {
  games$ = this.facade.games$;
  loading$ = this.facade.loading$;
  allowedFilters = this.facade.ALLOWED_FILTERS;

  constructor(
    private activatedRoute: ActivatedRoute,
    private facade: GameSearchFacade,
    private router: Router
  ) {}

  ngOnInit() {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.facade.setSearch(params['search'] ?? '');
    });
  }

  openGameDetails(id: number) {
    this.router.navigate(['/games', id]);
  }

  orderBy(ordering: string) {
    this.facade.setOrdering(ordering);
  }
}
