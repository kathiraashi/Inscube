import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostShareCubesListComponent } from './post-share-cubes-list.component';

describe('PostShareCubesListComponent', () => {
  let component: PostShareCubesListComponent;
  let fixture: ComponentFixture<PostShareCubesListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostShareCubesListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostShareCubesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
