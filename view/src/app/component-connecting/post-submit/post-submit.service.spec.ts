import { TestBed, inject } from '@angular/core/testing';

import { PostSubmitService } from './post-submit.service';

describe('PostSubmitService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PostSubmitService]
    });
  });

  it('should be created', inject([PostSubmitService], (service: PostSubmitService) => {
    expect(service).toBeTruthy();
  }));
});
