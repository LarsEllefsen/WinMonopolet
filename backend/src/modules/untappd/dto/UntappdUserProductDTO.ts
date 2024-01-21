import { UntappdProductDTO } from './UntappdProductDTO';

export class UntappdUserProductDTO {
	count: number;
	rating_score: number;
	user_auth_rating_score: number;
	first_had: string;
	beer: UntappdProductDTO;
}
