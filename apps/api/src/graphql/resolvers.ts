import { GraphQLError } from 'graphql';
import { LessThan, Not, type DataSource, type FindOptionsWhere } from 'typeorm';
import { signToken, verifyPassword, type AuthUser } from '../auth.js';
import { AdminUser } from '../entities/AdminUser.js';
import { ContactMessage } from '../entities/ContactMessage.js';
import { BOUQUET_OPTIONS, CustomOrder, type OrderStatus } from '../entities/CustomOrder.js';
import { CATEGORIES, Product, type Category } from '../entities/Product.js';
import { loginAccountLimiter, loginIpLimiter, publicFormLimiter } from '../security/rate-limit.js';
import { removeUpload } from '../uploads.js';
import {
	badInput,
	boundedInt,
	maxLength,
	notFound,
	oneOf,
	optionalPhone,
	requireAdmin,
	requiredEmail,
	requiredText,
	slugify,
	toId,
	tooManyAttempts,
	uploadPath
} from './utils.js';

export interface Context {
	ds: DataSource;
	user: AuthUser | null;
	/** IP du visiteur (transmise par le front de confiance), pour limiter les tentatives. */
	clientIp: string;
}

/** En dessous de ce stock, un produit est signalé dans le back office. */
export const LOW_STOCK = 5;

type ProductInput = {
	name: string;
	slug?: string | null;
	category: Category;
	priceCents: number;
	stock: number;
	description?: string | null;
	imageUrl?: string | null;
	featured?: boolean | null;
	published?: boolean | null;
	position?: number | null;
};

type OrderInput = {
	shape: string;
	color: string;
	mainFlower: string;
	secondaryFlower: string;
	greenery: string;
	customerName: string;
	email: string;
	phone?: string | null;
	note?: string | null;
};

type MessageInput = { name: string; email: string; body: string };

const byPosition = { position: 'ASC', id: 'ASC' } as const;

async function uniqueSlug(ds: DataSource, base: string, excludeId?: number): Promise<string> {
	const root = slugify(base) || 'produit';
	const repo = ds.getRepository(Product);
	let candidate = root;
	for (let i = 2; i < 1000; i++) {
		const where: FindOptionsWhere<Product> = { slug: candidate };
		if (excludeId) where.id = Not(excludeId);
		if (!(await repo.existsBy(where))) return candidate;
		candidate = `${root}-${i}`;
	}
	throw badInput('Impossible de générer un slug unique');
}

async function toProductData(ds: DataSource, input: ProductInput, excludeId?: number): Promise<Partial<Product>> {
	const name = requiredText(input.name, 100, 'Nom');
	return {
		name,
		slug: await uniqueSlug(ds, maxLength(input.slug, 100, 'Slug') || name, excludeId),
		category: oneOf(input.category, CATEGORIES, 'Catégorie'),
		priceCents: boundedInt(input.priceCents, 0, 10_000_000, 'Prix'),
		stock: boundedInt(input.stock, 0, 100_000, 'Stock'),
		description: maxLength(input.description, 2000, 'Description'),
		imageUrl: uploadPath(input.imageUrl, 'Image'),
		featured: input.featured ?? false,
		published: input.published ?? true,
		...(input.position == null ? {} : { position: boundedInt(input.position, 0, 10_000, 'Position') })
	};
}

function toOrderData(input: OrderInput): Partial<CustomOrder> {
	return {
		shape: oneOf(input.shape, BOUQUET_OPTIONS.shape, 'Forme'),
		color: oneOf(input.color, BOUQUET_OPTIONS.color, 'Couleur'),
		mainFlower: oneOf(input.mainFlower, BOUQUET_OPTIONS.mainFlower, 'Fleur principale'),
		secondaryFlower: oneOf(input.secondaryFlower, BOUQUET_OPTIONS.secondaryFlower, 'Fleur secondaire'),
		greenery: oneOf(input.greenery, BOUQUET_OPTIONS.greenery, 'Feuillage'),
		customerName: requiredText(input.customerName, 120, 'Nom'),
		email: requiredEmail(input.email),
		phone: optionalPhone(input.phone),
		note: maxLength(input.note, 1000, 'Précisions')
	};
}

