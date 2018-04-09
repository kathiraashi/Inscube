import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedsRightComponent } from './feeds-right.component';

describe('FeedsRightComponent', () => {
  let component: FeedsRightComponent;
  let fixture: ComponentFixture<FeedsRightComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeedsRightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeedsRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
