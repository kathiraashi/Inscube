import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptureShareCubesListComponent } from './capture-share-cubes-list.component';

describe('CaptureShareCubesListComponent', () => {
  let component: CaptureShareCubesListComponent;
  let fixture: ComponentFixture<CaptureShareCubesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaptureShareCubesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaptureShareCubesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
