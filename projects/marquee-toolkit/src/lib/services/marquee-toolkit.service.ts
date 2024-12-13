import { Injectable } from '@angular/core';
import {
	ImageWithDataKey,
	MarqueeImage,
	RenderedImage
} from '../../types/marquee-config';
import { IntersectionObserverService } from './intersection-observer.service';

interface MarqueeItemConfig {
	width: number;
	gutter: number;
}
@Injectable({
	providedIn: 'root'
})
export class MarqueeToolkitService {
	public repeatedRenderedArray: RenderedImage[] = [];
	public _wrapperWidthWithBuffer: number = 0;
	private _totalElements: number = 0;
	public _arrayWidthPx: number = 0;
	public renderedArrayWidthPx!: number;
	public repeats: number = 0;
	additionalNeeded: boolean = false;
	private _repeatedArrays: HTMLElement[] = [];

	private _intersectingElements = new Set<ImageWithDataKey>();
	private _currentRepeats: number = 0;
	private _initialArray: MarqueeImage[] = [];
	private _marqueeItemConfig!: MarqueeItemConfig;
	constructor(private intersectionService: IntersectionObserverService) {}

	/**
	 *
	 * @param initialArray
	 * @param marqueeItemConfig
	 * @param initialWrapperWidth
	 */
	public initialiseArrayValues(
		initialArray: MarqueeImage[],
		marqueeItemConfig: MarqueeItemConfig,
		initialWrapperWidth: number
	) {
		this._initialArray = initialArray;
		this._totalElements = this._initialArray.length;
		this._wrapperWidthWithBuffer = initialWrapperWidth;
		this._marqueeItemConfig = marqueeItemConfig;
		this._calculateArrayWidthPx();
		this.renderedArrayWidthPx = this._arrayWidthPx * this.repeats;
	}

	public updateWidth(_wrapperWidthWithBuffer: number) {
		console.log(
			'Updating width in service from:',
			this._wrapperWidthWithBuffer,
			'to: ',
			_wrapperWidthWithBuffer
		);
		this._wrapperWidthWithBuffer = _wrapperWidthWithBuffer;
	}

	public updateRenderedArray(): RenderedImage[] {
		console.log('Invoking update rendered array');

		const newRepeats = this._calculateTotalRepeats();

		const newRenderedArray = this._buildRepeatedArray(
			this._initialArray,
			newRepeats
		);
		this.repeatedRenderedArray =
			newRenderedArray.length !== this.repeatedRenderedArray.length
				? newRenderedArray
				: this.repeatedRenderedArray;
		return this.repeatedRenderedArray;
	}

	private _calculateTotalRepeats(): number {
		const totalArraysNeeded: number = Math.ceil(
			this._wrapperWidthWithBuffer / this._arrayWidthPx
		);
		this.repeats = totalArraysNeeded;
		this.renderedArrayWidthPx = this._arrayWidthPx * this.repeats;

		return totalArraysNeeded;
	}

	/**
	 * Builds a repeated array of `RenderedImage` objects based on the given initial array
	 * and the specified number of repeats, without physically duplicating the array in memory.
	 *
	 * @param {MarqueeImage[]} initialArray - The original array of marquee images to be repeated.
	 * @param {number} repeats - The number of times the initial array should be conceptually repeated.
	 * @returns {RenderedImage[]} A single array containing the repeated elements with unique metadata.
	 *
	 * Each element in the returned array includes:
	 * - A unique `id` field (`index_<global_index>`).
	 * - A `groupIndex` field indicating the repeat group (`<repeat_index>`).
	 * - A `dataKey` field uniquely identifying each element (`<repeat_index>_<local_index>`).
	 *
	 * @example
	 * const initialArray = [{ src: 'img1.jpg' }, { src: 'img2.jpg' }];
	 * const repeats = 3;
	 * const result = __buildRepeatedArray(initialArray, repeats);
	 * // result = [
	 * //   { src: 'img1.jpg', id: 'index_0', groupIndex: '0', dataKey: '0_0' },
	 * //   { src: 'img2.jpg', id: 'index_1', groupIndex: '0', dataKey: '0_1' },
	 * //   { src: 'img1.jpg', id: 'index_2', groupIndex: '1', dataKey: '1_0' },
	 * //   { src: 'img2.jpg', id: 'index_3', groupIndex: '1', dataKey: '1_1' },
	 * //   ...
	 * // ]
	 */
	private _buildRepeatedArray(
		initialArray: MarqueeImage[],
		repeats: number
	): RenderedImage[] {
		const repeatedArray: RenderedImage[] = [];
		const totalItems = initialArray.length * repeats;

		for (let index = 0; index < totalItems; index++) {
			const arrayIndex = Math.floor(index / initialArray.length);
			const itemIndex = index % initialArray.length;

			const item = initialArray[itemIndex];

			repeatedArray.push({
				...item,
				id: `index_${index}`,
				groupIndex: `${arrayIndex}`,
				dataKey: `${arrayIndex}_${itemIndex}`
			});
		}
		return repeatedArray;
	}

	private _determineAdditionalArrays() {
		const arrayPlusBufferWidth = this._arrayWidthPx * 1.2;
		if (this._wrapperWidthWithBuffer - arrayPlusBufferWidth < 0) {
			this.additionalNeeded = true;
		}
	}

	private _calculateArrayWidthPx(): void {
		const { width, gutter } = this._marqueeItemConfig;
		this._arrayWidthPx = this._totalElements * (width + gutter);
	}
}
