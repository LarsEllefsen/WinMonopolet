import { UntappdProduct } from '@modules/products/entities/untappdProduct.entity';
import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';

export const mockUntappdProduct1: UntappdProduct = new UntappdProduct(
	'1',
	'1',
	'Imperial Stout',
	14,
	4.24,
	1546,
	'https://untappd.com/b/test-imperial-stout/1',
	'https://assets.untappd.com/site/beer_logos/test_sm.jpeg',
	'Stout - Imperial / Double',
	'Test',
	undefined,
);

export const mockVinmonopoletProduct1: VinmonopoletProduct =
	new VinmonopoletProduct(
		'1',
		'Test Imperial Stout',
		'https://www.vinmonopolet.no/Land/Norge/Test/p/1',
		499.9,
		'Øl',
		'Porter & Stout',
		'Basisutvalget',
		'33cl',
		'Norge',
		undefined,
		undefined,
		true,
		true,
		null,
		mockUntappdProduct1,
	);

export const mockUntappdProduct2: UntappdProduct = new UntappdProduct(
	'2',
	'2',
	'Double IPA',
	8,
	3.89,
	400,
	'https://untappd.com/b/mock-brewery-double-ipa/2',
	'https://assets.untappd.com/site/beer_logos/test_sm.jpeg',
	'India Pale Ale - Double',
	'Mock Brewery',
	undefined,
);

export const mockVinmonopoletProduct2: VinmonopoletProduct =
	new VinmonopoletProduct(
		'2',
		'Mock Brewery Double IPA',
		'https://www.vinmonopolet.no/Land/Norge/Test/p/2',
		109.45,
		'Øl',
		'India Pale Ale',
		'Tillegsutvalget',
		'44cl',
		'Tyskland',
		undefined,
		undefined,
		true,
		true,
		null,
		mockUntappdProduct2,
	);

const mockUntappdProduct3: UntappdProduct = new UntappdProduct(
	'3',
	'3',
	'Fake Cider',
	5.6,
	1.9,
	19,
	'https://untappd.com/b/fake-cider/3',
	'https://assets.untappd.com/site/beer_logos/test_sm.jpeg',
	'Cider - Dry',
	'Fake Cidery',
	undefined,
);

export const mockVinmonopoletProduct3: VinmonopoletProduct =
	new VinmonopoletProduct(
		'3',
		'Fake Cider',
		'https://www.vinmonopolet.no/Land/Norge/Test/p/3',
		200,
		'Sider',
		null,
		'Tillegsutvalget',
		'44cl',
		'Sverige',
		undefined,
		undefined,
		true,
		true,
		null,
		mockUntappdProduct3,
	);

export const mockVinmonopoletProductWithoutAssociatedUntappdProduct: VinmonopoletProduct =
	new VinmonopoletProduct(
		'without_untappd_product',
		'Lonely Pilsner',
		'https://www.vinmonopolet.no/Land/Norge/Test/p/without_untappd_product',
		89.9,
		'Øl',
		'Lys Lager',
		'Bestillingsutvalget',
		'50cl',
		'England',
		undefined,
		undefined,
		true,
		true,
		null,
		undefined,
	);

const mockUntappdProduct4: UntappdProduct = new UntappdProduct(
	'4',
	'4',
	'Loco Lambic',
	6,
	2.45,
	9999,
	'https://untappd.com/b/test-lambic/1',
	'https://assets.untappd.com/site/beer_logos/test_sm.jpeg',
	'Sour - Lambic',
	'Test',
	undefined,
);

export const mockVinmonopoletProduct4: VinmonopoletProduct =
	new VinmonopoletProduct(
		'4',
		'Loco Lambic',
		'https://www.vinmonopolet.no/Land/Norge/Test/p/2',
		99.9,
		'Øl',
		'Surøl',
		'Tillegsutvalget',
		'44cl',
		'Tyskland',
		undefined,
		undefined,
		false,
		true,
		null,
		mockUntappdProduct4,
	);

const mockUntappdProduct5: UntappdProduct = new UntappdProduct(
	'5',
	'5',
	'Mead Madness',
	12,
	5.0,
	15,
	'https://untappd.com/b/test-mead/2',
	'https://assets.untappd.com/site/beer_logos/test_sm.jpeg',
	'Mead - Melomel',
	'Test',
	undefined,
);

const mockUpcomingUntappdProduct1: UntappdProduct = new UntappdProduct(
	'upcoming_1',
	'upcoming_1',
	'Upcoming Hypejuice',
	12,
	5.0,
	15,
	'https://untappd.com/b/upcoming-hype/5',
	'https://assets.untappd.com/site/beer_logos/test_sm.jpeg',
	'Sour - Fruited',
	'Test',
	undefined,
);

export const mockVinmonopoletProduct5: VinmonopoletProduct =
	new VinmonopoletProduct(
		'5',
		'Mead Madness',
		'https://www.vinmonopolet.no/Land/Norge/Test/p/2',
		99.9,
		'Mjød',
		null,
		'Basisutvalget',
		'33cl',
		'Norge',
		undefined,
		undefined,
		false,
		true,
		null,
		mockUntappdProduct5,
	);

export const mockUntappdProductWithScoreOf0: UntappdProduct =
	new UntappdProduct(
		'score_zero',
		'1',
		'Imperial Stout',
		14,
		0,
		1546,
		'https://untappd.com/b/test-imperial-stout/1',
		'https://assets.untappd.com/site/beer_logos/test_sm.jpeg',
		'Stout - Imperial / Double',
		'Test',
		undefined,
	);

export const mockUpcomingVinmonopoletProduct1 = new VinmonopoletProduct(
	'upcoming_1',
	'Upcoming Hype',
	'https://www.vinmonopolet.no/Land/Norge/Test/p/1',
	123.45,
	'Øl',
	null,
	'Basisutvalget',
	'33cl',
	'Norge',
	undefined,
	undefined,
	false,
	true,
	'Lanseres 07.05.2024',
	mockUpcomingUntappdProduct1,
);

export const mockUpcomingVinmonopoletProduct2 = new VinmonopoletProduct(
	'upcoming_2',
	'Boring Bayer',
	'https://www.vinmonopolet.no/Land/Norge/Test/p/2',
	100,
	'Øl',
	null,
	'Basisutvalget',
	'33cl',
	'Norge',
	undefined,
	undefined,
	false,
	true,
	'Lanseres 08.05.2024',
	undefined,
);

export const mockProducts = [
	mockVinmonopoletProduct1,
	mockVinmonopoletProduct2,
	mockVinmonopoletProduct3,
	mockVinmonopoletProduct4,
	mockVinmonopoletProduct5,
];
