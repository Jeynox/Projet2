import { fail, redirect } from '@sveltejs/kit';
import { ApiError, gql } from '#lib/server/api.ts';
import { setTokenCookie, str } from '#lib/server/admin.ts';
import { LOGIN } from '#lib/server/queries.ts';
import { loginLimiter } from '#lib/server/rate-limit.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	if (locals.token) redirect(303, '/admin');
};

export const actions: Actions = {
	default: async ({ request, cookies, getClientAddress }) => {
		const clientIp = getClientAddress();
		const form = await request.formData();
		const email = str(form, 'email').slice(0, 254);
		const password = String(form.get('password') ?? '');
		if (!email || !password)
			return fail(400, { email, error: 'E-mail et mot de passe requis.' });

		// Compté avant toute vérification ; remis à zéro seulement en cas de succès.
		const wait = loginLimiter.attempt(clientIp);
		if (wait > 0) {
			return fail(429, {
				email,
				error: `Trop de tentatives. Réessayez dans ${Math.ceil(wait / 60_000)} min.`
			});
		}

		try {
			const { login } = await gql<{ login: { token: string } }>(
				LOGIN,
				{ email, password: password.slice(0, 200) },
				{ clientIp }
			);
			loginLimiter.reset(clientIp);
			setTokenCookie(cookies, login.token);
		} catch (e) {
			if (e instanceof ApiError) {
				// Ralentit les robots : chaque échec coûte ~1 s.
				await new Promise((r) => setTimeout(r, 700 + Math.random() * 600));
				const status = e.code === 'TOO_MANY_REQUESTS' ? 429 : 401;
				return fail(status, { email, error: e.message });
			}
			throw e;
		}
		redirect(303, '/admin');
	}
};
