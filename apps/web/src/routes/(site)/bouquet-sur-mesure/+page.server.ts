import { fail } from '@sveltejs/kit';
import { BOUQUET_STEPS } from '#lib/catalog.ts';
import { str } from '#lib/server/admin.ts';
import { isBot, submitPublicForm } from '#lib/server/public-form.ts';
import { CREATE_ORDER } from '#lib/server/queries.ts';
import type { Actions } from './$types';

const FIELDS = ['customerName', 'email', 'phone', 'note', ...BOUQUET_STEPS.map((s) => s.name)];

export const actions: Actions = {
	default: async (event) => {
		const form = await event.request.formData();
		const values = Object.fromEntries(
			FIELDS.map((name) => [name, str(form, name).slice(0, 1000)])
		);

		// Robot : on fait comme si tout s'était bien passé, sans rien enregistrer.
		if (isBot(form)) return { success: true, orderId: '0' };

		const missing = BOUQUET_STEPS.filter((s) => !values[s.name]).map((s) =>
			s.title.toLowerCase()
		);
		if (missing.length) {
			return fail(400, { error: `Il manque : ${missing.join(', ')}.`, values });
		}
		if (!values.customerName || !values.email) {
			return fail(400, {
				error: 'Indiquez votre nom et votre e-mail pour être recontacté.',
				values
			});
		}

		const res = await submitPublicForm<{ createOrder: string }>(
			event,
			CREATE_ORDER,
			{ input: values },
			values
		);
		if (!res.ok) return res.failure;
		return { success: true, orderId: res.data.createOrder };
	}
};
