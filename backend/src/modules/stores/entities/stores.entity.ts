export class Store {
	constructor(
		storeId: string,
		name: string,
		formattedName: string,
		address: string,
		city: string | undefined,
		zip: string | undefined,
		lon: string,
		lat: string,
	) {
		this.store_id = storeId;
		this.name = name;
		this.formatted_name = formattedName;
		this.address = address;
		this.city = city;
		this.zip = zip;
		this.lon = lon;
		this.lat = lat;
	}

	store_id: string;

	name: string;

	formatted_name: string;

	address: string;

	city?: string;

	zip?: string;

	lon: string;

	lat: string;
}
