import { Injectable } from '@angular/core';
import { GameService } from './game.service';

@Injectable({
  providedIn: 'root',
})
export class GameFacade {
  games$ = this.gameService.games$;
  filters$ = this.gameService.filters$;
  search$ = this.gameService.search$;
  selectedGame$ = this.gameService.selectedGame$;

  constructor(private gameService: GameService) {}

  updateFilters(filters: Record<string, string>) {
    this.gameService.setState({ filters });
  }

  updateSearch(search: string) {
    this.gameService.setState({ search });
  }

  updateOrdering(ordering: string) {
    this.gameService.setState({ ordering });
  }

  getAllowedFilters() {
    return this.gameService.getAllowedFilters();
  }

  findGame(id: string) {
    this.gameService.findGame(id).subscribe();
  }

  findAllGames() {
    this.gameService.findAll().subscribe();
  }

  clearGame() {
    this.gameService.setState({ selectedGame: null });
  }
}
