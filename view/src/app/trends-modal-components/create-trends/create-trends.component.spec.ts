import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTrendsComponent } from './create-trends.component';

describe('CreateTrendsComponent', () => {
  let component: CreateTrendsComponent;
  let fixture: ComponentFixture<CreateTrendsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTrendsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
