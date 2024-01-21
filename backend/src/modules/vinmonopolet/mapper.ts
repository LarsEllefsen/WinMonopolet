import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { BaseProduct, PopulatedStore } from 'vinmonopolet-ts';
import { VinmonopoletProductWithStockLevel } from './vinmonopolet.interface';
import { Store } from '@modules/stores/entities/stores.entity';
import { toSnakeCase } from '@utils/toSnakeCase';

const getStockLevelFromText = (mainText: string) => {
	const onlyNumbersRegex = /\d+/g;
	const numberOfItemsInStock = mainText?.match(onlyNumbersRegex);

	return Number(numberOfItemsInStock?.[0]);
};

export const mapToVinmonopoletProduct = (
	vinmonopoletProductDTO: BaseProduct,
) => {
	const vinmonopoletProduct = new VinmonopoletProduct();
	vinmonopoletProduct.vmp_id = vinmonopoletProductDTO.code;
	vinmonopoletProduct.vmp_name = vinmonopoletProductDTO.name;
	vinmonopoletProduct.vmp_url = vinmonopoletProductDTO.url;
	vinmonopoletProduct.category = vinmonopoletProductDTO.mainCategory
		.name as string;
	vinmonopoletProduct.sub_category =
		vinmonopoletProductDTO.mainSubCategory.name;
	vinmonopoletProduct.country = vinmonopoletProductDTO.mainCountry
		.name as string;
	vinmonopoletProduct.product_selection =
		vinmonopoletProductDTO.productSelection;
	vinmonopoletProduct.price = vinmonopoletProductDTO.price;
	vinmonopoletProduct.container_size =
		vinmonopoletProductDTO.volume.formattedValue;
	vinmonopoletProduct.last_updated = undefined;
	vinmonopoletProduct.added_date = undefined;
	vinmonopoletProduct.active = 1;
	vinmonopoletProduct.untappd = undefined;
	return vinmonopoletProduct;
};

export const mapToVinmonopoletProductWithStockLevel = (
	vinmonopoletProductDTO: BaseProduct,
): VinmonopoletProductWithStockLevel => {
	return {
		stockLevel: getStockLevelFromText(
			vinmonopoletProductDTO?.availability?.storeAvailability?.mainText,
		),
		vinmonopoletProduct: mapToVinmonopoletProduct(vinmonopoletProductDTO),
	};
};

export const mapToStore = (storeDTO: PopulatedStore) => {
	const store = new Store();
	store.formatted_name = toSnakeCase(storeDTO.name);
	store.store_id = storeDTO.storeNumber;
	store.name = storeDTO.name;
	store.lat = storeDTO.gpsCoordinates[0].toString();
	store.lon = storeDTO.gpsCoordinates[1].toString();
	store.city = storeDTO.postalCity;
	store.address = storeDTO.postalAddress;
	store.zip = storeDTO.postalZip;
	store.category = getCategoryFromString(storeDTO.category);

	return store;
};

const getCategoryFromString = (categoryString: string): number => {
	const category = categoryString.split(' ').at(1);
	if (category === undefined) {
		return Number(categoryString);
	}
	return Number(category);
};
