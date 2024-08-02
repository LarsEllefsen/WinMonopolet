import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import 'jest-extended';
declare global {
	namespace jest {
		interface Matchers<R, T> {
			toMatchProduct(
				expectedProduct: VinmonopoletProduct | null,
				ignoreActiveProperty?: boolean,
			): T;
			toBeWithinSecondsOfDate(
				comparisonDate: Date | undefined,
				allowedOffset: number,
			): T;
			toMatchUser(expectedUser: User): T;
			toMatchStock(expectedStock: Stock[]): T;
			toEqualDateIgnoringTime(expectedTime: Date): T;
		}
		interface ExpectExtendMap {
			toMatchProduct: MatcherFunction<[actualProduct: VinmonopoletProduct]>;
			toBeWithinSecondsOfDate: MatcherFunction<[recievedDate: Date]>;
			toMatchStock: MatcherFunction<[actualStock: Stock[]]>;
			toEqualDateIgnoringTime: MatcherFunction<[recievedDate: Date]>;
		}
	}
}
