import { Injectable } from '@angular/core';
import { GameDetailsService } from './game-details.service';

@Injectable({
  providedIn: 'root',
})
export class GameDetailsFacade {
  selectedGame$ = this.gameDetailsService.selectedGame$;
  loadingGame$ = this.gameDetailsService.loading$;

  constructor(private gameDetailsService: GameDetailsService) {}

  findGame(id: string): void {
    this.gameDetailsService.findOne(id);
  }
}
