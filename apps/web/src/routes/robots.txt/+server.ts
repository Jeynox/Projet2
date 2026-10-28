import { siteOrigin } from '#lib/server/site.ts';
import type { RequestHandler } from './$types';

/**
 * Tout le site public est indexable. Le back office n'est volontairement pas listé ici (ce fichier
 * est public et l'indiquerait aux curieux) : il est exclu par l'en-tête `X-Robots-Tag: noindex`
 * (hooks.server.ts) et n'est lié nulle part. Même chose pour le CV (PDF, données personnelles).
 */
export const GET: RequestHandler = ({ url }) =>
	new Response(`User-agent: *\nAllow: /\n\nSitemap: ${siteOrigin(url)}/sitemap.xml\n`, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'public, max-age=86400'
		}
	});
