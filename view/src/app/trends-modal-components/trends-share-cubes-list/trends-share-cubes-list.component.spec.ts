import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendsShareCubesListComponent } from './trends-share-cubes-list.component';

describe('TrendsShareCubesListComponent', () => {
  let component: TrendsShareCubesListComponent;
  let fixture: ComponentFixture<TrendsShareCubesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrendsShareCubesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendsShareCubesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
