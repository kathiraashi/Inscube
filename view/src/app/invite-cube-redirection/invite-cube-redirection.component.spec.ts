import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InviteCubeRedirectionComponent } from './invite-cube-redirection.component';

describe('InviteCubeRedirectionComponent', () => {
  let component: InviteCubeRedirectionComponent;
  let fixture: ComponentFixture<InviteCubeRedirectionComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InviteCubeRedirectionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InviteCubeRedirectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
