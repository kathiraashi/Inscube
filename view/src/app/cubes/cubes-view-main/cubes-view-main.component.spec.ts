import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CubesViewMainComponent } from './cubes-view-main.component';

describe('CubesViewMainComponent', () => {
  let component: CubesViewMainComponent;
  let fixture: ComponentFixture<CubesViewMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CubesViewMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CubesViewMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
