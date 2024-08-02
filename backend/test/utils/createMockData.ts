import { Store } from '@modules/stores/entities/stores.entity';
import { Stock } from '@modules/stores/entities/stock.entity';
import { UntappdProduct } from '@modules/products/entities/untappdProduct.entity';
import { VinmonopoletProduct } from '@modules/products/entities/vinmonopoletProduct.entity';
import { UntappdSearchProductDTO } from '@modules/untappd/dto/UntappdSearchProductDTO';
import { BaseProduct, Pagination } from 'vinmonopolet-ts';
import { IGetProductsResponse } from 'vinmonopolet-ts/dist/types/retrievers/getProducts';
import { UntappdSearchResultDTO } from '@modules/untappd/dto/UntappdSearchResultDTO';
import { UntappdProductDTO } from '@modules/untappd/dto/UntappdProductDTO';
import { Word } from '@modules/wordlist/entities/word';
import { GetBeerInfoResponseDTO } from '@modules/untappd/dto/GetBeerInfoResponseDTO';
import { randomBytes } from 'crypto';
import { UntappdUserProductDTO } from '@modules/untappd/dto/UntappdUserProductDTO';
import { VinmonopoletProductWithStockLevel } from '@modules/vinmonopolet/vinmonopolet.interface';

const test_store_id = '160';

export const createMockStore = ({
	store_id = test_store_id,
	name = 'Trondheim, Trondheim Torg',
	formatted_name = 'trondheim_trondheim_torg',
	address = 'Kongens Gate 11',
	city = 'Trondheim',
	lat = '63.4303344',
	lon = '10.3932725',
	zip = '7013',
}) => {
	return new Store(
		store_id,
		name,
		formatted_name,
		address,
		city,
		zip,
		lon,
		lat,
	);
};

export const createMockStock = ({
	storeId = '161',
	product = createMockVinmonopoletProduct({}),
	stock_level = 5,
	last_updated = new Date('2023-03-19T21:26:51.582Z'),
}) => {
	return new Stock(storeId, product, stock_level, last_updated);
};

type CreateMockVinmonopoletProduct = {
	vmp_id?: string;
	vmp_name?: string;
	vmp_url?: string;
	category?: string;
	sub_category?: string;
	price?: number;
	product_selection?: string;
	container_size?: string;
	country?: string;
	added_date?: Date;
	active?: boolean;
	last_updated?: Date;
	buyable?: boolean;
	availability?: string | null;
	untappd?: UntappdProduct;
};

export const createMockVinmonopoletProduct = ({
	vmp_id = '14962702',
	vmp_name = 'Lervig Paragon Bourbon Barrel 2021',
	vmp_url = 'https://www.vinmonopolet.no/Land/Norge/Rogaland/Stavanger/Lervig-Paragon-Bourbon-Barrel-2021/p/14962702',
	category = 'Øl',
	sub_category = 'Barley Wine',
	price = 224.7,
	product_selection = 'Tilleggsutvalget',
	container_size = '37.5cl',
	country = 'Norge',
	added_date = new Date(),
	active = true,
	last_updated = new Date(),
	buyable = true,
	availability = null,
	untappd = undefined,
}: CreateMockVinmonopoletProduct) => {
	return new VinmonopoletProduct(
		vmp_id,
		vmp_name,
		vmp_url,
		price,
		category,
		sub_category,
		product_selection,
		container_size,
		country,
		added_date,
		last_updated,
		active,
		buyable,
		availability,
		untappd,
	);
};

export const createMockUntappdProduct = ({
	vmp_id = '14962702',
	untappd_id = '5072941',
	abv = 13.8,
	brewery = 'LERVIG',
	num_ratings = 2817,
	rating = 4.27,
	style = 'Barleywine - Other',
	picture_url = 'https://assets.untappd.com/site/beer_logos/beer-5072941_32454_sm.jpeg',
	untappd_name = 'Paragon 2021 By Rackhouse',
	untappd_url = 'https://untappd.com/b/lervig-paragon-2021-by-rackhouse/5072941',
	last_updated = undefined,
}) => {
	return new UntappdProduct(
		untappd_id,
		vmp_id,
		untappd_name,
		abv,
		rating,
		num_ratings,
		untappd_url,
		picture_url,
		style,
		brewery,
		last_updated,
	);
};

