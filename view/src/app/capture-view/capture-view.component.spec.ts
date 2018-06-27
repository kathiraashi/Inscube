import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptureViewComponent } from './capture-view.component';

describe('CaptureViewComponent', () => {
  let component: CaptureViewComponent;
  let fixture: ComponentFixture<CaptureViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaptureViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaptureViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
