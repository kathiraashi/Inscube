import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedsHeaderComponent } from './feeds-header.component';

describe('FeedsHeaderComponent', () => {
  let component: FeedsHeaderComponent;
  let fixture: ComponentFixture<FeedsHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedsHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedsHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
