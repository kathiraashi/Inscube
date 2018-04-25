import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PasswordResetRedirectionComponent } from './password-reset-redirection.component';

describe('PasswordResetRedirectionComponent', () => {
  let component: PasswordResetRedirectionComponent;
  let fixture: ComponentFixture<PasswordResetRedirectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PasswordResetRedirectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordResetRedirectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
