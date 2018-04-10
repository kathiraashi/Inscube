import { TestBed, inject } from '@angular/core/testing';

import { DataSharedVarServiceService } from './data-shared-var-service.service';

describe('DataSharedVarServiceService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DataSharedVarServiceService]
    });
  });

  it('should be created', inject([DataSharedVarServiceService], (service: DataSharedVarServiceService) => {
    expect(service).toBeTruthy();
  }));
});
