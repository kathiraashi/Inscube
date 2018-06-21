import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportCaptureComponent } from './report-capture.component';

describe('ReportCaptureComponent', () => {
  let component: ReportCaptureComponent;
  let fixture: ComponentFixture<ReportCaptureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReportCaptureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportCaptureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
