import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarqueeToolkitComponent } from './marquee-toolkit.component';

describe('MarqueeToolkitComponent', () => {
  let component: MarqueeToolkitComponent;
  let fixture: ComponentFixture<MarqueeToolkitComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarqueeToolkitComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarqueeToolkitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
