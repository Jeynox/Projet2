const isProd = process.env.NODE_ENV === 'production';

function required(name: string, devFallback?: string): string {
	const value = process.env[name];
	if (value) return value;
	if (!isProd && devFallback !== undefined) return devFallback;
	throw new Error(`Variable d'environnement manquante : ${name}`);
}

/** Secret obligatoire en prod, d'au moins 32 caractères (ex. `openssl rand -hex 32`). */
function secret(name: string, devFallback: string): string {
	const value = required(name, devFallback);
	if (isProd && value.length < 32) {
		throw new Error(`${name} doit faire au moins 32 caractères en production`);
	}
	return value;
}

export const config = {
	isProd,
	port: Number(process.env.PORT ?? 4000),
	databaseUrl: required('DATABASE_URL', 'postgres://strasbouq:strasbouq@localhost:5432/strasbouq'),
	jwtSecret: secret('JWT_SECRET', 'dev-secret-a-changer'),
	jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
	/**
	 * Clé partagée avec le serveur SvelteKit. Quand elle est définie, l'API refuse toute requête
	 * qui ne la présente pas (sauf /health) : elle n'est joignable que par le front.
	 * Obligatoire en prod ; vide en dev pour garder l'explorateur GraphQL accessible.
	 */
	internalKey: isProd ? secret('INTERNAL_API_KEY', '') : (process.env.INTERNAL_API_KEY ?? ''),
	uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
	/** Photos du catalogue de démo. */
	seedDir: process.env.SEED_DIR ?? 'seed',
	adminEmail: process.env.ADMIN_EMAIL,
	adminPassword: process.env.ADMIN_PASSWORD,
	/**
	 * Remplissage automatique d'une base vide : `true` = catalogue + commande et message
	 * d'exemple (local), `catalogue` = produits seulement (production), sinon rien.
	 */
	seedDemo:
		process.env.SEED_DEMO === 'true'
			? ('all' as const)
			: process.env.SEED_DEMO === 'catalogue'
				? ('catalogue' as const)
				: ('off' as const)
};
