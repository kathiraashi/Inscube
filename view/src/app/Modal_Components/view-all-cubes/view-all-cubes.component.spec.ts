import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllCubesComponent } from './view-all-cubes.component';

describe('ViewAllCubesComponent', () => {
  let component: ViewAllCubesComponent;
  let fixture: ComponentFixture<ViewAllCubesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewAllCubesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAllCubesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
