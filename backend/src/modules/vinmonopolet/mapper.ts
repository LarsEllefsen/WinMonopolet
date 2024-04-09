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

const getAvailabilityText = (product: BaseProduct) => {
	if (
		!product.availability ||
		(!product.availability.deliveryAvailability &&
			!product.availability.storeAvailability)
	)
		return null;
	if (product.availability.storeAvailability) {
		return product.availability.storeAvailability.mainText;
	}

	if (product.availability.deliveryAvailability) {
		return product.availability.deliveryAvailability.mainText;
	}

	return null;
};

export const mapToVinmonopoletProduct = (
	vinmonopoletProductDTO: BaseProduct,
) => {
	return new VinmonopoletProduct(
		vinmonopoletProductDTO.code,
		vinmonopoletProductDTO.name,
		vinmonopoletProductDTO.url,
		vinmonopoletProductDTO.price,
		vinmonopoletProductDTO.mainCategory.name as string,
		vinmonopoletProductDTO.mainSubCategory.name ?? null,
		vinmonopoletProductDTO.productSelection,
		vinmonopoletProductDTO.volume.formattedValue,
		vinmonopoletProductDTO.mainCountry.name as string,
		undefined,
		undefined,
		true,
		vinmonopoletProductDTO.buyable,
		getAvailabilityText(vinmonopoletProductDTO),
		undefined,
	);
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
	return new Store(
		storeDTO.storeNumber,
		storeDTO.name,
		toSnakeCase(storeDTO.name),
		getCategoryFromString(storeDTO.category),
		storeDTO.postalAddress,
		storeDTO.postalCity,
		storeDTO.postalZip,
		storeDTO.gpsCoordinates[1].toString(),
		storeDTO.gpsCoordinates[0].toString(),
	);
};

const getCategoryFromString = (categoryString: string): number => {
	const category = categoryString.split(' ').at(1);
	if (category === undefined) {
		return Number(categoryString);
	}
	return Number(category);
};
