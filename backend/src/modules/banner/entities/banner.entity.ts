export enum BannerColor {
	red = 'red',
	green = 'green',
	blue = 'blue',
}

export class Banner {
	text: string;
	color: BannerColor;

	constructor(text: string, color: BannerColor) {
		this.text = text;
		this.color = color;
	}
}
