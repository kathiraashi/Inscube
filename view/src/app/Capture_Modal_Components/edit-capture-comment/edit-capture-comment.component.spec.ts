import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCaptureCommentComponent } from './edit-capture-comment.component';

describe('EditCaptureCommentComponent', () => {
  let component: EditCaptureCommentComponent;
  let fixture: ComponentFixture<EditCaptureCommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditCaptureCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditCaptureCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
