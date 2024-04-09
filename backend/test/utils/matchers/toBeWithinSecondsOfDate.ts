import type { MatcherFunction, ExpectationResult } from 'expect';

const dateIsWithinAllowedOffsetOfEachother = (
	a: Date | undefined,
	b: Date | undefined,
	allowedOffset: number,
): boolean => {
	if (!a || !b) return false;

	const diff = Math.abs(a.getTime() - b.getTime());

	return diff < allowedOffset;
};

const toBeWithinSecondsOfDate: MatcherFunction<
	[comparisonDate: unknown, allowedOffset: unknown]
> = (recievedDate, comparisonDate, allowedOffset) => {
	if (!(recievedDate instanceof Date)) {
		throw new TypeError(
			`recievedDate must be of type Date, revieved ${typeof recievedDate}`,
		);
	}

	if (!(comparisonDate instanceof Date)) {
		throw new TypeError('comparisonDate must be of type Date');
	}

	if (typeof allowedOffset !== 'number') {
		throw new TypeError('allowedOffset must be a number');
	}

	const offsetInMS = allowedOffset * 1000;

	if (
		dateIsWithinAllowedOffsetOfEachother(
			recievedDate,
			comparisonDate,
			offsetInMS,
		)
	) {
		return {
			message: () => `Dates are within ${allowedOffset} seconds of eachother`,
			pass: true,
		} satisfies ExpectationResult;
	} else {
		return {
			message: () =>
				`Expected ${recievedDate} to be within ${allowedOffset} seconds of ${comparisonDate}`,
			pass: false,
		} satisfies ExpectationResult;
	}
};

export default toBeWithinSecondsOfDate;
