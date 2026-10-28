import type { CategoryValue, OrderStatusValue } from './catalog';

export interface Product {
	id: string;
	name: string;
	slug: string;
	category: CategoryValue;
	priceCents: number;
	stock: number;
	description: string;
	imageUrl: string | null;
	featured: boolean;
	published: boolean;
	position: number;
	updatedAt: string;
}

export interface CustomOrder {
	id: string;
	shape: string;
	color: string;
	mainFlower: string;
	secondaryFlower: string;
	greenery: string;
	customerName: string;
	email: string;
	phone: string;
	note: string;
	status: OrderStatusValue;
	createdAt: string;
}

export interface ContactMessage {
	id: string;
	name: string;
	email: string;
	body: string;
	read: boolean;
	createdAt: string;
}

export interface Stats {
	products: number;
	lowStock: number;
	pendingOrders: number;
	unreadMessages: number;
}
