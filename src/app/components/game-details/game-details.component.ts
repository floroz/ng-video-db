import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { tap } from 'rxjs';
import { GameDetailsFacade } from 'src/app/services/game-details.facade';

@Component({
  selector: 'app-game-details',
  templateUrl: './game-details.component.html',
  styleUrls: ['./game-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameDetailsComponent implements OnInit {
  game$ = this.facade.selectedGame$.pipe(
    tap((game) => game && this.title.setTitle(`${game.name} | Videogames DB`))
  );
  loading$ = this.facade.loadingGame$;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private facade: GameDetailsFacade,
    private title: Title
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (!params['id']) {
        this.router.navigate(['']);
      } else {
        this.facade.findGame(params['id']);
      }
    });
  }
}
