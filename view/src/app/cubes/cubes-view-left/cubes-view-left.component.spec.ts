import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CubesViewLeftComponent } from './cubes-view-left.component';

describe('CubesViewLeftComponent', () => {
  let component: CubesViewLeftComponent;
  let fixture: ComponentFixture<CubesViewLeftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CubesViewLeftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CubesViewLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
