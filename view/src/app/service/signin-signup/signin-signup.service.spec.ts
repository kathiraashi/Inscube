import { TestBed, inject } from '@angular/core/testing';

import { SigninSignupService } from './signin-signup.service';

describe('SigninSignupService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SigninSignupService]
    });
  });

  it('should be created', inject([SigninSignupService], (service: SigninSignupService) => {
    expect(service).toBeTruthy();
  }));
});
