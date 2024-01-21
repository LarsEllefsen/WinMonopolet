export async function load({ locals }) {
	return {
		errorDuringLogin: locals.errorDuringLogin
	};
}
