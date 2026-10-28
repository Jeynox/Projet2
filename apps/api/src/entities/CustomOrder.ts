import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Choix possibles du configurateur « bouquet sur mesure » (mêmes valeurs que le front). */
export const BOUQUET_OPTIONS = {
	shape: ['rond', 'champetre'],
	color: ['rouge', 'orange', 'rose', 'jaune', 'blanc'],
	mainFlower: ['rose', 'dahlia'],
	secondaryFlower: ['tulipe', 'pivoine', 'cosmos'],
	greenery: ['fougere', 'eucalyptus']
} as const;
export type BouquetChoice = keyof typeof BOUQUET_OPTIONS;

export const ORDER_STATUSES = ['new', 'in_progress', 'ready', 'done', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

/** Une demande de bouquet sur mesure. */
@Entity('custom_order')
export class CustomOrder {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column('varchar', { length: 20 })
	shape: string;

	@Column('varchar', { length: 20 })
	color: string;

	@Column('varchar', { length: 20 })
	mainFlower: string;

	@Column('varchar', { length: 20 })
	secondaryFlower: string;

	@Column('varchar', { length: 20 })
	greenery: string;

	@Column('varchar', { length: 120 })
	customerName: string;

	@Column('varchar', { length: 200 })
	email: string;

	@Column('varchar', { length: 30, default: '' })
	phone: string;

	@Column('text', { default: '' })
	note: string;

	@Column('enum', { enum: ORDER_STATUSES, enumName: 'order_status', default: 'new' })
	status: OrderStatus;

	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamptz' })
	updatedAt: Date;
}
