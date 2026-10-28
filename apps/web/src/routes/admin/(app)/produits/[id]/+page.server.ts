import { error } from '@sveltejs/kit';
import { adminGql, mutate } from '#lib/server/admin.ts';
import { readProductForm } from '#lib/server/product-form.ts';
import { ADMIN_PRODUCT, UPDATE_PRODUCT } from '#lib/server/queries.ts';
import type { Product } from '#lib/types.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	if (!/^\d{1,9}$/.test(event.params.id)) error(404, 'Produit introuvable');
	const { productById } = await adminGql<{ productById: Product | null }>(event, ADMIN_PRODUCT, {
		id: event.params.id
	});
	if (!productById) error(404, 'Produit introuvable');
	return { product: productById, created: event.url.searchParams.has('created') };
};

export const actions: Actions = {
	save: async (event) => {
		const parsed = await readProductForm(event);
		if (parsed.failure) return parsed.failure;

		const res = await mutate(event, UPDATE_PRODUCT, {
			id: event.params.id,
			input: parsed.input
		});
		if (!res.ok) return res.failure;
		return { success: 'Modifications enregistrées.' };
	}
};
