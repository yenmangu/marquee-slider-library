export interface MarqueeConfig {
	speed?: number;
	height?: number;
	width?: number;
	gutter?: number;
	reverse?: boolean;
}
export interface ImageStyle {
	blur?: number;
	borderRadius?: number;
	border?: boolean;
	borderThickness?: number;
	borderColour?: string;
	[key: string]: any;
}
export interface MarqueeImage {
	src: string;
	alt: string;
}

export interface RenderedImage {
	src: string;
	alt: string;
	id: string;
	groupIndex: string;
	dataKey: string;
	dataIntersecting?: boolean;
	shift?: boolean;
}

export interface ElementWithDataKey extends HTMLElement {
	dataset: {
		key?: string;
		array?: string;
		intersecting?: 'true' | 'false';
		shift?: string;
		[name: string]: string | undefined;
	};
}
