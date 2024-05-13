import { Facet } from 'vinmonopolet-ts';

export const X_RATELIMIT_REMAINING_HEADER = 'x-ratelimit-remaining';
export const productCategories = [
	Facet.Category.BEER,
	Facet.Category.CIDER,
	Facet.Category.MEAD,
];
export const ONE_HOUR_IN_MILLISECONDS = 3600000;
export const FIVE_MINUTES_IN_MILLISECONDS = 300000;
export const ONE_WEEK_IN_MILLISECONDS = 604800000;
export const TWO_WEEKS_IN_MILLISECONDS = 1209600000;
export const THIRTY_SECONDS_IN_MILLISECONDS = 30000;
export const LOCALEDATESTRING_DD_MM_YYYY_OPTIONS: Intl.DateTimeFormatOptions = {
	year: 'numeric',
	day: '2-digit',
	month: '2-digit',
};
