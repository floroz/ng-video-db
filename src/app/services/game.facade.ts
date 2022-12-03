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
  loadingGame$ = this.gameService.loadingGame$;
  loadingAllGames$ = this.gameService.loadingAllGames$;
  ALLOWED_FILTERS = this.gameService.ALLOWED_FILTERS;

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

  findGame(id: string) {
    this.gameService.findOne(id).subscribe();
  }

  findAllGames() {
    this.gameService.findAll().subscribe();
  }

  clearGame() {
    this.gameService.setState({ selectedGame: null });
  }
}
