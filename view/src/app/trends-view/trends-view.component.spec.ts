import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendsViewComponent } from './trends-view.component';

describe('TrendsViewComponent', () => {
  let component: TrendsViewComponent;
  let fixture: ComponentFixture<TrendsViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrendsViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
