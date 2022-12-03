import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  map,
  Observable,
  Subject,
  switchMap,
  tap,
} from 'rxjs';
import { env } from 'src/environments/environment';
import { APIResponse, Game } from '../models/game';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  private games = new BehaviorSubject<Game[]>([]);
  private filter = new BehaviorSubject<string>('');
  private search = new BehaviorSubject<string>('');

  games$ = this.games.asObservable();
  filter$ = this.filter.asObservable();
  search$ = this.search.asObservable();

  constructor(private http: HttpClient) {
    combineLatest([this.filter$, this.search$])
      .pipe(
        switchMap(([filter, search]) => {
          let params = new HttpParams().set('ordering', filter);

          if (search.trim()) {
            params.set('search', search);
          }

          return this.http.get<APIResponse<Game>>(`${env.BASE_URL}/games`, {
            params,
          });
        }),
        tap(console.log),
        map(({ results }) => results),
        // notify subscribers
        tap((results) => this.games.next([...results]))
      )
      .subscribe();
  }

  updateSearch(search: string) {
    this.search.next(search);
  }

  updateFilters(filter: string) {
    this.filter.next(filter);
  }
}
