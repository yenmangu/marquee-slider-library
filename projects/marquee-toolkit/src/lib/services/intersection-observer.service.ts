import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ElementWithDataKey } from '../../public-api';

@Injectable({
	providedIn: 'root'
})
export class IntersectionObserverService {
	public wrapperElement: Element | null = null;

	private _customCallback: IntersectionObserverCallback | null = null;
	private intersectingElements = signal<Set<ElementWithDataKey>>(new Set());

	private observer: IntersectionObserver | null = null;
	constructor() {
		this._setupIntersectionObserver();
	}

	get intersecting() {
		return this.intersectingElements.asReadonly();
	}

	private _defaultCallback(
		[entry]: IntersectionObserverEntry[],
		// entries: IntersectionObserverEntry[],
		observer: IntersectionObserver
	): void {
		// console.log('Invoked default callback');

		const target = entry.target as ElementWithDataKey;
		const intersecting = new Set(this.intersectingElements());
		if (!target.dataset.key) {
			console.error('Observed element is missing data-key attribute', target);
		}
		if (entry.isIntersecting) {
			intersecting.add(target);
			target.dataset.intersecting = 'true';
		} else {
			intersecting.delete(target);
			target.dataset.intersecting = 'false';
		}
		this.intersectingElements.set(intersecting);

		// entries.forEach(entry => {
		// 	const target = entry.target as ElementWithDataKey;
		// 	// console.log('target: ', target);

		// 	if (!target.dataset.key) {
		// 		console.error('Observed element is missing data-key attribute', target);
		// 	}
		// 	const intersecting = new Set(this.intersectingElements());
		// 	if (entry.isIntersecting) {
		// 		intersecting.add(target);
		// 		target.dataset.intersecting = 'true';
		// 	} else {
		// 		intersecting.delete(target);
		// 		target.dataset.intersecting = 'false';
		// 	}
		// 	this.intersectingElements.set(intersecting);
		// });
	}

	public setupIntersectionObserver(customCallback?: IntersectionObserverCallback) {
		this._customCallback = customCallback ?? null;
		this._setupIntersectionObserver();
	}

	private _setupIntersectionObserver(
		options: IntersectionObserverInit = { threshold: 0.1, root: null },
		customCallback?: IntersectionObserverCallback
	): void {
		console.log('Creating IntersectionObserver with options:', options); // Log observer creation

		if (this.observer) {
			this.observer.disconnect();
		}
		const combinedCallback: IntersectionObserverCallback = (entries, observer) => {
			//
			// Always execute default callback first
			// console.log('Intersection Observer Triggered', entries); // Log to ensure it's being triggered

			this._defaultCallback(entries, observer);

			// Then execute custom callback if provided
			if (customCallback) {
				customCallback(entries, observer);
			}
		};
		this.observer = new IntersectionObserver(combinedCallback, options);
	}

	public observeElements(elements: ElementWithDataKey[]): void {
		if (!this.observer) {
			throw new Error('IntersectionObserver not set up.');
		}
		elements.forEach((el: ElementWithDataKey) => {
			// console.log('observed element: ', el);

			this.observer?.observe(el);
		});
	}

	public disconnectObserver(): void {
		this.observer?.disconnect();
		this.observer = null;
	}
}
