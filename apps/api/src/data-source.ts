import 'reflect-metadata';
import path from 'node:path';
import { DataSource } from 'typeorm';
import { config } from './config.js';
import { AdminUser } from './entities/AdminUser.js';
import { ContactMessage } from './entities/ContactMessage.js';
import { CustomOrder } from './entities/CustomOrder.js';
import { Product } from './entities/Product.js';

/** Source de données TypeORM (seul export du fichier, requis par la CLI). */
export const AppDataSource = new DataSource({
	type: 'postgres',
	url: config.databaseUrl,
	entities: [AdminUser, ContactMessage, CustomOrder, Product],
	migrations: [path.join(import.meta.dirname, 'migrations', '*.{ts,js}')],
	synchronize: false,
	logging: config.isProd ? ['error'] : ['error', 'warn']
});
