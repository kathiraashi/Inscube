import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptureEmoteAddComponent } from './capture-emote-add.component';

describe('CaptureEmoteAddComponent', () => {
  let component: CaptureEmoteAddComponent;
  let fixture: ComponentFixture<CaptureEmoteAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaptureEmoteAddComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaptureEmoteAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
