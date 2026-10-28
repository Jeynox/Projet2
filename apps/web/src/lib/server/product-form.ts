import { fail, type RequestEvent } from '@sveltejs/kit';
import { CATEGORIES } from '#lib/catalog.ts';
import { ApiError } from './api';
import { bool, cents, int, resolveUpload, str } from './admin';

/**
 * Lit le formulaire produit et prépare l'input GraphQL (l'image éventuelle est envoyée à l'API).
 * Renvoie un `fail()` affichable en cas de saisie invalide.
 */
export async function readProductForm(event: Pick<RequestEvent, 'locals' | 'request'>) {
	const form = await event.request.formData();
	const priceCents = cents(form, 'price');
	const stock = int(form, 'stock');
	const category = str(form, 'category');

	if (!str(form, 'name')) return { failure: fail(400, { error: 'Le nom est obligatoire.' }) };
	if (priceCents === null) return { failure: fail(400, { error: 'Prix invalide (ex. 12,50).' }) };
	if (stock === null || stock < 0) return { failure: fail(400, { error: 'Stock invalide.' }) };
	if (!CATEGORIES.some((c) => c.value === category)) {
		return { failure: fail(400, { error: 'Choisissez une catégorie.' }) };
	}

	let imageUrl: string | null;
	try {
		imageUrl = await resolveUpload(event, form, 'imageUrl');
	} catch (e) {
		if (e instanceof ApiError) return { failure: fail(400, { error: e.message }) };
		throw e;
	}

	return {
		input: {
			name: str(form, 'name'),
			slug: str(form, 'slug') || null,
			category,
			priceCents,
			stock,
			description: str(form, 'description'),
			imageUrl,
			featured: bool(form, 'featured'),
			published: bool(form, 'published'),
			position: int(form, 'position')
		}
	};
}
