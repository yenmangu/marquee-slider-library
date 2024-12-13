import { Component, Input, OnInit } from '@angular/core';
import { MarqueeComponent } from './marquee/marquee.component';
import { ImageStyle, MarqueeConfig, MarqueeImage } from '../types/marquee-config';
import { SAMPLE_IMAGES } from '../data/sample-images';

@Component({
	selector: 'mt-marquee-toolkit',
	imports: [MarqueeComponent],
	template: `
		<mt-marquee-internal
			[images]="images"
			[scrollSpeed]="marqueeConfig.scrollSpeed || 10"
			[gutter]="marqueeConfig.gutter || 20"
			[reverse]="marqueeConfig.reverse || false"
			[imageWidth]="marqueeConfig.imageWidth || 100"
			[containerHeight]="marqueeConfig.containerHeight || 100"
			[imageStyle]="imageStyle"
		>
		</mt-marquee-internal>
	`,
	styleUrl: './marquee-toolkit.component.css'
})
export class MarqueeToolkitComponent implements OnInit {
	@Input() marqueeConfig: MarqueeConfig = {
		scrollSpeed: 2,
		containerHeight: 100,
		imageWidth: 100,
		gutter: 20,
		reverse: false
	};
	@Input() imageStyle: ImageStyle = { borderRadius: 20 };
	@Input() images: MarqueeImage[] = SAMPLE_IMAGES;

	ngOnInit(): void {
		console.log('images in array: ', this.images);
	}
}
