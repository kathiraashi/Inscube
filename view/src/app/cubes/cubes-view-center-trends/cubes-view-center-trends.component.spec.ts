import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CubesViewCenterTrendsComponent } from './cubes-view-center-trends.component';

describe('CubesViewCenterTrendsComponent', () => {
  let component: CubesViewCenterTrendsComponent;
  let fixture: ComponentFixture<CubesViewCenterTrendsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CubesViewCenterTrendsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CubesViewCenterTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
