import { config } from './config.js';
import { AppDataSource } from './data-source.js';
import { ensureBaseData, seedDemo } from './seed.js';
import { createApp } from './server.js';

await AppDataSource.initialize();
const ran = await AppDataSource.runMigrations({ transaction: 'each' });
if (ran.length) console.log(`[db] Migrations appliquées : ${ran.map((m) => m.name).join(', ')}`);

await ensureBaseData(AppDataSource);
if (config.seedDemo !== 'off') {
	await seedDemo(AppDataSource, { examples: config.seedDemo === 'all' });
}

const app = await createApp(AppDataSource);
const server = app.listen(config.port, () => {
	console.log(`[api] GraphQL prêt sur http://localhost:${config.port}/graphql`);
});

async function shutdown() {
	server.close();
	await AppDataSource.destroy();
	process.exit(0);
}
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
