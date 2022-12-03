import { Component } from '@angular/core';
import { env } from 'src/environments/environment';
console.log(env);
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {}
