import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { BaseProduct, BaseStore } from 'vinmonopolet-ts';
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
		!product.productAvailability ||
		(!product.productAvailability.deliveryAvailability &&
			!product.productAvailability.storesAvailability)
	)
		return null;
	if (
		product.productAvailability.storesAvailability &&
		product.productAvailability.storesAvailability.infos.length > 0
	) {
		return product.productAvailability.storesAvailability.infos[0].availability;
	}

	if (
		product.productAvailability.deliveryAvailability &&
		product.productAvailability.deliveryAvailability.infos.length > 0
	) {
		return product.productAvailability.deliveryAvailability.infos[0]
			.availability;
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
	const storeAvailability =
		vinmonopoletProductDTO?.productAvailability?.storesAvailability;
	if (storeAvailability.infos.length === 0) {
		throw new Error(
			`Unable to get stock level for product ${vinmonopoletProductDTO.code}, missing availability info.`,
		);
	}
	return {
		stockLevel: getStockLevelFromText(
			vinmonopoletProductDTO?.productAvailability?.storesAvailability?.infos[0]
				.availability,
		),
		vinmonopoletProduct: mapToVinmonopoletProduct(vinmonopoletProductDTO),
	};
};

export const mapToStore = (storeDTO: BaseStore) => {
	return new Store(
		storeDTO.storeNumber,
		storeDTO.name,
		toSnakeCase(storeDTO.name),
		storeDTO.streetAddress,
		storeDTO.city,
		storeDTO.zip,
		storeDTO.gpsCoordinates[1].toString(),
		storeDTO.gpsCoordinates[0].toString(),
	);
};
