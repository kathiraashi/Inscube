import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfileRightComponent } from './profile-right.component';

describe('ProfileRightComponent', () => {
  let component: ProfileRightComponent;
  let fixture: ComponentFixture<ProfileRightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProfileRightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProfileRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
