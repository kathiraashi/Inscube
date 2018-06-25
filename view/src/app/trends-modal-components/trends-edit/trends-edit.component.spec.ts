import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendsEditComponent } from './trends-edit.component';

describe('TrendsEditComponent', () => {
  let component: TrendsEditComponent;
  let fixture: ComponentFixture<TrendsEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrendsEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendsEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
