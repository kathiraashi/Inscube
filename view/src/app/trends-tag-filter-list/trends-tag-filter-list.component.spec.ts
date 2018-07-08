import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendsTagFilterListComponent } from './trends-tag-filter-list.component';

describe('TrendsTagFilterListComponent', () => {
  let component: TrendsTagFilterListComponent;
  let fixture: ComponentFixture<TrendsTagFilterListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrendsTagFilterListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendsTagFilterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
