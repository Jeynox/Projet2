import { redirect } from '@sveltejs/kit';
import { mutate } from '#lib/server/admin.ts';
import { readProductForm } from '#lib/server/product-form.ts';
import { CREATE_PRODUCT } from '#lib/server/queries.ts';
import type { Actions } from './$types';

export const actions: Actions = {
	save: async (event) => {
		const parsed = await readProductForm(event);
		if (parsed.failure) return parsed.failure;

		const res = await mutate<{ createProduct: { id: string } }>(event, CREATE_PRODUCT, {
			input: parsed.input
		});
		if (!res.ok) return res.failure;
		redirect(303, `/admin/produits/${res.data.createProduct.id}?created=1`);
	}
};
