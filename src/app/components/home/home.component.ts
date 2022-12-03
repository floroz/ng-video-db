import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Game } from 'src/app/models/game';
import { GameFacade } from 'src/app/services/game.facade';
import { GameService } from 'src/app/services/game.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  sort!: string;
  games$ = this.gameFacade.games$;

  constructor(
    private activatedRoute: ActivatedRoute,
    private gameFacade: GameFacade
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe(console.log);
  }

  openGameDetails(id: number) {}

  sortBy(sort: string) {
    // this.gameFacade.updateFilters()
  }
}
