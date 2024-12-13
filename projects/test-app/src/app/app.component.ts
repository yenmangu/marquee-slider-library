import { Component, OnInit } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
import {
	MarqueeToolkitService,
	MarqueeToolkitComponent,
	MarqueeImage
} from 'marquee-toolkit';
@Component({
	selector: 'app-root',
	standalone: true,
	imports: [MarqueeToolkitComponent],
	templateUrl: './app.component.html',
	styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
	public SampleImageArray: MarqueeImage[] = [];
	public arrayLength: number = 6;
	private _imageSize: number = 300;
	private _badIds: number[] = [86, 97];
	title = 'test-app';

	ngOnInit(): void {
		this._initialiseTestArray();
	}
	private _initialiseTestArray() {
		let numArray: number[] = [];
		for (let i = 0; i < this.arrayLength; i++) {
			let id = Math.floor(Math.random() * 100);
			if (numArray.includes(id)) {
				id = !this._badIds.includes(id) ? id : Math.floor(Math.random() * 100);
			}
			numArray.push(id);
			const entry: MarqueeImage = {
				src: `https://picsum.photos/id/${id}/${this._imageSize}`,
				alt: `sample alt text_${id}`
			};
			this.SampleImageArray.push(entry);
		}
	}
}
