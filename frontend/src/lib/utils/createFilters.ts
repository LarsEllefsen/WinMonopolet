/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import { getUniqueStringValues } from '$lib/utils/getUniqeValues';
import { DEFAULT_ABV_RANGE, DEFAULT_PRICE_RANGE } from '../../constants';
import type {
	CreateFilters,
	Filters,
	ProductCategory,
	Style,
	SubCategory
} from '../../types/filters';
import type { UntappdProduct, VinmonopoletProduct } from '../../types/product';
import type { Stock } from '../../types/stock';

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
					products.filter(
						(product) => product.category === category && product.sub_category != null
					),
					'sub_category'
			  )
			: getUniqueStringValues<UntappdProduct>(
					products
						.filter((product) => product.category === category)
						.map((product) => product.untappd),
					'style'
			  );

	return allAvailableSubCategories
		.map((subCategory) =>
			createNewSubCategory(subCategory, getAllAvailableStylesForSubCategory(products, subCategory))
		)
		.sort((a, b) => {
			try {
				return a.name.localeCompare(b.name);
			} catch (e) {
				console.log({ a, b });
				throw e;
			}
		});
};

const getProductCategories = (products: VinmonopoletProduct[]): ProductCategory[] => {
	const availableProductCategories = getUniqueStringValues<VinmonopoletProduct>(
		products,
		'category'
	);

	return availableProductCategories
		.map((category) => {
			const availableSubCategoriesForCategory = getAllAvailableSubCategoriesForCategory(
				products,
				category
			);
			return createNewCategory(category, availableSubCategoriesForCategory, category === 'Øl');
		})
		.sort(sortCategoriesByNameReversed);
};

export const createFiltersFromStock = (stock: Stock[]): Filters => {
	const categories = getProductCategories(stock.map((stockEntry) => stockEntry.product));
	return {
		price: DEFAULT_PRICE_RANGE,
		abv: DEFAULT_ABV_RANGE,
		onlyShowNewArrivals: false,
		removeUserCheckedInProducts: false,
		productCategories: categories
	};
};

export const createFilters = (createFilters: CreateFilters): Filters => {
	return {
		price: createFilters.price ? [createFilters.price.min, createFilters.price.max] : undefined,
		abv: createFilters.abv ? [createFilters.abv.min, createFilters.abv.max] : undefined,
		onlyShowNewArrivals: createFilters.onlyShowNewArrivals,
		removeUserCheckedInProducts: createFilters.removeUserCheckedInProduct,
		productCategories: createFilters.productCategories.map((category) =>
			createNewCategory(category.name, category.subCategories, category.checked)
		)
	} satisfies Filters;
};
