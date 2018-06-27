import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTrendsComponent } from './edit-trends.component';

describe('EditTrendsComponent', () => {
  let component: EditTrendsComponent;
  let fixture: ComponentFixture<EditTrendsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTrendsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
