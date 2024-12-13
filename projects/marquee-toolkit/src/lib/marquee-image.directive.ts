import { Directive, ElementRef } from '@angular/core';

@Directive({
	selector: '[marqueeImage]'
})
export class MarqueeImageDirective {
	constructor(public el: ElementRef) {}
}
