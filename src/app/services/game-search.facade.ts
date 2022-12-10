import { Injectable } from '@angular/core';
import { GameFilters } from '../models/game';
import { GameSearchService } from './game-search.service';

@Injectable({
  providedIn: 'root',
})
export class GameSearchFacade {
  games$ = this.gameSearchService.games$;
  filters$ = this.gameSearchService.filters$;
  search$ = this.gameSearchService.search$;
  loading$ = this.gameSearchService.loading$;

  ALLOWED_FILTERS = this.gameSearchService.ALLOWED_FILTERS;

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
}
