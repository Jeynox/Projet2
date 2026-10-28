import { SITE_URL } from '$app/env/private';

/**
 * Origine publique du site : SITE_URL (obligatoire en prod, cf. src/env.ts), sinon celle de la
 * requête — en dev uniquement, car l'en-tête Host peut être falsifié.
 */
export const siteOrigin = (url: URL): string => SITE_URL ?? url.origin;
