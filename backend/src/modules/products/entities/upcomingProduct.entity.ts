import { VinmonopoletProduct } from './vinmonopoletProduct.entity';

export class UpcomingProduct {
	constructor(vinmonopoletProduct: VinmonopoletProduct, releaseDate: Date) {
		this.vinmonopoletProduct = vinmonopoletProduct;
		this.releaseDate = releaseDate;
	}
	vinmonopoletProduct: VinmonopoletProduct;

	releaseDate: Date;
}
