import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedsTrendsComponent } from './feeds-trends.component';

describe('FeedsTrendsComponent', () => {
  let component: FeedsTrendsComponent;
  let fixture: ComponentFixture<FeedsTrendsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedsTrendsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedsTrendsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
