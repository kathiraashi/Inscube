import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedsMainComponent } from './feeds-main.component';

describe('FeedsMainComponent', () => {
  let component: FeedsMainComponent;
  let fixture: ComponentFixture<FeedsMainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedsMainComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
