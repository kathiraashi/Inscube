import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedsCaptureComponent } from './feeds-capture.component';

describe('FeedsCaptureComponent', () => {
  let component: FeedsCaptureComponent;
  let fixture: ComponentFixture<FeedsCaptureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedsCaptureComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedsCaptureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
