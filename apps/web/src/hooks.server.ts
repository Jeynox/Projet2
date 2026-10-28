import { redirect } from '@sveltejs/kit';
import type { Handle, ServerInit } from '@sveltejs/kit/hooks';
import { building, dev } from '$app/env';
import { SITE_URL } from '$app/env/private';
import { assertProductionSiteUrl } from '#lib/site-url.ts';
import { TOKEN_COOKIE } from '#lib/server/admin.ts';

/** En-têtes de sécurité ajoutés à toutes les réponses (la CSP est gérée par SvelteKit, cf. vite.config.ts). */
const SECURITY_HEADERS: Record<string, string> = {
	'x-content-type-options': 'nosniff',
	'x-frame-options': 'DENY',
	'referrer-policy': 'strict-origin-when-cross-origin',
	'permissions-policy':
		'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=(), interest-cohort=()',
	'cross-origin-opener-policy': 'same-origin',
	'cross-origin-resource-policy': 'same-origin',
	'origin-agent-cluster': '?1',
	'x-dns-prefetch-control': 'off',
	'x-permitted-cross-domain-policies': 'none',
	...(dev ? {} : { 'strict-transport-security': 'max-age=63072000; includeSubDomains' })
};

/** Refuse de démarrer en production sans URL publique valide (cf. src/env.ts). */
export const init: ServerInit = () => {
	if (!dev && !building) assertProductionSiteUrl(SITE_URL);
};

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.token = event.cookies.get(TOKEN_COOKIE) ?? null;

	const { pathname } = event.url;
	const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
	const isPublicAdmin = pathname === '/admin/login';

	if (isAdmin && !isPublicAdmin && !event.locals.token) {
		redirect(303, '/admin/login');
	}

	const response = await resolve(event);
	for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
		if (!response.headers.has(name)) response.headers.set(name, value);
	}
	if (isAdmin) {
		response.headers.set('x-robots-tag', 'noindex, nofollow');
		response.headers.set('cache-control', 'no-store');
	}
	return response;
};
