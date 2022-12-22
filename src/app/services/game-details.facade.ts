import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Game } from '../models/game';
import { GameDetailsService } from './game-details.service';

@Injectable({
  providedIn: 'root',
})
export class GameDetailsFacade {
  loadingGame$ = this.gameDetailsService.loading$;

  constructor(private gameDetailsService: GameDetailsService) {}

  findGameById$(id: string): Observable<Game> {
    return this.gameDetailsService.findGameById$(id);
  }
}
