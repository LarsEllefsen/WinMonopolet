/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { getUniqueStringValues } from '$lib/utils/getUniqeValues';
import type { Filters, ProductCategory, Style, SubCategory } from '../../../types/filters';
import type { UntappdProduct, VinmonopoletProduct } from '../../../types/product';
import type { Stock } from '../../../types/stock';

const sortCategoriesByNameReversed = (a: ProductCategory, b: ProductCategory) => {
	return a.name < b.name ? 1 : -1;
};

const createNewStyle = (name: string): Style => {
	return {
		name: name,
		checked: false
	};
};

const createNewSubCategory = (name: string, styles: string[]): SubCategory => {
	return {
		checked: false,
		name,
		styles: styles.map((style) => createNewStyle(style))
	};
};

const createNewCategory = (
	name: string,
	subCategories: SubCategory[],
	defaultChecked = false
): ProductCategory => {
	return {
		checked: defaultChecked ? true : false,
		name: name,
		subCategories: subCategories
	};
};

const getAllAvailableStylesForSubCategory = (
	products: VinmonopoletProduct[],
	subCategory: string
) => {
	return getUniqueStringValues<UntappdProduct>(
		products
			.filter((product) => product.sub_category === subCategory)
			.map((product) => product.untappd),
		'style'
	);
};

const getAllAvailableSubCategoriesForCategory = (
	products: VinmonopoletProduct[],
	category: string
) => {
	//Beer is the only product category that has a sub category at Vinmonopolet. For mead and cider we use the untappd style.
	const allAvailableSubCategories =
		category === 'Øl'
			? getUniqueStringValues<VinmonopoletProduct>(
					products.filter((product) => product.category === category),
					'sub_category'
			  )
			: getUniqueStringValues<UntappdProduct>(
					products
						.filter((product) => product.category === category)
						.map((product) => product.untappd),
					'style'
			  );

	return allAvailableSubCategories.map((subCategory) =>
		createNewSubCategory(subCategory, getAllAvailableStylesForSubCategory(products, subCategory))
	);
};

const getProductCategories = (stock: Stock[]): ProductCategory[] => {
	const allProducts = stock.map((stockEntry) => stockEntry.product);
	const availableProductCategories = getUniqueStringValues<VinmonopoletProduct>(
		allProducts,
		'category'
	);

	return availableProductCategories
		.map((category) => {
			const availableSubCategoriesForCategory = getAllAvailableSubCategoriesForCategory(
				allProducts,
				category
			);
			return createNewCategory(category, availableSubCategoriesForCategory, category === 'Øl');
		})
		.sort(sortCategoriesByNameReversed);
};

export const createFilters = (stock: Stock[]): Filters => {
	const categories = getProductCategories(stock);
	return {
		price: [0, 1000],
		abv: [0, 20],
		onlyShowNewArrivals: false,
		removeUserCheckedInProducts: false,
		productCategories: categories
	};
};
