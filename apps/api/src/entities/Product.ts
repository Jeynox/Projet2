import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export const CATEGORIES = ['fleur', 'bouquet', 'vase', 'coffret', 'herbe'] as const;
export type Category = (typeof CATEGORIES)[number];

/** Un article du catalogue. */
@Entity('product')
export class Product {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column('varchar', { length: 100 })
	name: string;

	@Column('varchar', { length: 120, unique: true })
	slug: string;

	@Column('enum', { enum: CATEGORIES, enumName: 'product_category' })
	category: Category;

	/** Prix en centimes : jamais de flottant pour de l'argent. */
	@Column('int')
	priceCents: number;

	@Column('int', { default: 0 })
	stock: number;

	@Column('text', { default: '' })
	description: string;

	@Column('varchar', { length: 500, nullable: true })
	imageUrl: string | null;

	/** Affiché dans « Promotions & nouveautés » sur l'accueil. */
	@Column('boolean', { default: false })
	featured: boolean;

	@Column('boolean', { default: true })
	published: boolean;

	@Column('int', { default: 0 })
	position: number;

	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;
}
