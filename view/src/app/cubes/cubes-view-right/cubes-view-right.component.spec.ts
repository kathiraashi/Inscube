import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CubesViewRightComponent } from './cubes-view-right.component';

describe('CubesViewRightComponent', () => {
  let component: CubesViewRightComponent;
  let fixture: ComponentFixture<CubesViewRightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CubesViewRightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CubesViewRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
