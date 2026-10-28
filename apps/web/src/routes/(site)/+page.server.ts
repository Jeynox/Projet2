import { ApiError, gql } from '#lib/server/api.ts';
import { HOME_QUERY } from '#lib/server/queries.ts';
import type { Product } from '#lib/types.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	try {
		const { products } = await gql<{ products: Product[] }>(HOME_QUERY);
		return { featured: products };
	} catch (e) {
		// L'accueil reste consultable même si l'API ne répond pas : la sélection est simplement masquée.
		if (e instanceof ApiError) {
			console.error('[accueil]', e.message);
			return { featured: [] as Product[] };
		}
		throw e;
	}
};
