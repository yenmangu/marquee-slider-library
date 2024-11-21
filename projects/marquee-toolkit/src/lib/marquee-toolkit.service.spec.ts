import { TestBed } from '@angular/core/testing';

import { MarqueeToolkitService } from './marquee-toolkit.service';

describe('MarqueeToolkitService', () => {
  let service: MarqueeToolkitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MarqueeToolkitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
