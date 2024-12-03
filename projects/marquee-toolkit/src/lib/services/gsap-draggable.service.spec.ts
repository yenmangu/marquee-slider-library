import { TestBed } from '@angular/core/testing';

import { GsapDraggableService } from './gsap-draggable.service';

describe('GsapDraggableService', () => {
  let service: GsapDraggableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GsapDraggableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
