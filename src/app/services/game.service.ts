import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  distinctUntilChanged,
  map,
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
  private filters = new BehaviorSubject<Record<string, string>>({});
  private search = new BehaviorSubject<string>('');
  private ordering = new BehaviorSubject<string>('');

  private readonly ALLOWED_FILTERS = [
    'name',
    'released',
    'added',
    'created',
    'updated',
    'rating',
    'metacritic',
  ];

  games$ = this.games.asObservable();
  filters$ = this.filters.asObservable();
  search$ = this.search.asObservable().pipe(distinctUntilChanged());
  ordering$ = this.ordering.asObservable().pipe(distinctUntilChanged());

  constructor(private http: HttpClient) {
    combineLatest([this.filters$, this.search$, this.ordering$])
      .pipe(
        switchMap(([filters, search, ordering]) => {
          let params = new HttpParams();

          if (Object.values(filters).length) {
            Object.entries(filters).forEach(([filterName, filterValue]) => {
              params = params.set(filterName, filterValue);
            });
          }

          if (search) {
            params = params.set('search', search);
          }

          if (ordering) {
            params = params.set('ordering', ordering);
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

  updateFilters(filters: Record<string, string>) {
    this.filters.next({ ...filters });
  }

  updateOrdering(ordering: string) {
    this.ordering.next(ordering);
  }

  getAllowedFilters() {
    return [...this.ALLOWED_FILTERS];
  }
}
