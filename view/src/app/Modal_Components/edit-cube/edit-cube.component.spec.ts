import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCubeComponent } from './edit-cube.component';

describe('EditCubeComponent', () => {
  let component: EditCubeComponent;
  let fixture: ComponentFixture<EditCubeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCubeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCubeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
