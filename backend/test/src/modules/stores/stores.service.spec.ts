import { TestBed } from '@automock/jest';
import { ProductsService } from '@modules/products/products.service';
import { StoresRepository } from '@modules/stores/repositories/stores.repository';
import { StoresService } from '@modules/stores/stores.service';
import { VinmonopoletService } from '@modules/vinmonopolet/vinmonopolet.service';
import {
	createMockStore,
	createMockVinmonopoletProductWithStockLevel,
} from 'test/utils/createMockData';

const store1 = createMockStore({ store_id: '1' });
const store2 = createMockStore({ store_id: '2' });
const store3 = createMockStore({ store_id: '3' });
const procuctWithStockLevel1 = createMockVinmonopoletProductWithStockLevel({
	vmp_id: '1',
	stockLevel: 48,
});
const procuctWithStockLevel2 = createMockVinmonopoletProductWithStockLevel({
	vmp_id: '2',
	stockLevel: 69,
});

describe('storesService', () => {
	let storesService: StoresService;
	let productsService: ProductsService;
	let storesRepository: StoresRepository;
	let vinmonopoletService: VinmonopoletService;

	beforeAll(async () => {
		const { unit, unitRef } = TestBed.create(StoresService).compile();

		storesService = unit;
		storesRepository = unitRef.get(StoresRepository);
		productsService = unitRef.get(ProductsService);
		vinmonopoletService = unitRef.get(VinmonopoletService);
	});

	describe('getStore', () => {
		it('should throw NotFound exception if store is not found', async () => {
			jest.spyOn(storesRepository, 'getStore').mockResolvedValue(null);

			await expect(storesService.getStore('160')).rejects.toThrow();
		});
	});

	describe('updateStockForStore', () => {
		it('should update stock for store successfully', async () => {
			const stock = [procuctWithStockLevel1, procuctWithStockLevel2];
			const repository = jest.spyOn(storesRepository, 'updateStockForStore');
			jest
				.spyOn(productsService, 'getProductsByStore')
				.mockResolvedValue(stock);

			await storesService.updateStockForStore(store1);

			expect(repository).toHaveBeenCalledWith(stock, '1');
		});
	});

	describe('updateStockForAllStores', () => {
		it('should correctly call updateStockForStore for each store in the database', async () => {
			jest
				.spyOn(storesRepository, 'getAllStores')
				.mockResolvedValue([store1, store2, store3]);
			const updateStockForStoreSpy = jest.spyOn(
				storesService,
				'updateStockForStore',
			);

			await storesService.updateStockForAllStores();

			expect(updateStockForStoreSpy).toHaveBeenCalledTimes(3);
		});
	});

	describe('updateAvailableStores', () => {
		it('should save any new stores and remove any old stores', async () => {
			jest
				.spyOn(vinmonopoletService, 'getAllStores')
				.mockResolvedValue([store1, store3]);
			jest
				.spyOn(storesRepository, 'getAllStores')
				.mockResolvedValue([store1, store2, store3]);
			const saveStoreSpy = jest.spyOn(storesRepository, 'saveStore');
			const deleteStoreSpy = jest.spyOn(storesRepository, 'deleteStore');

			await storesService.updateAvailableStores();

			expect(saveStoreSpy).toHaveBeenCalledTimes(2);
			expect(deleteStoreSpy).toHaveBeenCalledOnceWith(store2.store_id);
		});
	});
});
