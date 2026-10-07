import type { Stock } from '../../types/stock';
import type { HadBeers } from '../stores/hadBeers';

export const decorateStock = (stock: Stock[], had: HadBeers): Stock[] => {
	if (had.size === 0) return stock;

	return stock.map((entry) => {
		const untappdId = entry.product.untappd?.untappd_id;
		if (!untappdId || !had.has(untappdId)) return entry;

		return {
			...entry,
			product: {
				...entry.product,
				// Fill-only: a future OAuth flow may set has_had/user_score server-side;
				// decoration must never unset server-provided values.
				has_had: true,
				user_score: had.get(untappdId) ?? undefined
			}
		};
	});
};
