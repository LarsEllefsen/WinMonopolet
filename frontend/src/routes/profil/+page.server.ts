import { POST } from '$lib/server/POST';
import { env } from '$env/dynamic/private';

interface WishlistNotificationFormData extends FormData {
	get: (key: 'wishlistNotificationEmail' | 'wishlistNotificationType') => string | null;
}

export const actions = {
	wishlistNotification: async ({ request, locals }) => {
		const formData = (await request.formData()) as WishlistNotificationFormData;

		await POST<void>(
			`${env.API_URL}/api/user/notification`,
			{
				email: formData.get('wishlistNotificationEmail'),
				notificationType: formData.get('wishlistNotificationType')
			},
			locals.session.token
		);
	}
};
