import { UntappdSearchProductDTO } from './UntappdSearchProductDTO';

export class UntappdSearchResultDTO {
	found: number;
	offset: number;
	limit: number;
	term: string;
	parsed_term: string;
	beers: { count: number; items: UntappdSearchProductDTO[] };
}
