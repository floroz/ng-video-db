import { Injectable } from '@angular/core';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root',
})
export class GameFacade {
  games$ = this.gameService.games$;
  filters$ = this.gameService.filters$;
  search$ = this.gameService.search$;

  constructor(private gameService: GameService) {}

  updateFilters(filters: Record<string, string>) {
    this.gameService.updateFilters(filters);
  }

  updateSearch(search: string) {
    this.gameService.updateSearch(search);
  }

  updateOrdering(ordering: string) {
    this.gameService.updateOrdering(ordering);
  }

  getAllowedFilters() {
    return this.gameService.getAllowedFilters();
  }
}
