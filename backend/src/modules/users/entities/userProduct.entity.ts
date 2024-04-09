export class UserProduct {
	constructor(userId: string, untappdId: string, userScore: number) {
		this.userId = userId;
		this.untappdId = untappdId;
		this.userScore = userScore;
	}

	userId: string;

	untappdId: string;

	userScore: number;
}
