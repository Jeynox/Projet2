import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Message envoyé depuis le formulaire de contact. */
@Entity('contact_message')
export class ContactMessage {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column('varchar', { length: 120 })
	name: string;

	@Column('varchar', { length: 200 })
	email: string;

	@Column('text')
	body: string;

	@Column('boolean', { default: false })
	read: boolean;

	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;
}
