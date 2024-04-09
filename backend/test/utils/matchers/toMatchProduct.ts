import { UntappdProduct } from '@modules/products/entities/untappdProduct.entity';
import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import type { MatcherFunction, ExpectationResult } from 'expect';

const toMatchProduct: MatcherFunction<
	[expectedProduct: unknown, ignoreActiveProperty: unknown]
> = (actualProduct, expectedProduct, ignoreActiveProperty) => {
	if (!(actualProduct instanceof VinmonopoletProduct)) {
		throw new TypeError(
			`Actual product must be instances of VinmonopoletProduct. Recieved ${typeof actualProduct}`,
		);
	}
	if (!(expectedProduct instanceof VinmonopoletProduct)) {
		throw new TypeError(
			`Expected product must be instances of VinmonopoletProduct. Recieved ${typeof expectedProduct}`,
		);
	}

	if (
		ignoreActiveProperty !== undefined &&
		typeof ignoreActiveProperty !== 'boolean'
	) {
		throw new TypeError(
			`ignoreActiveProperty must be a boolean or undefined. Recieved ${typeof ignoreActiveProperty}`,
		);
	}

	const { passed, validationErrorMessages } = compareProducts(
		actualProduct,
		expectedProduct,
		ignoreActiveProperty === undefined ? false : true,
	);

	if (passed) {
		return {
			message: () => `Jippi!`,
			pass: true,
		} satisfies ExpectationResult;
	} else {
		return {
			message: () => validationErrorMessages.join('\n'),
			pass: false,
		} satisfies ExpectationResult;
	}
};

const compareClasses = (
	actual: Record<string, unknown>,
	expected: Record<string, unknown>,
	ignoreActiveProperty?: boolean,
): string[] => {
	const validationErrorMessages: string[] = [];
	for (const [key, value] of Object.entries(expected)) {
		if (key === 'last_updated' || key === 'added_date' || key === 'untappd')
			continue;
		if (key === 'active' && ignoreActiveProperty) {
			continue;
		}
		if (actual[key] !== value)
			validationErrorMessages.push(
				`Expected ${key} to be ${value}. Recieved ${actual[key]}`,
			);
	}
	return validationErrorMessages;
};

const compareUntappdProducts = (
	actualProduct: UntappdProduct | undefined,
	expectedProduct: UntappdProduct | undefined,
) => {
	let validationErrorMessages: string[] = [];
	if (actualProduct === undefined && expectedProduct !== undefined) {
		validationErrorMessages.push(
			`${expectedProduct.vmp_id}: Expected untappd product to be defined.`,
		);
		return validationErrorMessages;
	} else if (actualProduct !== undefined && expectedProduct === undefined) {
		validationErrorMessages.push('Expected untappd product to be undefined.');
		return validationErrorMessages;
	} else if (actualProduct !== undefined && expectedProduct !== undefined) {
		validationErrorMessages = compareClasses(actualProduct, expectedProduct);
	}
	return validationErrorMessages;
};

const compareProducts = (
	actualProduct: VinmonopoletProduct,
	expectedProduct: VinmonopoletProduct,
	ignoreActiveProperty: boolean,
): { passed: boolean; validationErrorMessages: string[] } => {
	const validationErrorMessages = [
		...compareClasses(actualProduct, expectedProduct, ignoreActiveProperty),
		...compareUntappdProducts(actualProduct.untappd, expectedProduct.untappd),
	];

	return {
		passed: validationErrorMessages.length === 0,
		validationErrorMessages,
	};
};

export default toMatchProduct;
