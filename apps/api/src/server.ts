import net from 'node:net';
import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled';
import { expressMiddleware } from '@as-integrations/express5';
import express, { type ErrorRequestHandler, type Express, type Request, type RequestHandler } from 'express';
import helmet from 'helmet';
import type { DataSource } from 'typeorm';
import { safeEqual, userFromAuthHeader } from './auth.js';
import { config } from './config.js';
import { resolvers, type Context } from './graphql/resolvers.js';
import { typeDefs } from './graphql/schema.js';
import { queryLimitsRule } from './security/query-limits.js';
import { uploadsRouter } from './uploads.js';

export function createApolloServer(): ApolloServer<Context> {
	return new ApolloServer<Context>({
		typeDefs,
		resolvers,
		introspection: !config.isProd,
		persistedQueries: false,
		validationRules: [queryLimitsRule({ maxDepth: 6, maxFields: 150, maxAliases: 10 })],
		plugins: config.isProd ? [ApolloServerPluginLandingPageDisabled()] : [],
		// En prod, aucune erreur interne (SQL, stack…) ne sort de l'API.
		formatError: (formatted, error) => {
			const code = formatted.extensions?.code;
			if (config.isProd && (!code || code === 'INTERNAL_SERVER_ERROR')) {
				console.error('[graphql]', error);
				return { message: 'Erreur interne', extensions: { code: 'INTERNAL_SERVER_ERROR' } };
			}
			return formatted;
		}
	});
}

/** Seul le serveur SvelteKit (qui connaît la clé interne) peut parler à l'API. */
const internalOnly: RequestHandler = (req, res, next) => {
	if (!config.internalKey || safeEqual(req.get('x-internal-key') ?? '', config.internalKey)) {
		next();
		return;
	}
	res.status(403).json({ error: 'Accès refusé' });
};

/** IP du visiteur : transmise par le front authentifié, sinon l'IP de la connexion TCP. */
function clientIp(req: Request): string {
	const forwarded = req.get('x-client-ip');
	const trusted = config.internalKey && safeEqual(req.get('x-internal-key') ?? '', config.internalKey);
	if (trusted && forwarded && net.isIP(forwarded)) return forwarded;
	return req.socket.remoteAddress ?? 'unknown';
}

export async function createApp(ds: DataSource): Promise<Express> {
	const apollo = createApolloServer();
	await apollo.start();

	const app = express();
	app.disable('x-powered-by');
	app.use(
		helmet({
			// En dev, la CSP bloquerait l'explorateur GraphQL (Apollo Sandbox).
			contentSecurityPolicy: config.isProd ? undefined : false,
			crossOriginResourcePolicy: { policy: 'same-site' }
		})
	);

	app.get('/health', async (_req, res) => {
		try {
			await ds.query('SELECT 1');
			res.json({ status: 'ok' });
		} catch {
			res.status(503).json({ status: 'db_unavailable' });
		}
	});

	app.use(internalOnly);
	app.use(uploadsRouter());

	app.use(
		'/graphql',
		express.json({ limit: '100kb' }),
		expressMiddleware(apollo, {
			context: async ({ req }) => ({
				ds,
				user: userFromAuthHeader(req.headers.authorization),
				clientIp: clientIp(req)
			})
		})
	);

	app.use((_req, res) => {
		res.status(404).json({ error: 'Introuvable' });
	});

	const onError: ErrorRequestHandler = (err, _req, res, _next) => {
		console.error('[api]', err);
		if (!res.headersSent) res.status(500).json({ error: 'Erreur interne' });
	};
	app.use(onError);

	return app;
}
