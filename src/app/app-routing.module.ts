import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameDetailsComponent } from './components/game-details/game-details.component';
import { HomeComponent } from './components/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'search/:gameName',
    component: HomeComponent,
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
