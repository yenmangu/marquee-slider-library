import {
	Component,
	EventEmitter,
	Input,
	OnChanges,
	OnInit,
	Output,
	OnDestroy,
	SimpleChanges,
	ElementRef,
	ViewChild,
	Renderer2,
	AfterViewInit,
	AfterContentInit,
	ChangeDetectorRef,
	computed,
	signal,
	ViewChildren,
	QueryList
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MarqueeToolkitService } from '../services/marquee-toolkit.service';
import { IntersectionObserverService } from '../services/intersection-observer.service';
import { SAMPLE_IMAGES } from '../../data/sample-images';
import {
	MarqueeImage,
	ImageStyle,
	RenderedImage,
	ElementWithDataKey
} from '../../types/marquee-config';
import { findIndex, Subject, Subscription, takeUntil } from 'rxjs';

@Component({
	selector: 'mt-marquee-internal',
	imports: [CommonModule, FormsModule],
	templateUrl: './marquee.component.html',
	styleUrl: './marquee.component.css'
})
export class MarqueeComponent
	implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
	@ViewChild('wrapper', { static: false }) wrapper!: ElementRef;
	@ViewChild('marquee', { static: false }) marquee!: ElementRef;
	@ViewChildren('marqueeItem', { read: ElementRef })
	marqueeItems!: QueryList<ElementRef>;
	public square: boolean = true;
	// public renderedImages = signal<RenderedImage[]>([]);
	public renderedImages: RenderedImage[] = [];
	public pauseText: 'play' | 'pause' = 'pause';
	private _paused: boolean = false;

	public updatedImages: RenderedImage[] = [];

	public itemList: ElementWithDataKey[] = [];

	// public updatedImages = computed(() => {
	// 	const intersecting = this.intersectionService.intersecting();
	// 	const currentImages = this.renderedImages().length
	// 		? [...this.renderedImages()]
	// 		: [];
	// 	return this._updateRenderedImages(currentImages, intersecting);
	// });

	@Input() images: MarqueeImage[] = SAMPLE_IMAGES;
	@Input() height!: number;
	@Input() width!: number;
	@Input() gutter!: number;
	@Input() speed!: number;
	@Input() reverse!: boolean;
	@Input() imageStyle!: ImageStyle;
	@Input() usingSample!: boolean;

	private _resizeObserver!: ResizeObserver;

	private _colors = ['#f38630', '#6fb936', '#ccc', '#6fb936'];
	private _observer: IntersectionObserver | null = null;
	private _subscription: Subscription | null = null;
	private _destroy$ = new Subject<void>();
	_wrapperWidthWithBuffer!: number;
	private _currentIntersecting: Set<ElementWithDataKey> = new Set();

	/**
	 * @description
	 * The threshold percentage (as a decimal) for when the image is considered "in view".
	 * Value should be between 0 and 1
	 */
	@Input()
	intersectionThreshold: number = 0.5;

	@Output() ImageInView = new EventEmitter<{
		image: MarqueeImage;
		inView: Boolean;
	}>();

	private _intersectionObserver: IntersectionObserver | null = null;
	private _buffer: number = 1.2;

	constructor(
		public marqueeService: MarqueeToolkitService,
		private renderer: Renderer2,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		if (this.square) {
			this.height = this.width;
		}
	}

	ngAfterViewInit(): void {
		this._readAndSetWrapperWidth();
		this.marqueeService.initialiseArrayValues(
			this.images,
			{
				width: this.width,
				gutter: this.gutter
			},
			this._wrapperWidthWithBuffer
		);
		this._updateMarquee();

		this.marqueeItems.changes.subscribe(() => {
			const elements = this._getElementsToObserve(this.marqueeItems);
			console.log('Elements: ', elements);
			this._setupIntersectionObserver(elements);
		});
		// always here
		this.cdr.detectChanges();
	}

	// private _getMarqueeItemChanges() {
	// 	let itemList: ElementWithDataKey[];
	// 	this.marqueeItems.changes.subscribe((items: QueryList<ElementRef>) => {
	// 		itemList = this._getElementsToObserve(items);
	// 	});
	// }

	private _getElementsToObserve(
		items: QueryList<ElementRef>
	): ElementWithDataKey[] {
		console.log('Elements to observe invoked');
		const array: ElementWithDataKey[] = [];
		items.forEach(item => {
			const element = item.nativeElement as ElementWithDataKey;
			array.push(element);
		});

		return array;
	}

	// private _setupIntersectionObserver(elementsToObserve: ElementWithDataKey[]) {
	// 	// const elementsToObserve = Array.from(
	// 	// 	document.querySelectorAll('.marquee-item')
	// 	// ) as ElementWithDataKey[];
	// 	this._intersectionObserver = new IntersectionObserver(
	// 		([entry]: IntersectionObserverEntry[]) => {
	// 			const target = entry.target as ElementWithDataKey;
	// 			const foundRendered = this._findRenderedImage(target);
	// 			if (entry.isIntersecting) {
	// 				console.log('Intersecting');
	// 				console.log('Entry: ', entry);

	// 				this._currentIntersecting.add(target);
	// 				this._flagAsIntersecting(target, foundRendered, true);
	// 			}
	// 			if (!entry.isIntersecting) {
	// 				this._currentIntersecting.delete(target);
	// 				this._flagAsIntersecting(target, foundRendered, false);
	// 			}
	// 			this._updateRenderedImages(foundRendered);
	// 		},
	// 		{ threshold: 0.1, root: null },

	// 	);
	// 	elementsToObserve.forEach(el => {
	// 		if (this._intersectionObserver) {
	// 			this._intersectionObserver.observe(el);
	// 		}
	// 	});
	// }

	private _setupIntersectionObserver(elementsToObserve: ElementWithDataKey[]) {
		console.log(
			'Elements to observe in setupIntersectionObserver: ',
			elementsToObserve
		);

		this._intersectionObserver = new IntersectionObserver(
			this._handleIntersection.bind(this),
			{
				threshold: 0.9,
				root: null
			}
		);

		elementsToObserve.forEach(el => {
			if (this._intersectionObserver) {
				this._intersectionObserver.observe(el);
			}
		});
		// throw new Error('Method not implemented.');
	}

	private _handleIntersection([entry]: IntersectionObserverEntry[]) {
		const target = entry.target as ElementWithDataKey;
		const foundRendered = this._findRenderedImage(target);
		if (entry.isIntersecting) {
			if (target.dataset.intersecting === 'false') {
				console.log('target entering intersection area');
				this._onIntersecting(target);
				this._flagIntersection(target, foundRendered, true);
				// add target specific
			}
		} else {
			if (target.dataset.intersecting === 'true') {
				console.log('Target leaving intersection area');
				this._intersectingFinished(target);
				this._flagIntersection(target, foundRendered, false);
				this._updateRenderedImages(foundRendered);
			}
			// add target specific
		}
	}
	private _findPreviousIndex() {
		throw new Error('Method not implemented.');
	}
	private _handleItemShift() {}

	private _onIntersecting(entryTarget: ElementWithDataKey) {
		// console.log('Entry intersecting: ', entryTarget);
		this._currentIntersecting.add(entryTarget);
	}

	private _intersectingFinished(entryTarget: ElementWithDataKey) {
		console.log(entryTarget, ' finished intersecting');
		this._currentIntersecting.delete(entryTarget);
	}

	private _flagIntersection(
		target: ElementWithDataKey,
		marqueeItem: RenderedImage,
		intersecting: boolean
	) {
		const intersectingText = intersecting ? 'true' : 'false';
		target.dataset.intersecting = intersectingText;
		marqueeItem.dataIntersecting = intersecting;
	}

	private _findRenderedImage(target: ElementWithDataKey): RenderedImage {
		const found = this.renderedImages.find(
			image => image.dataKey === target.dataset.key
		);
		if (found) {
			return found;
		}
		throw new Error('Error finding matching DOM Node');
	}

	private _updateRenderedImages(marqueeItem: RenderedImage): void {
		console.log('updateRenderedImages invoked');

		const index = this.renderedImages.indexOf(marqueeItem);
		const previousIndex =
			(index - 1 + this.renderedImages.length) % this.renderedImages.length;
		this._shiftPreviousToEnd(previousIndex);
	}

	private _shiftPreviousToEnd(previousIndex: number): void {
		const splicedImage = this.renderedImages.slice(previousIndex, 1)[0];
		this.renderedImages.push(splicedImage);
		this.cdr.detectChanges();
	}

	ngOnChanges(changes: SimpleChanges): void {}

	private _readAndSetWrapperWidth(): void {
		let observedWidthValue: number;
		const wrapperElement = this.wrapper?.nativeElement as HTMLElement;
		if (!wrapperElement) {
			console.log('Error');
			throw new Error('Error obtaining wrapper element ref');
		}
		observedWidthValue = wrapperElement.getBoundingClientRect().width;
		observedWidthValue = this._applyWidthBuffer(observedWidthValue);
		this._updateWidthValue(observedWidthValue);
		this._observeWrapperWidthChanges(wrapperElement);
	}

	private _observeWrapperWidthChanges(wrapperElement: HTMLElement) {
		if (this._resizeObserver) {
			this._resizeObserver.disconnect();
		}
		let resizeTimeout: any;
		this._resizeObserver = new ResizeObserver(([entry]) => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				try {
					const observedWidthValue = this._applyWidthBuffer(
						entry.contentRect.width
					);
					this._updateWidthValue(observedWidthValue);
				} catch (error) {
					console.error('Error observing wrapper width changes: ', error);
				}
			}, 50);
		});
		this._resizeObserver.observe(wrapperElement);
	}

	private _applyWidthBuffer(observedWidth: number): number {
		return observedWidth * this._buffer;
	}

	private _updateWidthValue(observedWidthWithBuffer: number) {
		if (observedWidthWithBuffer === this._wrapperWidthWithBuffer) {
			return;
		}
		this._wrapperWidthWithBuffer = observedWidthWithBuffer;
		this.marqueeService.updateWidth(this._wrapperWidthWithBuffer);
		this._updateMarquee();
	}

	private _updateMarquee() {
		this._setRenderedImages(this._wrapperWidthWithBuffer);
	}

	private _setRenderedImages(newWidth: number) {
		this.renderedImages = this.marqueeService.updateRenderedArray();
		this.cdr.detectChanges();
	}

	pause(): any {
		this._paused = !this._paused;
		// const marquee = this.marquee.nativeElement as HTMLElement;
		// marquee.style.animationPlayState = 'paused';
		this.pauseText = this._paused ? 'play' : 'pause';
	}

	ngOnDestroy(): void {
		this._destroy$.next();
		this._destroy$.complete();
		if (this._intersectionObserver) {
			this._intersectionObserver.disconnect();
			this._intersectionObserver = null;
		}
		if (this._resizeObserver) {
			this._resizeObserver.disconnect();
		}
	}
}
