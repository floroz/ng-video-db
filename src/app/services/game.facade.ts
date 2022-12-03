import { Injectable } from '@angular/core';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root',
})
export class GameFacade {
  games$ = this.gameService.games$;
  filter$ = this.gameService.filter$;
  search$ = this.gameService.search$;

  constructor(private gameService: GameService) {}

  updateFilters(filter: string) {
    this.gameService.updateFilters(filter);
  }

  updateSearch(search: string) {
    this.gameService.updateSearch(search);
  }
}
