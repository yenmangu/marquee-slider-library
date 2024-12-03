import { TestBed } from '@angular/core/testing';

import { IntersectionObserverService } from './intersection-observer.service';

describe('MarqueeServiceService', () => {
	let service: IntersectionObserverService;

	beforeEach(() => {
		TestBed.configureTestingModule({});
		service = TestBed.inject(IntersectionObserverService);
	});

	it('should be created', () => {
		expect(service).toBeTruthy();
	});
});
