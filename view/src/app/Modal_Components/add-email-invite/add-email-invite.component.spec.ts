import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddEmailInviteComponent } from './add-email-invite.component';

describe('AddEmailInviteComponent', () => {
  let component: AddEmailInviteComponent;
  let fixture: ComponentFixture<AddEmailInviteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddEmailInviteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddEmailInviteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
