export class UserWishlistProduct {
	constructor(userId: string, untappdId: string, added?: Date) {
		this.userId = userId;
		this.untappdId = untappdId;
		this.added = added;
	}

	userId: string;

	untappdId: string;

	added?: Date;
}
