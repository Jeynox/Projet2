import { gql } from '#lib/server/api.ts';
import { SITEMAP_QUERY } from '#lib/server/queries.ts';
import { siteOrigin } from '#lib/server/site.ts';
import { CATEGORIES } from '#lib/catalog.ts';
import { xmlEscape } from '#lib/seo.ts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const origin = siteOrigin(url);
	const { products } = await gql<{ products: { slug: string; updatedAt: string }[] }>(
		SITEMAP_QUERY
	);

	const pages = [
		{ path: '/' },
		{ path: '/catalogue' },
		...CATEGORIES.map((c) => ({ path: `/catalogue/${c.slug}` })),
		{ path: '/bouquet-sur-mesure' },
		{ path: '/contact' },
		...products.map((p) => ({ path: `/produit/${p.slug}`, lastmod: p.updatedAt }))
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
	.map(
		(p) =>
			`	<url><loc>${xmlEscape(origin + p.path)}</loc>${'lastmod' in p && p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''}</url>`
	)
	.join('\n')}
</urlset>`;

	return new Response(body, {
		headers: {
			'content-type': 'application/xml; charset=utf-8',
			'cache-control': 'public, max-age=3600'
		}
	});
};
