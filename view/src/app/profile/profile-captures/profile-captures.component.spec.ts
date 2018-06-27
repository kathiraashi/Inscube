import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileCapturesComponent } from './profile-captures.component';

describe('ProfileCapturesComponent', () => {
  let component: ProfileCapturesComponent;
  let fixture: ComponentFixture<ProfileCapturesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileCapturesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileCapturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
