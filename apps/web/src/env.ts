import { defineEnvVars } from '@sveltejs/kit/env';
import { parseSiteUrl } from './lib/site-url.ts';

export const variables = defineEnvVars({
	API_URL: {
		description: "URL de l'API Node (sans /graphql), appelée côté serveur uniquement.",
		schema: (value) => (value || 'http://localhost:4000').replace(/\/$/, '')
	},
	SITE_URL: {
		description:
			"URL publique du site (ex. https://mon-domaine.fr) : URL canoniques, sitemap, Open Graph. Obligatoire en prod — jamais déduite de l'en-tête Host, falsifiable.",
		schema: (value) => parseSiteUrl(value)
	},
	INTERNAL_API_KEY: {
		description:
			"Clé partagée avec l'API : sans elle, l'API refuse les requêtes. Obligatoire en prod, vide en dev.",
		schema: (value) => value ?? ''
	}
});
