import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  public sort!: string;
  public games = [
    {
      id: '',
      background_image: '',
      name: '',
      parent_platforms: [{ platform: { slug: '' } }],
    },
  ];

  openGameDetails(id: string) {}

  searchGames(filter: string) {}
}
