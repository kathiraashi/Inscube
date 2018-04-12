import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmoteAddComponent } from './emote-add.component';

describe('EmoteAddComponent', () => {
  let component: EmoteAddComponent;
  let fixture: ComponentFixture<EmoteAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmoteAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmoteAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