/** Comptée avant toute écriture : un robot ne peut pas remplir la base. */
function limitPublicForm(clientIp: string) {
	const wait = publicFormLimiter.attempt(`ip:${clientIp}`);
	if (wait > 0) throw tooManyAttempts(wait, 'envois');
}

const iso = (date: Date) => date.toISOString();

export const resolvers = {
	Category: { FLEUR: 'fleur', BOUQUET: 'bouquet', VASE: 'vase', COFFRET: 'coffret', HERBE: 'herbe' },
	OrderStatus: {
		NEW: 'new',
		IN_PROGRESS: 'in_progress',
		READY: 'ready',
		DONE: 'done',
		CANCELLED: 'cancelled'
	},

	Product: { updatedAt: (p: Product) => iso(p.updatedAt) },
	CustomOrder: { createdAt: (o: CustomOrder) => iso(o.createdAt) },
	ContactMessage: { createdAt: (m: ContactMessage) => iso(m.createdAt) },

	Query: {
		products: (
			_: unknown,
			{
				category,
				featured,
				includeUnpublished
			}: { category?: Category; featured?: boolean; includeUnpublished?: boolean },
			{ ds, user }: Context
		) => {
			const where: FindOptionsWhere<Product> = {};
			if (category) where.category = category;
			if (featured != null) where.featured = featured;
			if (!(includeUnpublished && user)) where.published = true;
			return ds.getRepository(Product).find({ where, order: byPosition });
		},

		product: (_: unknown, { slug }: { slug: string }, { ds }: Context) =>
			ds.getRepository(Product).findOneBy({ slug: slug.slice(0, 120), published: true }),

		productById: (_: unknown, { id }: { id: string }, { ds, user }: Context) => {
			requireAdmin(user);
			return ds.getRepository(Product).findOneBy({ id: toId(id) });
		},

		orders: (_: unknown, { status }: { status?: OrderStatus }, { ds, user }: Context) => {
			requireAdmin(user);
			return ds.getRepository(CustomOrder).find({
				where: status ? { status } : {},
				order: { createdAt: 'DESC' }
			});
		},

		messages: (_: unknown, __: unknown, { ds, user }: Context) => {
			requireAdmin(user);
			return ds.getRepository(ContactMessage).find({ order: { createdAt: 'DESC' } });
		},

		stats: async (_: unknown, __: unknown, { ds, user }: Context) => {
			requireAdmin(user);
			const [products, lowStock, pendingOrders, unreadMessages] = await Promise.all([
				ds.getRepository(Product).count(),
				ds.getRepository(Product).countBy({ published: true, stock: LessThan(LOW_STOCK) }),
				ds.getRepository(CustomOrder).countBy([{ status: 'new' }, { status: 'in_progress' }]),
				ds.getRepository(ContactMessage).countBy({ read: false })
			]);
			return { products, lowStock, pendingOrders, unreadMessages };
		},

		me: (_: unknown, __: unknown, { user }: Context) => user?.email ?? null
	},

	Mutation: {
		async login(
			_: unknown,
			{ email, password }: { email: string; password: string },
			{ ds, clientIp }: Context
		) {
			const account = email.trim().toLowerCase().slice(0, 254);

			// Chaque tentative est comptée avant la vérification (y compris via des alias dans une même requête).
			const wait = Math.max(loginIpLimiter.attempt(`ip:${clientIp}`), loginAccountLimiter.attempt(account));
			if (wait > 0) throw tooManyAttempts(wait);

			const admin = await ds.getRepository(AdminUser).findOneBy({ email: account });
			// verifyPassword fait un bcrypt même sans compte : même temps de réponse, même message.
			const ok = await verifyPassword(password, admin?.passwordHash ?? null);
			if (!admin || !ok) {
				throw new GraphQLError('Identifiants invalides', { extensions: { code: 'UNAUTHENTICATED' } });
			}

			loginIpLimiter.reset(`ip:${clientIp}`);
			loginAccountLimiter.reset(account);
			return { token: signToken(admin), email: admin.email };
		},

		async sendMessage(_: unknown, { input }: { input: MessageInput }, { ds, clientIp }: Context) {
			limitPublicForm(clientIp);
			const repo = ds.getRepository(ContactMessage);
			await repo.save(
				repo.create({
					name: requiredText(input.name, 120, 'Nom'),
					email: requiredEmail(input.email),
					body: requiredText(input.body, 2000, 'Message')
				})
			);
			return true;
		},

		async createOrder(_: unknown, { input }: { input: OrderInput }, { ds, clientIp }: Context) {
			limitPublicForm(clientIp);
			const repo = ds.getRepository(CustomOrder);
			const order = await repo.save(repo.create(toOrderData(input)));
			return order.id;
		},

		async createProduct(_: unknown, { input }: { input: ProductInput }, { ds, user }: Context) {
			requireAdmin(user);
			const repo = ds.getRepository(Product);
			const data = await toProductData(ds, input);
			if (data.position == null) {
				const row = await repo.createQueryBuilder('p').select('MAX(p.position)', 'max').getRawOne();
				data.position = (Number(row?.max) || 0) + 1;
			}
			return repo.save(repo.create(data));
		},

		async updateProduct(_: unknown, { id, input }: { id: string; input: ProductInput }, { ds, user }: Context) {
			requireAdmin(user);
			const repo = ds.getRepository(Product);
			const product = await repo.findOneBy({ id: toId(id) });
			if (!product) throw notFound('Produit');
			const previousImage = product.imageUrl;
			const saved = await repo.save(Object.assign(product, await toProductData(ds, input, product.id)));
			if (previousImage && previousImage !== saved.imageUrl) await removeUpload(previousImage);
			return saved;
		},

		async deleteProduct(_: unknown, { id }: { id: string }, { ds, user }: Context) {
			requireAdmin(user);
			const repo = ds.getRepository(Product);
			const product = await repo.findOneBy({ id: toId(id) });
			if (!product) return false;
			await repo.remove(product);
			if (product.imageUrl) await removeUpload(product.imageUrl);
			return true;
		},

		async restock(_: unknown, { id, amount }: { id: string; amount: number }, { ds, user }: Context) {
			requireAdmin(user);
			const productId = toId(id);
			const delta = boundedInt(amount, -100_000, 100_000, 'Quantité');
			const repo = ds.getRepository(Product);
			// Mise à jour atomique : deux réassorts simultanés ne s'écrasent pas.
			const res = await repo
				.createQueryBuilder()
				.update()
				.set({ stock: () => 'LEAST(GREATEST("stock" + :delta, 0), 100000)' })
				.setParameter('delta', delta)
				.where('id = :id', { id: productId })
				.execute();
			if (!res.affected) throw notFound('Produit');
			return repo.findOneByOrFail({ id: productId });
		},

		async setOrderStatus(
			_: unknown,
			{ id, status }: { id: string; status: OrderStatus },
			{ ds, user }: Context
		) {
			requireAdmin(user);
			const repo = ds.getRepository(CustomOrder);
			const order = await repo.findOneBy({ id: toId(id) });
			if (!order) throw notFound('Commande');
			order.status = status;
			return repo.save(order);
		},

		async deleteOrder(_: unknown, { id }: { id: string }, { ds, user }: Context) {
			requireAdmin(user);
			const res = await ds.getRepository(CustomOrder).delete({ id: toId(id) });
			return (res.affected ?? 0) > 0;
		},

		async setMessageRead(_: unknown, { id, read }: { id: string; read: boolean }, { ds, user }: Context) {
			requireAdmin(user);
			const repo = ds.getRepository(ContactMessage);
			const message = await repo.findOneBy({ id: toId(id) });
			if (!message) throw notFound('Message');
			message.read = read;
			return repo.save(message);
		},

		async deleteMessage(_: unknown, { id }: { id: string }, { ds, user }: Context) {
			requireAdmin(user);
			const res = await ds.getRepository(ContactMessage).delete({ id: toId(id) });
			return (res.affected ?? 0) > 0;
		}
	}
};
