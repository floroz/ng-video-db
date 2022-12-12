import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
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
      /**
       * Retrieving search state from
       */
      this.facade.setSearch(params['search'] ?? '');
      this.facade.setOrdering(params['ordering'] ?? '');
    });
  }

  openGameDetails(id: number) {
    this.router.navigate(['/games', id]);
  }

  orderBy(ordering: string) {
    /**
     * Persisting search state in URL
     */
    this.router.navigate(['.'], {
      queryParams: {
        ordering: ordering,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
      relativeTo: this.activatedRoute,
    });
    this.facade.setOrdering(ordering);
  }

  onInfiniteScroll(isIntersecting: boolean) {
    if (isIntersecting) {
      this.facade.loadNext();
    }
  }
}
