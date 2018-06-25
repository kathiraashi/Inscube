import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportTrendsCommentComponent } from './report-trends-comment.component';

describe('ReportTrendsCommentComponent', () => {
  let component: ReportTrendsCommentComponent;
  let fixture: ComponentFixture<ReportTrendsCommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportTrendsCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportTrendsCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
