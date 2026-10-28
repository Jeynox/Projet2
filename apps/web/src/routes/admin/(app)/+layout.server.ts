import { redirect } from '@sveltejs/kit';
import { adminGql, TOKEN_COOKIE } from '#lib/server/admin.ts';
import type { Stats } from '#lib/types.ts';
import type { LayoutServerLoad } from './$types';

const LAYOUT_QUERY = `query AdminLayout { me stats { pendingOrders unreadMessages lowStock } }`;

export const load: LayoutServerLoad = async (event) => {
	const { me, stats } = await adminGql<{
		me: string | null;
		stats: Pick<Stats, 'pendingOrders' | 'unreadMessages' | 'lowStock'>;
	}>(event, LAYOUT_QUERY);
	if (!me) {
		// Jeton expiré, falsifié ou signé avec un ancien secret : on l'oublie (sinon boucle avec /admin/login).
		event.cookies.delete(TOKEN_COOKIE, { path: '/' });
		redirect(303, '/admin/login');
	}
	return { adminEmail: me, counters: stats };
};
