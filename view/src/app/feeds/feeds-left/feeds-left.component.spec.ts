import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedsLeftComponent } from './feeds-left.component';

describe('FeedsLeftComponent', () => {
  let component: FeedsLeftComponent;
  let fixture: ComponentFixture<FeedsLeftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedsLeftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedsLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
