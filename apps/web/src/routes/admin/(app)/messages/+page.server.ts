import { adminGql, mutate, str } from '#lib/server/admin.ts';
import { DELETE_MESSAGE, MESSAGES_QUERY, SET_MESSAGE_READ } from '#lib/server/queries.ts';
import type { ContactMessage } from '#lib/types.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { messages } = await adminGql<{ messages: ContactMessage[] }>(event, MESSAGES_QUERY);
	return { messages };
};

export const actions: Actions = {
	read: async (event) => {
		const form = await event.request.formData();
		const res = await mutate(event, SET_MESSAGE_READ, {
			id: str(form, 'id'),
			read: str(form, 'read') === 'true'
		});
		if (!res.ok) return res.failure;
	},
	delete: async (event) => {
		const form = await event.request.formData();
		const res = await mutate(event, DELETE_MESSAGE, { id: str(form, 'id') });
		if (!res.ok) return res.failure;
		return { success: 'Message supprimé.' };
	}
};
