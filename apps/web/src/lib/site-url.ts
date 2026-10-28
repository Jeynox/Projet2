const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * Valide SITE_URL et renvoie son origine (`https://mon-domaine.fr`, sans `/` final), ou
 * `undefined` si elle est vide. Une origine seule : ni chemin, ni paramètres, ni identifiants.
 */
export function parseSiteUrl(value: string | undefined): string | undefined {
	const trimmed = value?.trim();
	if (!trimmed) return undefined;
	let url: URL;
	try {
		url = new URL(trimmed);
	} catch {
		throw new Error(`SITE_URL invalide : ${trimmed}`);
	}
	if (url.protocol !== 'https:' && url.protocol !== 'http:') {
		throw new Error('SITE_URL doit commencer par https://');
	}
	if (url.username || url.password || url.search || url.hash || url.pathname !== '/') {
		throw new Error('SITE_URL doit être une origine seule (ex. https://mon-domaine.fr)');
	}
	return url.origin;
}

/**
 * Exigences de production, vérifiées au démarrage du serveur (hooks.server.ts) : SITE_URL
 * obligatoire, en https sauf sur localhost (stack Docker locale en http).
 */
export function assertProductionSiteUrl(origin: string | undefined): void {
	if (!origin)
		throw new Error('SITE_URL est obligatoire en production (ex. https://mon-domaine.fr)');
	const url = new URL(origin);
	if (url.protocol !== 'https:' && !LOCAL_HOSTS.has(url.hostname)) {
		throw new Error('SITE_URL doit être en https en production');
	}
}
