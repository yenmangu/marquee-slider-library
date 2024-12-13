import {
	Component,
	Input,
	OnInit,
	OnDestroy,
	ElementRef,
	ViewChild,
	Renderer2,
	AfterViewInit,
	ChangeDetectorRef
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SAMPLE_IMAGES } from '../../data/sample-images';
import {
	MarqueeImage,
	ImageStyle,
	RenderedImage,
	ImageWithDataKey
} from '../../types/marquee-config';
import { MarqueeImageDirective } from '../marquee-image.directive';

@Component({
	selector: 'mt-marquee-internal',
	imports: [CommonModule, FormsModule],
	templateUrl: './marquee.component.html',
	styleUrl: './marquee.component.css'
})
export class MarqueeComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild('marqueeContainer', { static: false }) marqueeContainer!: ElementRef;

	@Input() images: MarqueeImage[] = SAMPLE_IMAGES;
	@Input() containerHeight!: number;
	@Input() imageWidth!: number;
	@Input() gutter!: number;
	@Input() scrollSpeed!: number;
	@Input() reverse!: boolean;
	@Input() imageStyle!: ImageStyle;
	@Input() usingSample!: boolean;

	public marqueeImages: ImageWithDataKey[] = [];
	public square: boolean = true;
	public isPaused: boolean = false;

	private _container!: HTMLElement;
	private _containerWidthWithBuffer!: number;

	private _resizeObserver!: ResizeObserver;
	private _timeoutId: any;
	private _animationFrameId: any;
	private _arrayWidthPx!: number;
	private _repeats!: number;
	private _totalItems!: number;
	private _renderedArray!: RenderedImage[];
	private _currentSpeed!: number;

	constructor(private renderer: Renderer2, private cdr: ChangeDetectorRef) {}

	ngOnInit(): void {
		if (this.square) {
			this.containerHeight = this.imageWidth;
		}
		this._currentSpeed = this.scrollSpeed;
	}

	ngAfterViewInit(): void {
		this._readAndSetContainerWidth();
		this._measureArrayWidthPx();
		this._initMarquee();

		if (this._container) {
			this._animate();
		}
		this.cdr.detectChanges();
	}

	private _initMarquee() {
		this._container = this._initContainer();
		if (this._container) {
			this._repeats = this._calculateRepeats(this._arrayWidthPx);
			const renderedArray = this._buildRepeatedArray(this._repeats);
			this._updateImages(this._container, renderedArray);
			this._renderedArray = renderedArray;
		}
	}

	private _initContainer(): HTMLElement {
		const container = this.marqueeContainer.nativeElement as HTMLElement;
		this.renderer.setStyle(container, 'position', 'relative');
		this.renderer.setStyle(container, 'height', `${this.containerHeight}px`);
		this.renderer.setStyle(container, 'overflow', 'hidden');
		return container;
	}

	private _updateImages(container: HTMLElement, renderedImages: RenderedImage[]) {
		this._clearContainer(container);
		this.marqueeImages = [];
		renderedImages.forEach((src, index) => {
			const gutter = index === 0 ? 0 : this.gutter;
			console.log('Gutter: ', gutter);
			const imagePositionX = (this.imageWidth + gutter) * index;
			const image = this._initSingleImage(src, imagePositionX);
			this.renderer.appendChild(container, image);
			this.marqueeImages.push(image);
		});
	}

	private _measureArrayWidthPx() {
		this._arrayWidthPx = (this.imageWidth + this.gutter) * this.images.length;
	}

	private _initSingleImage(
		src: RenderedImage,
		imagePositionX: number
	): ImageWithDataKey {
		const image: ImageWithDataKey = this.renderer.createElement('img');
		this.renderer.addClass(image, 'marquee-item');
		this.renderer.setStyle(image, 'position', 'absolute');
		this.renderer.setStyle(image, 'left', `${imagePositionX}px`);
		this.renderer.setStyle(image, 'width', `${this.imageWidth}px`);
		this.renderer.setStyle(image, 'height', `${this.containerHeight}px`);
		this.renderer.setAttribute(image, 'src', `${src.src}`);
		this.renderer.setAttribute(image, 'alt', `${src.alt}`);
		this.renderer.setAttribute(image, 'data-key', `${src.dataKey}`);
		this.renderer.setAttribute(image, 'data-array', `${src.groupIndex}`);
		this.renderer.listen(image, 'mouseenter', () => {
			this.togglePause(true);
		});
		this.renderer.listen(image, 'mouseleave', () => {
			this.togglePause(false);
		});
		return image;
	}

	private _applyWidthValue(width: number): number {
		return width * 1.2;
	}

	private _readAndSetContainerWidth() {
		let observedWidthValue: number;
		const container = this.marqueeContainer?.nativeElement as HTMLElement;
		if (!container) {
			console.log('Error');
			throw new Error('Error obtaining wrapper element ref');
		}
		observedWidthValue = container.getBoundingClientRect().width;
		observedWidthValue = this._applyWidthValue(observedWidthValue);
		this._updateWidthValue(observedWidthValue);
		this._observeContainerWidthChanges(container);
	}

	private _updateRenderedArray() {
		const newRepeats = this._calculateRepeats(this._arrayWidthPx);
		const newLength = newRepeats * this.images.length;
		if (this._totalItems === newLength) {
			return this._renderedArray;
		} else {
			this._repeats = newRepeats;
			const newRenderedArray = this._buildRepeatedArray(this._repeats);
			return newRenderedArray;
		}
	}

	private _buildRepeatedArray(totalRepeats: number) {
		const repeatedArray: RenderedImage[] = [];
		const arrayLength = this.images.length;
		this._totalItems = arrayLength * totalRepeats;
		for (let index = 0; index < this._totalItems; index++) {
			const arrayIndex = Math.floor(index / arrayLength);
			const itemIndex = index % arrayLength;
			const item = this.images[itemIndex];
			repeatedArray.push({
				...item,
				id: `index_${index}`,
				groupIndex: `${arrayIndex}`,
				dataKey: `${arrayIndex}_${itemIndex}`
			});
		}
		return repeatedArray;
	}

	private _calculateRepeats(arrayWidthPx: number) {
		const totalArraysNeeded = Math.ceil(
			this._containerWidthWithBuffer / arrayWidthPx
		);
		return totalArraysNeeded;
	}

	private _animate() {
		// if (!this.isPaused) {
		// }
		this._scrollImages();
		this._animationFrameId = requestAnimationFrame(() => this._animate());
	}

	private _scrollImages() {
		const targetSpeed = this.isPaused ? 0 : this.scrollSpeed;
		this._currentSpeed += (targetSpeed - this._currentSpeed) * 0.1;
		this.marqueeImages.forEach((image, index) => {
			const gutter = this.gutter;

			const currentLeft = this._getImageLeftPos(image);

			const newLeft = this.reverse
				? currentLeft + this._currentSpeed
				: currentLeft - this._currentSpeed;

			this._setNewImageLeft(image, newLeft);

			if (this.reverse) {
				if (currentLeft > this._containerWidthWithBuffer) {
					const shiftedImage = this.marqueeImages.pop();
					if (shiftedImage) {
						const firstImage = this.marqueeImages[0];
						const firstImageLeft = this._getImageLeftPos(firstImage);
						const resetLeft = firstImageLeft - this.imageWidth - gutter;

						this._setNewImageLeft(shiftedImage, resetLeft);
						this.marqueeImages.unshift(shiftedImage);
					}
				}
			} else {
				if (currentLeft + this.imageWidth + gutter < 0) {
					const shiftedImage = this.marqueeImages.shift();
					if (shiftedImage) {
						const lastImage = this.marqueeImages[this.marqueeImages.length - 1];
						const lastImageLeft = this._getImageLeftPos(lastImage);
						const resetLeft = lastImageLeft + this.imageWidth + gutter;

						this._setNewImageLeft(shiftedImage, resetLeft);
						this.marqueeImages.push(shiftedImage);
					}
				}
			}
		});
	}

	private _setNewImageLeft(image: ImageWithDataKey, left: number) {
		this.renderer.setStyle(image, 'left', `${left}px`);
	}

	private _getImageLeftPos(image: ImageWithDataKey): number {
		return parseInt(image.style.left, 10) || 0;
	}

	private _observeContainerWidthChanges(container: HTMLElement) {
		if (this._resizeObserver) {
			this._resizeObserver.disconnect();
		}
		let resizeTimeout: any;

		this._resizeObserver = new ResizeObserver(([entry]) => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(() => {
				try {
					const widthWithBuffer = this._applyWidthValue(entry.contentRect.width);
					this._updateWidthValue(widthWithBuffer);
					this._updateMarquee();
				} catch (error) {
					console.error('Error observing wrapper width changes: ', error);
				}
			}, 50);
		});
		this._resizeObserver.observe(container);
		this.cdr.detectChanges();
	}

	private _clearContainer(container: HTMLElement) {
		while (container.firstChild) {
			this.renderer.removeChild(container, container.firstChild);
		}
	}

	private _updateWidthValue(widthWithBuffer: number) {
		if (this._containerWidthWithBuffer === widthWithBuffer) {
			return;
		}
		this._containerWidthWithBuffer = widthWithBuffer;
	}

	private _updateMarquee() {
		const updatedRenderedArray: RenderedImage[] = this._updateRenderedArray();
		this._updateImages(this._container, updatedRenderedArray);
		// this.cdr.detectChanges();
	}

	public toggleDirection() {
		this.reverse = !this.reverse;
	}

	public devToggelePause() {
		this.isPaused = !this.isPaused;
	}

	public togglePause(pauseAnimation: boolean) {
		this.isPaused = pauseAnimation ? true : false;
	}

	ngOnDestroy(): void {
		clearTimeout(this._timeoutId);
		cancelAnimationFrame(this._animationFrameId);
		this.cdr.detach();
	}
}
