import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CubesViewCenterCapturesComponent } from './cubes-view-center-captures.component';

describe('CubesViewCenterCapturesComponent', () => {
  let component: CubesViewCenterCapturesComponent;
  let fixture: ComponentFixture<CubesViewCenterCapturesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CubesViewCenterCapturesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CubesViewCenterCapturesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
