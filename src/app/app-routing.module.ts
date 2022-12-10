import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameDetailsComponent } from './components/game-details/game-details.component';
import { GamesComponent } from './components/games/games.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/games' },
  {
    path: 'games',
    component: GamesComponent,
  },
  {
    path: 'games/:id',
    component: GameDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
