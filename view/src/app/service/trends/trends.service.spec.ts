import { TestBed, inject } from '@angular/core/testing';

import { TrendsService } from './trends.service';

describe('TrendsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TrendsService]
    });
  });

  it('should be created', inject([TrendsService], (service: TrendsService) => {
    expect(service).toBeTruthy();
  }));
});
