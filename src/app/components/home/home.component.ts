import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameSearchFacade } from 'src/app/services/game-search.facade';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit {
  games$ = this.facade.games$;
  loading$ = this.facade.loading$;
  allowedFilters = this.facade.ALLOWED_FILTERS;

  constructor(
    private activatedRoute: ActivatedRoute,
    private facade: GameSearchFacade,
    private router: Router
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((param) => {
      this.facade.setSearch(param['gameName'] ?? '');
    });
  }

  openGameDetails(id: number) {
    this.router.navigate(['/games', id]);
  }

  orderBy(ordering: string) {
    this.facade.setOrdering(ordering);
  }
}
