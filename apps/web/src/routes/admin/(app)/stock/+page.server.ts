import { fail } from '@sveltejs/kit';
import { adminGql, int, mutate, str } from '#lib/server/admin.ts';
import { ADMIN_PRODUCTS, RESTOCK } from '#lib/server/queries.ts';
import type { Product } from '#lib/types.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { products } = await adminGql<{ products: Product[] }>(event, ADMIN_PRODUCTS);
	return { products: products.sort((a, b) => a.stock - b.stock) };
};

export const actions: Actions = {
	restock: async (event) => {
		const form = await event.request.formData();
		// Boutons rapides (+1, +5…) ou quantité saisie (négative pour retirer)
		const amount = int(form, 'amount') ?? int(form, 'custom');
		if (!amount) return fail(400, { error: 'Indiquez une quantité.' });

		const res = await mutate<{ restock: { name: string; stock: number } }>(event, RESTOCK, {
			id: str(form, 'id'),
			amount
		});
		if (!res.ok) return res.failure;
		const { name, stock } = res.data.restock;
		return { success: `${name} : ${stock} en stock.` };
	}
};
