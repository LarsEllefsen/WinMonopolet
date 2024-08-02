import { env } from '$env/dynamic/private';
import { POST } from '$lib/server/POST';
import { getStock } from '$lib/server/stores/getStock';

export async function load({ params }) {
	return {
		stock: getStock(params.store_id)
	};
}

interface SendErrorReportFormData extends FormData {
	get: (
		key: 'errorType' | 'userMessage' | 'productName' | 'productId' | 'correctUntappdUrl'
	) => string | null;
}

export const actions = {
	sendErrorReport: async ({ request }) => {
		const formData = (await request.formData()) as SendErrorReportFormData;

		await POST<void>(`${env.API_URL}/api/mail/error_report`, {
			product_name: formData.get('productName'),
			product_id: formData.get('productId'),
			error_type: formData.get('errorType'),
			message: formData.get('userMessage'),
			correct_untappd_url: formData.get('correctUntappdUrl')
		});
	}
};
