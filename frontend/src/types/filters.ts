type Checkable = {
	checked: boolean;
};

type Category = Checkable & {
	name: string;
};

export type Style = Category;

export type SubCategory = Category & {
	styles: Category[];
};

export type ProductCategory = Category & {
	subCategories: SubCategory[];
};

export type Filters = {
	price: number[];
	abv: number[];
	onlyShowNewArrivals: boolean;
	removeUserCheckedInProducts: boolean;
	productCategories: ProductCategory[];
};
