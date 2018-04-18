import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileCenterComponent } from './profile-center.component';

describe('ProfileCenterComponent', () => {
  let component: ProfileCenterComponent;
  let fixture: ComponentFixture<ProfileCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileCenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
