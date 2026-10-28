import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin_user')
export class AdminUser {
	@PrimaryGeneratedColumn('increment')
	id: number;

	@Column('varchar', { length: 200, unique: true })
	email: string;

	@Column('varchar', { length: 200 })
	passwordHash: string;

	@CreateDateColumn({ type: 'timestamptz' })
	createdAt: Date;
}
