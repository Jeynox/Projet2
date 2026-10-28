import { adminGql, mutate, str } from '#lib/server/admin.ts';
import { DELETE_ORDER, ORDERS_QUERY, SET_ORDER_STATUS } from '#lib/server/queries.ts';
import type { CustomOrder } from '#lib/types.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { orders } = await adminGql<{ orders: CustomOrder[] }>(event, ORDERS_QUERY);
	return { orders };
};

export const actions: Actions = {
	status: async (event) => {
		const form = await event.request.formData();
		const res = await mutate(event, SET_ORDER_STATUS, {
			id: str(form, 'id'),
			status: str(form, 'status')
		});
		if (!res.ok) return res.failure;
		return { success: `Commande n° ${str(form, 'id')} mise à jour.` };
	},
	delete: async (event) => {
		const form = await event.request.formData();
		const res = await mutate(event, DELETE_ORDER, { id: str(form, 'id') });
		if (!res.ok) return res.failure;
		return { success: `Commande n° ${str(form, 'id')} supprimée.` };
	}
};
