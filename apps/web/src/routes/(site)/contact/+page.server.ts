import { fail } from '@sveltejs/kit';
import { str } from '#lib/server/admin.ts';
import { isBot, submitPublicForm } from '#lib/server/public-form.ts';
import { SEND_MESSAGE } from '#lib/server/queries.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	// « Réserver cet article » depuis une fiche produit : message pré-rempli
	const produit = (url.searchParams.get('produit') ?? '').slice(0, 100);
	return {
		prefill: produit ? `Bonjour, je souhaiterais réserver l'article « ${produit} ».` : ''
	};
};

export const actions: Actions = {
	default: async (event) => {
		const form = await event.request.formData();
		const values = {
			name: str(form, 'name').slice(0, 120),
			email: str(form, 'email').slice(0, 200),
			body: str(form, 'body').slice(0, 2000)
		};

		if (isBot(form)) return { success: true };
		if (!values.name || !values.email || !values.body) {
			return fail(400, { error: 'Merci de remplir tous les champs.', values });
		}

		const res = await submitPublicForm(event, SEND_MESSAGE, { input: values }, values);
		if (!res.ok) return res.failure;
		return { success: true };
	}
};
