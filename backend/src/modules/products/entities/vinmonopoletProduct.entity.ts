import { UntappdProduct } from './untappdProduct.entity';
import { TWO_WEEKS_IN_MILLISECONDS } from '@common/constants';

export class VinmonopoletProduct {
	[k: string]: any;

	vmp_id: string;

	vmp_name: string;

	vmp_url: string;

	price: number;

	category: string;

	sub_category: string | null;

	product_selection: string;

	container_size: string;

	country: string;

	added_date?: Date;

	last_updated?: Date;

	active: boolean;

	buyable: boolean;

	is_new: boolean;

	availablity: string | null;

	untappd?: UntappdProduct;

	constructor(
		productId: string,
		productName: string,
		vinmonopoletURL: string,
		price: number,
		category: string,
		subCategory: string | null,
		productSelection: string,
		containerSize: string,
		country: string,
		addedDate: Date | undefined,
		lastUpdated: Date | undefined,
		active: boolean,
		buyable: boolean,
		availability: string | null,
		untappdProduct: UntappdProduct | undefined,
	) {
		this.vmp_id = productId;
		this.vmp_name = productName;
		this.vmp_url = vinmonopoletURL;
		this.price = price;
		this.category = category;
		this.sub_category = subCategory;
		this.product_selection = productSelection;
		this.container_size = containerSize;
		this.country = country;
		this.added_date = addedDate;
		this.last_updated = lastUpdated;
		this.active = active;
		this.buyable = buyable;
		this.availablity = availability;
		this.untappd = untappdProduct;
		if (addedDate) {
			this.is_new = this.setIsNew();
		}
	}

	private setIsNew() {
		const today = new Date();
		const added = this.added_date as Date;
		if (today.getTime() - added.getTime() <= TWO_WEEKS_IN_MILLISECONDS) {
			return true;
		} else {
			return false;
		}
	}
}
