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
			[speed]="marqueeConfig.speed || 6000"
			[gutter]="marqueeConfig.gutter || 20"
			[reverse]="marqueeConfig.reverse || false"
			[width]="marqueeConfig.width || 100"
			[height]="marqueeConfig.height || 100"
			[imageStyle]="imageStyle"
		>
		</mt-marquee-internal>
	`,
	styles: ``
})
export class MarqueeToolkitComponent {
	@Input() marqueeConfig: MarqueeConfig = {
		speed: 6000,
		height: 100,
		width: 100,
		gutter: 20,
		reverse: false
	};
	@Input() imageStyle: ImageStyle = { borderRadius: 20 };
	@Input() images: MarqueeImage[] = SAMPLE_IMAGES;
}