export const createMockVinmonopoletSearchResult = ({
	mockProductsToReturn = [] as BaseProduct[],
	currentPage = 1,
	pageSize = 50,
	totalPages = 1,
	totalResults = 1,
	hasNext = false,
	hasPrevious = false,
	sort = 'asc',
}) => {
	const mockPagination = {
		currentPage,
		pageSize,
		totalPages,
		totalResults,
		hasNext,
		hasPrevious,
		sort,
	};

	return {
		pagination: new Pagination(mockPagination, {}, () =>
			Promise.resolve({} as IGetProductsResponse),
		),
		products: mockProductsToReturn,
	};
};

export const createMockVinmonopoletProductDTO = ({
	code = '14962702',
	name = 'Lervig Paragon Bourbon Barrel 2021',
	url = 'https://www.vinmonopolet.no/Land/Norge/Rogaland/Stavanger/Lervig-Paragon-Bourbon-Barrel-2021/p/14962702',
	mainCategory = { name: 'Øl' },
	mainCountry = { name: 'Norge' },
	mainSubCategory = { name: 'Barley Wine' },
	district = { name: null, code: null, url: null },
	price = 224.7,
	pricePerLiter = 739,
	images = [
		{
			format: 'thumbnail',
			type: 'Primary',
			url: 'https://bilder.vinmonopolet.no',
			size: { maxHeight: 68, maxWidth: 68 },
		},
	],
	productSelection = 'Tilleggsutvalget',
	productType = 'Øl',
	volume = {
		value: 37.5,
		formattedValue: '37,5cl',
		unit: 'cl',
	},
}) => {
	const baseProduct = new BaseProduct({ code: code });

	baseProduct.name = name;
	baseProduct.url = url;
	baseProduct.mainCategory = { ...mainCategory, ...{ code: null, url: null } };
	baseProduct.mainSubCategory = {
		...mainSubCategory,
		...{ code: null, url: null },
	};
	baseProduct.mainCountry = { ...mainCountry, ...{ code: null, url: null } };
	baseProduct.price = price;
	baseProduct.pricePerLiter = pricePerLiter;
	baseProduct.images = images;
	baseProduct.productSelection = productSelection;
	baseProduct.productType = productType;
	baseProduct.volume = volume;
	baseProduct.district = district;
	baseProduct.subDistrict = district;
	baseProduct.productAvailability = {
		deliveryAvailability: {
			availableForPurchase: true,
			infos: [
				{ availability: '15 stk på lager', readableValue: '15 stk på lager' },
			],
		},
		storesAvailability: {
			availableForPurchase: true,
			infos: [
				{ availability: '15 stk på lager', readableValue: '15 stk på lager' },
			],
		},
	};
	baseProduct.buyable = true;
	baseProduct.status = '';

	return baseProduct;
};

export const createMockUntappdProductDTO = ({
	bid = 5072941,
	beer_name = 'Paragon 2021 By Rackhouse',
	brewery_name = 'LERVIG',
	beer_abv = 13.8,
	beer_slug = 'lervig-paragon-2021-by-rackhouse',
	beer_style = 'Barleywine - Other',
	beer_label = 'https://assets.untappd.com/site/beer_logos/beer-5072941_32454_sm.jpeg',
	rating_count = 4021,
	rating_score = 4.24,
}) => {
	const untappdProductDTO = new UntappdProductDTO();
	untappdProductDTO.bid = bid;
	untappdProductDTO.beer_name = beer_name;
	untappdProductDTO.beer_abv = beer_abv;
	untappdProductDTO.beer_slug = beer_slug;
	untappdProductDTO.beer_style = beer_style;
	untappdProductDTO.beer_label = beer_label;
	untappdProductDTO.rating_count = rating_count;
	untappdProductDTO.rating_score = rating_score;
	untappdProductDTO.in_production = 1;
	untappdProductDTO.wish_list = false;
	untappdProductDTO.auth_rating = 0;
	untappdProductDTO.beer_description = 'beer description';
	untappdProductDTO.beer_ibu = 0;
	untappdProductDTO.brewery = {
		brewery_name: brewery_name,
		brewery_active: 1,
		brewery_id: 1234,
		brewery_label:
			'https://assets.untappd.com/site/brewery_logos/brewery-6826_d3c95.jpeg',
		brewery_page_url: 'https://untappd.com/LervigAS',
		brewery_slug: 'lervig',
		brewery_type: 'Regional Brewery',
		country_name: 'Norway',
	};
	return untappdProductDTO;
};

