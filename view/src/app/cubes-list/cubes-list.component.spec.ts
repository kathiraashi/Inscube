import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CubesListComponent } from './cubes-list.component';

describe('CubesListComponent', () => {
  let component: CubesListComponent;
  let fixture: ComponentFixture<CubesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CubesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CubesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
