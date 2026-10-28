import { error } from '@sveltejs/kit';
import { gql } from '#lib/server/api.ts';
import { PRODUCT_QUERY } from '#lib/server/queries.ts';
import type { Product } from '#lib/types.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	if (!/^[a-z0-9-]{1,120}$/.test(params.slug)) error(404, 'Produit introuvable');

	const { product, products } = await gql<{ product: Product | null; products: Product[] }>(
		PRODUCT_QUERY,
		{ slug: params.slug }
	);
	if (!product) error(404, 'Produit introuvable');

	// Suggestions : même catégorie d'abord, puis le reste du catalogue
	const related = products
		.filter((p) => p.id !== product.id)
		.sort(
			(a, b) =>
				Number(b.category === product.category) - Number(a.category === product.category)
		)
		.slice(0, 4);

	return { product, related };
};
