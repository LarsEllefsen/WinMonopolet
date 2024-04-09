export class UntappdUser {
	constructor(
		id: string,
		userName: string,
		userAvatar: string,
		userAvatarHD: string,
		firstName: string | undefined,
	) {
		this.id = id;
		this.userName = userName;
		this.userAvatar = userAvatar;
		this.userAvatarHD = userAvatarHD;
		this.firstName = firstName;
	}

	id: string;

	userName: string;

	userAvatar: string;

	userAvatarHD: string;

	firstName?: string;
}
