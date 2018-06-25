import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TrendsEmoteAddComponent } from './trends-emote-add.component';

describe('TrendsEmoteAddComponent', () => {
  let component: TrendsEmoteAddComponent;
  let fixture: ComponentFixture<TrendsEmoteAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TrendsEmoteAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TrendsEmoteAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
