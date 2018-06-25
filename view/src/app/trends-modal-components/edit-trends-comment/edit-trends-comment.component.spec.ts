import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTrendsCommentComponent } from './edit-trends-comment.component';

describe('EditTrendsCommentComponent', () => {
  let component: EditTrendsCommentComponent;
  let fixture: ComponentFixture<EditTrendsCommentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTrendsCommentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTrendsCommentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