export const createMockUntappdSearchProductDTO = ({
	bid = 5072941,
	beer_abv = 13.8,
	beer_name = 'Paragon 2021 By Rackhouse',
	beer_style = 'Barleywine - Other',
	beer_slug = 'lervig-paragon-2021-by-rackhouse',
	brewery_name = 'LERVIG',
}) => {
	const untappdSearchProductDTO = new UntappdSearchProductDTO();
	untappdSearchProductDTO.beer = {
		bid: bid,
		beer_abv: beer_abv,
		beer_name: beer_name,
		beer_style: beer_style,
		beer_slug: beer_slug,
		auth_rating: 0,
		beer_description: 'beer description',
		beer_ibu: 0,
		beer_label:
			'https://assets.untappd.com/site/beer_logos/beer-5072941_32454_sm.jpeg',
		created_at: '2023-10-23',
		in_production: 1,
		wish_list: false,
	};
	untappdSearchProductDTO.brewery = {
		brewery_name: brewery_name,
		brewery_active: 1,
		brewery_id: 1234,
		brewery_label:
			'https://assets.untappd.com/site/brewery_logos/brewery-6826_d3c95.jpeg',
		brewery_page_url: 'https://untappd.com/LervigAS',
		brewery_slug: 'lervig',
		brewery_type: 'Regional Brewery',
		country_name: 'Norway',
	};
	return untappdSearchProductDTO;
};

export const createMockUntappdSearchResultDTO = ({
	found = 1,
	limit = 25,
	offset = 0,
	term = 'searchTerm',
	parsed_term = 'searchTerm',
	count = 1,
	beers = [createMockUntappdSearchProductDTO({})],
}) => {
	const searchResultDTO = new UntappdSearchResultDTO();
	searchResultDTO.found = found;
	searchResultDTO.limit = limit;
	searchResultDTO.offset = offset;
	searchResultDTO.term = term;
	searchResultDTO.parsed_term = parsed_term;
	searchResultDTO.beers = {
		count: count,
		items: beers,
	};
	return searchResultDTO;
};

export const createMockGetBeerInfoResponsetDTO = ({
	bid = 5072941,
	beer_abv = 13.8,
	beer_name = 'Paragon 2021 By Rackhouse',
	beer_style = 'Barleywine - Other',
	beer_slug = 'lervig-paragon-2021-by-rackhouse',
	brewery_name = 'LERVIG',
	rating_count = 2995,
	rating_score = 4.27,
	auth_rating = 5.0,
	picture_url = 'https://assets.untappd.com/site/beer_logos/beer-5072941_32454_sm.jpeg',
}) => {
	const mockGetBeerInfoResponseDTO = new GetBeerInfoResponseDTO();
	mockGetBeerInfoResponseDTO.beer = createMockUntappdProductDTO({
		rating_count,
		rating_score,
		beer_label: picture_url,
		brewery_name,
		bid,
		beer_abv,
		beer_style,
		beer_slug,
	});
	return mockGetBeerInfoResponseDTO;
};

export const createMockWord = (id: number, value: string) => {
	return new Word(id, value);
};

export const createMockVinmonopoletProductWithStockLevel = ({
	vmp_id = '14962702',
	vmp_name = 'Lervig Paragon Bourbon Barrel 2021',
	vmp_url = 'https://www.vinmonopolet.no/Land/Norge/Rogaland/Stavanger/Lervig-Paragon-Bourbon-Barrel-2021/p/14962702',
	category = 'Øl',
	sub_category = 'Barley Wine',
	price = 224.7,
	product_selection = 'Tilleggsutvalget',
	container_size = '37.5cl',
	country = 'Norge',
	added_date = new Date(),
	active = true,
	last_updated = new Date(),
	buyable = true,
	availability = null,
	untappd = undefined,
	stockLevel = 1,
}: CreateMockVinmonopoletProduct & { stockLevel: number }) => {
	return {
		stockLevel,
		vinmonopoletProduct: new VinmonopoletProduct(
			vmp_id,
			vmp_name,
			vmp_url,
			price,
			category,
			sub_category,
			product_selection,
			container_size,
			country,
			added_date,
			last_updated,
			active,
			buyable,
			availability,
			untappd,
		),
	} as VinmonopoletProductWithStockLevel;
};

export const createMockUntappdUserProductDTO = () => {
	const untappdUserProductDTO = new UntappdUserProductDTO();
	untappdUserProductDTO.beer = createMockUntappdProductDTO({});
	untappdUserProductDTO.count = 1;
	untappdUserProductDTO.first_had = 'today';
	untappdUserProductDTO.rating_score = 4.5;
	untappdUserProductDTO.user_auth_rating_score = 4.5;

	return untappdUserProductDTO;
};
