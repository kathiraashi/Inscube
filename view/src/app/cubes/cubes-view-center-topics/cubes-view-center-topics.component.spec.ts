import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CubesViewCenterTopicsComponent } from './cubes-view-center-topics.component';

describe('CubesViewCenterTopicsComponent', () => {
  let component: CubesViewCenterTopicsComponent;
  let fixture: ComponentFixture<CubesViewCenterTopicsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CubesViewCenterTopicsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CubesViewCenterTopicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
