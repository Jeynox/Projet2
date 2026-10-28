import { error } from '@sveltejs/kit';
import { categoryBySlug } from '#lib/catalog.ts';
import { gql } from '#lib/server/api.ts';
import { CATALOGUE_QUERY } from '#lib/server/queries.ts';
import type { Product } from '#lib/types.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const category = params.categorie ? categoryBySlug(params.categorie) : undefined;
	if (params.categorie && !category) error(404, 'Cette catégorie n’existe pas.');

	const { products } = await gql<{ products: Product[] }>(CATALOGUE_QUERY, {
		category: category?.value ?? null
	});
	return { products, category: category?.slug ?? null };
};
