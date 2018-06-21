import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptureEditComponent } from './capture-edit.component';

describe('CaptureEditComponent', () => {
  let component: CaptureEditComponent;
  let fixture: ComponentFixture<CaptureEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaptureEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaptureEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
