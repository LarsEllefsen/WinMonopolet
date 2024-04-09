import { Stock } from '@modules/stores/entities/stock.entity';
import { User } from '@modules/users/entities/user.entity';
import type { MatcherFunction, ExpectationResult } from 'expect';

const toMatchStock: MatcherFunction<[expectedUser: unknown]> = (
	actualStock,
	expectedStock,
) => {
	if (!(actualStock instanceof Array)) {
		throw new TypeError(
			`Actual stock must be an iterable array. Recieved ${typeof actualStock}`,
		);
	} else if (!actualStock.every((item) => item instanceof Stock)) {
		throw new TypeError(`Actual stock must only contain Stock entities.`);
	}

	if (!(expectedStock instanceof Array)) {
		throw new TypeError(
			`Expected stock must be an iterable array. Recieved ${typeof expectedStock}`,
		);
	} else if (!expectedStock.every((item) => item instanceof Stock)) {
		throw new TypeError(`Expected stock must only contain Stock entities.`);
	}

	const { passed, validationErrorMessages } = compareStock(
		actualStock,
		expectedStock,
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

const compareStock = (actual: Stock[], expected: Stock[]) => {
	const validationErrorMessages: string[] = [];

	if (actual.length !== expected.length) {
		validationErrorMessages.push(
			`Expected stock to have lenth ${expected.length}. Actual length was ${actual.length}`,
		);
	}

	for (const expectedStockEntry of expected) {
		const actualStockEntry = actual.find(
			(x) =>
				x.product.vmp_id === expectedStockEntry.product.vmp_id &&
				x.storeId === expectedStockEntry.storeId,
		);
		if (actualStockEntry === undefined) {
			validationErrorMessages.push(
				`Expected stock to contain entry for product ${expectedStockEntry.product.vmp_id} in store ${expectedStockEntry.storeId}. It did not.`,
			);
			continue;
		}

		if (expectedStockEntry.stock_level !== actualStockEntry.stock_level) {
			validationErrorMessages.push(
				`Expected stock for product ${expectedStockEntry.product.vmp_id} in store ${expectedStockEntry.storeId} to have a stock level of ${expectedStockEntry.stock_level}. Recieved ${actualStockEntry.stock_level}`,
			);
		}
	}

	return {
		passed: validationErrorMessages.length === 0,
		validationErrorMessages,
	};
};

export default toMatchStock;
