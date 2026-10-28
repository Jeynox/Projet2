import fs from 'node:fs';
import path from 'node:path';
import type { DataSource } from 'typeorm';
import { hashPassword, passwordPolicyError } from './auth.js';
import { config } from './config.js';
import { AdminUser } from './entities/AdminUser.js';
import { ContactMessage } from './entities/ContactMessage.js';
import { CustomOrder } from './entities/CustomOrder.js';
import { Product, type Category } from './entities/Product.js';
import { saveImage } from './uploads.js';

/** Crée le compte admin s'il n'en existe aucun. Idempotent. */
export async function ensureBaseData(ds: DataSource): Promise<void> {
	const admins = ds.getRepository(AdminUser);
	if (config.adminEmail && config.adminPassword && (await admins.count()) === 0) {
		// Pas de compte admin avec un mot de passe faible ou laissé à sa valeur d'exemple.
		const weak = passwordPolicyError(config.adminPassword);
		if (weak) throw new Error(`ADMIN_PASSWORD refusé : ${weak}`);
		if (config.isProd && /change-?moi/i.test(config.adminPassword)) {
			throw new Error("ADMIN_PASSWORD refusé : remplacez la valeur d'exemple");
		}
		await admins.save(
			admins.create({
				email: config.adminEmail.trim().toLowerCase(),
				passwordHash: await hashPassword(config.adminPassword)
			})
		);
		console.log(`[seed] Compte admin créé : ${config.adminEmail}`);
	}
}

type DemoProduct = [name: string, category: Category, euros: number, stock: number, image: string, featured: boolean, description: string];

const DEMO_PRODUCTS: DemoProduct[] = [
	[
		'Bouquet champêtre',
		'bouquet',
		45,
		8,
		'bouquet_champetre.jpg',
		true,
		"Un bouquet libre et généreux, cueilli comme au bord d'un chemin : fleurs des champs, graminées et feuillages de saison."
	],
	[
		'Bouquet jolie campagne',
		'bouquet',
		39,
		6,
		'bouquet_jolie_campagne.jpg',
		true,
		'Des tons doux et lumineux pour un bouquet tendre, parfait pour dire merci ou fêter un anniversaire.'
	],
	[
		"Bouquet d'hiver",
		'bouquet',
		35,
		3,
		'bouquethivers.png',
		false,
		'Pivoines poudrées dans un pot en métal émaillé : une touche de douceur pour les mois froids.'
	],
	[
		'Coffret Saint-Valentin',
		'coffret',
		59,
		10,
		'coffert_saint_valentin.png',
		true,
		'Un écrin de roses rouges soigneusement disposées, livré dans un coffret à garder.'
	],
	[
		'Dahlia',
		'fleur',
		4.5,
		40,
		'dahlia.jpg',
		false,
		'Le dahlia et ses pétales en géométrie parfaite. Vendu à la tige.'
	],
	[
		'Muguet',
		'fleur',
		3,
		2,
		'muguet.png',
		false,
		'Les clochettes parfumées du printemps, porte-bonheur du 1er mai. Vendu au brin.'
	],
	[
		'Rose',
		'fleur',
		3.5,
		60,
		'rose.jpg',
		true,
		"La reine des fleurs, cultivée en France. Vendue à la tige, à composer selon vos envies."
	],
	[
		'Tulipe',
		'fleur',
		2.5,
		50,
		'tulipe.jpg',
		false,
		'Élégante et graphique, la tulipe continue de pousser dans le vase. Vendue à la tige.'
	],
	[
		'Vase porcelaine design',
		'vase',
		49,
		4,
		'vase_porcelaine_design.jpg',
		true,
		'Un vase en porcelaine mate aux lignes rondes, pour sublimer bouquets et branchages.'
	]
];

/**
 * Catalogue (photos de l'ancien site), inséré seulement si les tables sont vides.
 * `examples` ajoute une commande et un message fictifs pour essayer le back office en local.
 */
export async function seedDemo(ds: DataSource, { examples }: { examples: boolean }): Promise<void> {
	const products = ds.getRepository(Product);
	if ((await products.count()) === 0) {
		const imageDir = path.resolve(config.seedDir, 'images');
		let position = 1;
		for (const [name, category, euros, stock, image, featured, description] of DEMO_PRODUCTS) {
			let imageUrl: string | null = null;
			try {
				imageUrl = await saveImage(await fs.promises.readFile(path.join(imageDir, image)));
			} catch (e) {
				console.warn(`[seed] Image ignorée (${image}) :`, (e as Error).message);
			}
			const slug = name
				.normalize('NFD')
				.replace(/[̀-ͯ]/g, '')
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '');
			await products.save(
				products.create({
					name,
					slug,
					category,
					priceCents: Math.round(euros * 100),
					stock,
					description,
					imageUrl,
					featured,
					published: true,
					position: position++
				})
			);
		}
		console.log(`[seed] ${DEMO_PRODUCTS.length} produits de démo créés`);
	}

	if (!examples) return;

	const orders = ds.getRepository(CustomOrder);
	if ((await orders.count()) === 0) {
		await orders.save(
			orders.create({
				shape: 'champetre',
				color: 'rose',
				mainFlower: 'rose',
				secondaryFlower: 'pivoine',
				greenery: 'eucalyptus',
				customerName: 'Camille Exemple',
				email: 'camille@example.com',
				phone: '',
				note: 'Pour un anniversaire samedi, retrait en boutique.'
			})
		);
	}

	const messages = ds.getRepository(ContactMessage);
	if ((await messages.count()) === 0) {
		await messages.save(
			messages.create({
				name: 'Lucas Exemple',
				email: 'lucas@example.com',
				body: 'Bonjour, livrez-vous à Schiltigheim ? Merci !'
			})
		);
	}
}
