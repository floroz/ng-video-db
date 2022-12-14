import { Injectable } from '@angular/core';
import { GameFilters } from '../models/game';
import { GameSearchService } from './game-search.service';

@Injectable({
  providedIn: 'root',
})
export class GameSearchFacade {
  readonly games$ = this.gameSearchService.games$;
  readonly filters$ = this.gameSearchService.filters$;
  readonly search$ = this.gameSearchService.search$;
  readonly loading$ = this.gameSearchService.loading$;

  readonly ALLOWED_FILTERS = this.gameSearchService.ALLOWED_FILTERS;

  constructor(private gameSearchService: GameSearchService) {}

  setFilters(filters: GameFilters): void {
    this.gameSearchService.setFilters(filters);
  }

  setSearch(search: string): void {
    this.gameSearchService.setSearch(search);
  }

  setOrdering(ordering: string): void {
    this.gameSearchService.setOrdering(ordering);
  }

  loadNext() {
    this.gameSearchService.loadNext();
  }
}
