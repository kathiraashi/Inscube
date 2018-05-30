import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertPrivacyUpdateComponent } from './alert-privacy-update.component';

describe('AlertPrivacyUpdateComponent', () => {
  let component: AlertPrivacyUpdateComponent;
  let fixture: ComponentFixture<AlertPrivacyUpdateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AlertPrivacyUpdateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AlertPrivacyUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
