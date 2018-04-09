import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedsCenterComponent } from './feeds-center.component';

describe('FeedsCenterComponent', () => {
  let component: FeedsCenterComponent;
  let fixture: ComponentFixture<FeedsCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedsCenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedsCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
