import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectMoreCubesComponent } from './select-more-cubes.component';

describe('SelectMoreCubesComponent', () => {
  let component: SelectMoreCubesComponent;
  let fixture: ComponentFixture<SelectMoreCubesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SelectMoreCubesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectMoreCubesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
