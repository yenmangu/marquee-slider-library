import { Injectable } from '@angular/core';
import {
	ElementWithDataKey,
	MarqueeImage,
	RenderedImage
} from '../../types/marquee-config';
import { IntersectionObserverService } from './intersection-observer.service';

@Injectable({
	providedIn: 'root'
})
export class MarqueeToolkitService {
	public repeatedRenderedArray: RenderedImage[] = [];
	wrapperWidthPx: number = 0;
	totalElements: number = 0;
	arrayWidthPx: number = 0;
	additionalNeeded: boolean = false;
	repeatedArrays: HTMLElement[] = [];

	private _intersectingElements = new Set<ElementWithDataKey>();
	constructor(private intersectionService: IntersectionObserverService) {}

	/**
	 * Initializes the repeated marquee array by dynamically calculating the number of repetitions
	 * based on the provided marquee width configuration.
	 *
	 * @param {MarqueeImage[]} initialArray - The original array of marquee images to be repeated.
	 * @param {Object} marqueeItemConfig - Configuration for the marquee dimensions.
	 * @param {number} marqueeItemConfig.width - The width of each element in the marquee.
	 * @param {number} marqueeItemConfig.gutter - The gutter between marquee elements.
	 * @returns {RenderedImage[]} The fully initialized repeated marquee array.
	 *
	 * @example
	 * const initialArray = [{ src: 'img1.jpg'... }, { src: 'img2.jpg'... }];
	 * const marqueeItemConfig = { width: 200, gutter: 20 };
	 * const result = initialiseRenderedArray(initialArray, marqueeItemConfig);
	 * // result contains the repeated array based on the calculated width and repeats.
	 */
	public initialiseRenderedArray(
		initialArray: MarqueeImage[],
		marqueeItemConfig: { width: number; gutter: number }
	): RenderedImage[] {
		this._setArrayValues(initialArray, marqueeItemConfig);
		const repeats = this._calculateTotalRepeats();

		this.repeatedRenderedArray = this._buildRepeatedArray(initialArray, repeats);
		return this.repeatedRenderedArray;
	}

	private _setArrayValues(
		initialArray: MarqueeImage[],
		marqueeItemConfig: { width: number; gutter: number }
	) {
		const { width, gutter } = marqueeItemConfig;
		this.totalElements = initialArray.length;
		this._calculateArrayWidthPx(this.totalElements, width, gutter);
	}

	private _calculateTotalRepeats(): number {
		// totalSize = wrapperWidth * 1.2 (20% buffer)

		const totalArraysNeeded: number = Math.ceil(
			(this.wrapperWidthPx * 1.2) / this.arrayWidthPx
		);

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

	// private _buildRepeatedArray(
	// 	initialArray: MarqueeImage[],
	// 	currentRepeatIndex: number
	// ): RenderedImage[] {
	// 	const renderedArray: RenderedImage[] = [];
	// 	initialArray.forEach((item, index) => {
	// 		renderedArray.push({
	// 			...item,
	// 			id: `index${index}`,
	// 			groupIndex: `${currentRepeatIndex}`,
	// 			dataKey: `${currentRepeatIndex}_${index}`
	// 		});
	// 	});
	// 	return renderedArray;
	// }

	private _determineAdditionalArrays() {
		const arrayPlusBufferWidth = this.arrayWidthPx * 1.2;
		if (this.wrapperWidthPx - arrayPlusBufferWidth < 0) {
			this.additionalNeeded = true;
		}
	}

	// repeatArray(): void {}

	private _calculateArrayWidthPx(
		totalEl: number,
		elWidth: number,
		gutter: number
	): void {
		this.arrayWidthPx = totalEl * (elWidth + gutter);
	}

	// getStartX(): number {}

	// getFinishX(): number {}
}
