import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CubesViewCenterFeedsComponent } from './cubes-view-center-feeds.component';

describe('CubesViewCenterFeedsComponent', () => {
  let component: CubesViewCenterFeedsComponent;
  let fixture: ComponentFixture<CubesViewCenterFeedsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CubesViewCenterFeedsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CubesViewCenterFeedsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
