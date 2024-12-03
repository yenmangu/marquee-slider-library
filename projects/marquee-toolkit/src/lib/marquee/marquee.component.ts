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
	ChangeDetectorRef,
	computed,
	signal
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
import { Subject, Subscription, takeUntil } from 'rxjs';

@Component({
	selector: 'mt-marquee-internal',
	imports: [CommonModule, FormsModule],
	templateUrl: './marquee.component.html',
	styleUrl: './marquee.component.css'
})
export class MarqueeComponent
	implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
	@ViewChild('wrapper') wrapper!: ElementRef;
	public square: boolean = true;
	public renderedImages = signal<RenderedImage[]>([]);

	public updatedImages = computed(() => {
		const intersecting = this.intersectionService.intersecting();
		const currentImages = this.renderedImages().length
			? [...this.renderedImages()]
			: [];
		return this._updateRenderedImages(currentImages, intersecting);
	});

	@Input() images: MarqueeImage[] = SAMPLE_IMAGES;
	@Input() height!: number;
	@Input() width!: number;
	@Input() gutter!: number;
	@Input() speed!: number;
	@Input() reverse!: boolean;
	@Input() imageStyle!: ImageStyle;
	@Input() usingSample!: boolean;

	private _colors = ['#f38630', '#6fb936', '#ccc', '#6fb936'];
	private _observer: IntersectionObserver | null = null;
	private _subscription: Subscription | null = null;
	private _destroy$ = new Subject<void>();
	private _wrapperWidthWithBuffer!: number;

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

	private intersectionObserver!: IntersectionObserver;

	constructor(
		private marqueeService: MarqueeToolkitService,
		private intersectionService: IntersectionObserverService,
		private renderer: Renderer2,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.images.forEach(image => console.log('Image url: ', image.src));
		if (this.square) {
			this.height = this.width;
		}
	}

	ngAfterViewInit(): void {
		this._getWrapperWidthWithBuffer();
		this._setWrapperWidthWithBuffer();
		this.renderedImages.set(
			this.marqueeService.initialiseRenderedArray(this.images, {
				width: this.width,
				gutter: this.gutter
			})
		);
		this.cdr.detectChanges();

		const elementsToObserve = Array.from(
			document.querySelectorAll('.marquee-item')
		) as ElementWithDataKey[];
		console.log('Found elements: ', elementsToObserve.length);

		elementsToObserve.forEach(el => {
			if (!el.dataset.key) {
				console.error('Element is missing data-key attribute');
			}
			console.log('El: ', el);
		});
		this.intersectionService.observeElements(elementsToObserve);

		console.log('intersecting: ', this.intersectionService.intersecting());
	}

	// private __updateRenderedImages(
	// 	images: RenderedImage[],
	// 	intersecting: Set<ElementWithDataKey>
	// ): RenderedImage[] {
	// 	console.log('Invoked _updateRenderedImages');

	// 	const updatedImages = images.map(arr => [...arr]);
	// 	intersecting.forEach((element: ElementWithDataKey) => {
	// 		outerLoop: for (let i = 0; i < updatedImages.length; i++) {
	// 			console.log('Intersecting: ', element);
	// 			const array = updatedImages[i];
	// 			const index = array.findIndex(
	// 				img =>
	// 					img.dataKey === element.dataset.key &&
	// 					img.groupIndex === element.dataset.array
	// 			);
	// 			if (index >= 0) {
	// 				const [shifted] = array.splice(index, 1);
	// 				updatedImages[updatedImages.length - 1].push(shifted);
	// 				break outerLoop;
	// 			}
	// 		}
	// 	});
	// 	return updatedImages;
	// }

	private _updateRenderedImages(
		images: RenderedImage[],
		intersectingSet: Set<ElementWithDataKey>
	): RenderedImage[] {
		const updatedImages: RenderedImage[] = [];

		return updatedImages;
	}

	// handleIntersectingChanges(intersecting: Set<ElementWithDataKey>) {
	// 	console.log('Intersecting elements: ', intersecting);

	// 	const updatedImages = [...this.renderedImages()];
	// }

	ngOnChanges(changes: SimpleChanges): void {}

	private _getWrapperWidthWithBuffer(): void {
		const wrapperEl = this.wrapper.nativeElement as HTMLElement;
		const width = wrapperEl.offsetWidth;
		console.log('Width: ', width);

		this._wrapperWidthWithBuffer = width * 1.2 || 0;
	}

	private _setWrapperWidthWithBuffer() {
		this.marqueeService.wrapperWidthPx = this._wrapperWidthWithBuffer;
	}

	ngOnDestroy(): void {
		this._destroy$.next();
		this._destroy$.complete();
		this.intersectionService.disconnectObserver();
	}
}
