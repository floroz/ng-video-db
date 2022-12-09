import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { GameFilters } from '../models/game';
import { GameService } from './game.service';
import { GameDetailsService } from './game-details.service';

@Injectable({
  providedIn: 'root',
})
export class GameFacade {
  games$ = this.gameService.games$;
  filters$ = this.gameService.filters$;
  search$ = this.gameService.search$;
  selectedGame$ = this.selectedGameService.selectedGame$;
  loadingGame$ = this.selectedGameService.loading$;
  loadingAllGames$ = this.gameService.loadingAllGames$;
  ALLOWED_FILTERS = this.gameService.ALLOWED_FILTERS;

  constructor(
    private gameService: GameService,
    private selectedGameService: GameDetailsService
  ) {}

  initGames(): Subscription {
    return this.gameService.init();
  }

  updateFilters(filters: GameFilters): void {
    this.gameService.updateFilters(filters);
  }

  updateSearch(search: string): void {
    this.gameService.updateSearch(search);
  }

  updateOrdering(ordering: string): void {
    this.gameService.updateOrdering(ordering);
  }

  findGame(id: string): void {
    this.selectedGameService.findOne(id);
  }
}
