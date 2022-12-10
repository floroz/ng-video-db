import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { GameSearchService } from './game-search.service';

describe('GameService', () => {
  let service: GameSearchService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(GameSearchService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
