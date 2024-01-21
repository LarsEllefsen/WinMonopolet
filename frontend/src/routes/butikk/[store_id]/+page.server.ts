import { GET } from '$lib/server/GET';
import { getUserProducts } from '$lib/server/user/getUserProducts';
import { fail } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { UserProduct } from '../../../types/product';
import type { Stock } from '../../../types/stock';
import { POST } from '$lib/server/POST';

const mapToProductWithUserInformation = (stock: Stock, userProducts: UserProduct[]) => {
	const userProduct = userProducts.find(
		(userProduct) => userProduct.untappdId == stock.product.untappd.untappd_id
	);
	if (userProduct) {
		stock.product.has_had = true;
		stock.product.user_score = userProduct.userScore;
	}
	return stock;
};

const getStockWithUserInformation = (stock: Stock[], userProducts: UserProduct[]) => {
	return stock.map((stock) => mapToProductWithUserInformation(stock, userProducts));
};

export async function load({ params, locals }) {
	let stock = await GET<Stock[]>(`${env.API_URL}/api/stores/${params.store_id}/products`);
	if (locals.session?.token) {
		const userProducts = await getUserProducts(locals.session.token);

		stock = getStockWithUserInformation(stock, userProducts);
	}

	return {
		stock
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
