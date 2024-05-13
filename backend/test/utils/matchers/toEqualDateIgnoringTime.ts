import type { MatcherFunction, ExpectationResult } from 'expect';

const dateMatchesIgnoringTime = (recievedDate: Date, expectedDate: Date) => {
	return (
		recievedDate.getFullYear() === expectedDate.getFullYear() &&
		recievedDate.getMonth() === expectedDate.getMonth() &&
		recievedDate.getDate() === expectedDate.getDate()
	);
};

const toEqualDateIgnoringTime: MatcherFunction<[comparisonDate: unknown]> = (
	recievedDate,
	comparisonDate,
) => {
	if (!(recievedDate instanceof Date)) {
		throw new TypeError(
			`recievedDate must be of type Date, revieved ${typeof recievedDate}`,
		);
	}

	if (!(comparisonDate instanceof Date)) {
		throw new TypeError('comparisonDate must be of type Date');
	}

	if (dateMatchesIgnoringTime(recievedDate, comparisonDate)) {
		return {
			message: () => `Dates are equal, ignoring time`,
			pass: true,
		} satisfies ExpectationResult;
	} else {
		return {
			message: () =>
				`Expected ${recievedDate} to be same date as ${comparisonDate}, ignoring time.`,
			pass: false,
		} satisfies ExpectationResult;
	}
};

export default toEqualDateIgnoringTime;
