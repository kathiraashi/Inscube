import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailCubeInviteComponent } from './email-cube-invite.component';

describe('EmailCubeInviteComponent', () => {
  let component: EmailCubeInviteComponent;
  let fixture: ComponentFixture<EmailCubeInviteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailCubeInviteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailCubeInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
