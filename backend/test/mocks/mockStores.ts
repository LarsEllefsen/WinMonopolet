import { Store } from '@modules/stores/entities/stores.entity';

export const mockStore1 = new Store(
	'1',
	'Vinmonopolet Testnes',
	'Vinmonopolet_Testnes',
	'Testgata 2',
	'Testnes',
	'1234',
	'42.48623',
	'94.53157',
);

export const mockStore2 = new Store(
	'2',
	'Vinmonopolet Mocksund, Mocksund Torg',
	'Vinmonopolet_Mocksund_Mocksund_Torg',
	'Mockveien 5',
	'Mocksund',
	'1234',
	'42.48623',
	'94.53157',
);

export const mockStore3 = new Store(
	'3',
	'Vinmonopolet Skrutledalen',
	'Vinmonopolet_Skrutledalen',
	'Skrutlesvingen 47',
	'Skrutledalen',
	'0987',
	'42.48623',
	'94.53157',
);

export const mockStores = [mockStore1, mockStore2, mockStore3];
