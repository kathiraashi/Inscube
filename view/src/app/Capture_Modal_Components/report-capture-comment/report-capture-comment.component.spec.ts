import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCaptureCommentComponent } from './report-capture-comment.component';

describe('ReportCaptureCommentComponent', () => {
  let component: ReportCaptureCommentComponent;
  let fixture: ComponentFixture<ReportCaptureCommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportCaptureCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportCaptureCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
