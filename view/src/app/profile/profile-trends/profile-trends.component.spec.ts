import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileTrendsComponent } from './profile-trends.component';

describe('ProfileTrendsComponent', () => {
  let component: ProfileTrendsComponent;
  let fixture: ComponentFixture<ProfileTrendsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileTrendsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
