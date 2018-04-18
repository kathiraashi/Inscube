import { TestBed, inject } from '@angular/core/testing';

import { CubeViewRelatedService } from './cube-view-related.service';

describe('CubeViewRelatedService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CubeViewRelatedService]
    });
  });

  it('should be created', inject([CubeViewRelatedService], (service: CubeViewRelatedService) => {
    expect(service).toBeTruthy();
  }));
});
