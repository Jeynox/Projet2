import { adminGql, mutate, str } from '#lib/server/admin.ts';
import { ADMIN_PRODUCTS, DELETE_PRODUCT } from '#lib/server/queries.ts';
import type { Product } from '#lib/types.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { products } = await adminGql<{ products: Product[] }>(event, ADMIN_PRODUCTS);
	return { products };
};

export const actions: Actions = {
	delete: async (event) => {
		const form = await event.request.formData();
		const res = await mutate(event, DELETE_PRODUCT, { id: str(form, 'id') });
		if (!res.ok) return res.failure;
		return { success: `« ${str(form, 'name')} » a été supprimé.` };
	}
};
