import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTrendsComponent } from './report-trends.component';

describe('ReportTrendsComponent', () => {
  let component: ReportTrendsComponent;
  let fixture: ComponentFixture<ReportTrendsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportTrendsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
