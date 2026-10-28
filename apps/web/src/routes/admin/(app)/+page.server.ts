import { adminGql } from '#lib/server/admin.ts';
import { DASHBOARD_QUERY } from '#lib/server/queries.ts';
import { LOW_STOCK } from '#lib/catalog.ts';
import type { ContactMessage, CustomOrder, Product, Stats } from '#lib/types.ts';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const data = await adminGql<{
		stats: Stats;
		orders: CustomOrder[];
		messages: ContactMessage[];
		products: Product[];
	}>(event, DASHBOARD_QUERY);

	return {
		stats: data.stats,
		orders: data.orders
			.filter((o) => o.status === 'NEW' || o.status === 'IN_PROGRESS')
			.slice(0, 5),
		messages: data.messages.filter((m) => !m.read).slice(0, 4),
		lowStock: data.products
			.filter((p) => p.published && p.stock < LOW_STOCK)
			.sort((a, b) => a.stock - b.stock)
			.slice(0, 6)
	};
};
