import { UntappdProduct } from '@modules/products/entities/untappdProduct.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { Store } from '@modules/stores/entities/stores.entity';
import { Stock } from '@modules/stores/entities/stock.entity';
import {
	AddBuyableColumn,
	CreateUpcomingProductsTable,
	addUserAvatarHDColumn,
	createStockTable,
	createStoresTable,
	createUntappdProductsTable,
	createUserProductsTable,
	createUserTable,
	createUserWishlistProductsTable,
	createVinmonopoletProductsTable,
	createWordlistTable,
} from '../../src/database/migrations';
import { User } from '@modules/users/entities/user.entity';
import { Word } from '@modules/wordlist/entities/word';
import { UserProduct } from '@modules/users/entities/userProduct.entity';
import { UserWishlistProduct } from '@modules/users/entities/userWishlistProduct.entity';
import { UpcomingProduct } from '@modules/products/entities/upcomingProduct.entity';

export default TypeOrmModule.forRootAsync({
	useFactory: () => ({
		type: 'better-sqlite3',
		name: 'test-db',

		database: ':memory:',
		entities: [
			Stock,
			VinmonopoletProduct,
			UntappdProduct,
			Store,
			Word,
			User,
			UserProduct,
			UserWishlistProduct,
			UpcomingProduct,
		],
		migrations: [
			createStoresTable,
			createVinmonopoletProductsTable,
			createUntappdProductsTable,
			createStockTable,
			createWordlistTable,
			createUserTable,
			createUserProductsTable,
			addUserAvatarHDColumn,
			createUserWishlistProductsTable,
			CreateUpcomingProductsTable,
			AddBuyableColumn,
		],
		migrationsRun: true,
		synchronize: false,
	}),
});
