import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DiscoverCubesComponent } from './discover-cubes.component';

describe('DiscoverCubesComponent', () => {
  let component: DiscoverCubesComponent;
  let fixture: ComponentFixture<DiscoverCubesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DiscoverCubesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DiscoverCubesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
