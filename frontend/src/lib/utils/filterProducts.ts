import type { Filters, ProductCategory, Style, SubCategory } from '../../types/filters';
import type { VinmonopoletProduct } from '../../types/product';
import type { Stock } from '../../types/stock';

const filterProductsByPrice = (stock: Stock[], price: number[]) => {
	return stock.filter(({ product }) => product.price >= price[0] && product.price <= price[1]);
};

const filterProductsByAbv = (stock: Stock[], abv: number[]) => {
	return stock.filter(
		({ product }) => product.untappd.abv >= abv[0] && product.untappd.abv <= abv[1]
	);
};

const filterProductsBySubCategory = (
	subCategories: SubCategory[],
	product: VinmonopoletProduct
) => {
	if (subCategories.length === 0) return true;
	return subCategories.some(
		({ name }) => name === product.sub_category || name === product.untappd.style
	);
};

const filterProductsByStyle = (activeStyles: Style[], product: VinmonopoletProduct) => {
	if (activeStyles.length === 0) return true;
	if (product.sub_category === null) return true;
	return activeStyles.some(({ name }) => name === product.untappd.style);
};

const filterProductsByNewArrivalsOnly = (
	stock: Stock[],
	shouldFilterProductsByNewArrivalsOnly: boolean
) => {
	if (!shouldFilterProductsByNewArrivalsOnly) return stock;
	return stock.filter(({ product }) => product.is_new);
};

const filterProductsByUserHasHad = (stock: Stock[], shouldFilterProductsByUserHasHad: boolean) => {
	if (!shouldFilterProductsByUserHasHad) return stock;
	return stock.filter(({ product }) => !product.has_had);
};

const filterProductsByCategory = (stock: Stock[], productCategories: ProductCategory[]) => {
	const activeProductCategories = productCategories.filter(
		(productCategory) => productCategory.checked
	);

	const activeSubCategories = activeProductCategories.flatMap(({ subCategories }) =>
		subCategories.filter(({ checked }) => checked)
	);

	const activeStyles = activeSubCategories.flatMap(({ styles }) =>
		styles.filter(({ checked }) => checked)
	);

	return stock.filter(
		({ product }) =>
			activeProductCategories.some((category) => category.name === product.category) &&
			filterProductsBySubCategory(activeSubCategories, product) &&
			filterProductsByStyle(activeStyles, product)
	);
};

export const filterStock = (stock: Stock[], filters: Filters) => {
	let filteredProducts =
		filters.price !== undefined ? filterProductsByPrice(stock, filters.price) : stock;
	filteredProducts =
		filters.abv !== undefined ? filterProductsByAbv(filteredProducts, filters.abv) : stock;
	filteredProducts =
		filters.onlyShowNewArrivals !== undefined
			? filterProductsByNewArrivalsOnly(filteredProducts, filters.onlyShowNewArrivals)
			: stock;
	filteredProducts =
		filters.removeUserCheckedInProducts !== undefined
			? filterProductsByUserHasHad(filteredProducts, filters.removeUserCheckedInProducts)
			: stock;
	filteredProducts = filterProductsByCategory(filteredProducts, filters.productCategories);

	return filteredProducts;
};
