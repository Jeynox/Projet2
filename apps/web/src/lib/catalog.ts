import formeChampetre from '#lib/assets/images/forme-champetre.webp';
import formeRond from '#lib/assets/images/forme-rond.webp';
import fleurCosmos from '#lib/assets/images/fleur-cosmos.webp';
import fleurDahlia from '#lib/assets/images/fleur-dahlia.webp';
import fleurPivoine from '#lib/assets/images/fleur-pivoine.webp';
import fleurRose from '#lib/assets/images/fleur-rose.webp';
import fleurTulipe from '#lib/assets/images/fleur-tulipe.webp';
import herbeEucalyptus from '#lib/assets/images/herbe-eucalyptus.webp';
import herbeFougere from '#lib/assets/images/herbe-fougere.webp';

/** Valeur GraphQL ↔ segment d'URL ↔ libellés. */
export const CATEGORIES = [
	{ slug: 'fleurs', value: 'FLEUR', label: 'Fleurs', singular: 'Fleur' },
	{ slug: 'bouquets', value: 'BOUQUET', label: 'Bouquets', singular: 'Bouquet' },
	{ slug: 'vases', value: 'VASE', label: 'Vases', singular: 'Vase' },
	{ slug: 'coffrets', value: 'COFFRET', label: 'Coffrets', singular: 'Coffret' },
	{ slug: 'feuillages', value: 'HERBE', label: 'Feuillages', singular: 'Feuillage' }
] as const;

export type CategoryValue = (typeof CATEGORIES)[number]['value'];

export const categoryBySlug = (slug: string | undefined) => CATEGORIES.find((c) => c.slug === slug);
export const categoryByValue = (value: string) => CATEGORIES.find((c) => c.value === value);

const euros = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
export const formatPrice = (priceCents: number) => euros.format(priceCents / 100);

/** Prix en euros pour un champ de formulaire : 1250 → « 12,50 ». */
export const priceInput = (priceCents: number) => (priceCents / 100).toFixed(2).replace('.', ',');

export interface BouquetOption {
	value: string;
	label: string;
	image?: string;
	/** Pastille de couleur. */
	swatch?: string;
}

export interface BouquetStep {
	name: 'shape' | 'color' | 'mainFlower' | 'secondaryFlower' | 'greenery';
	title: string;
	hint?: string;
	options: BouquetOption[];
}

/** Étapes du configurateur — mêmes valeurs que la liste blanche de l'API. */
export const BOUQUET_STEPS: BouquetStep[] = [
	{
		name: 'shape',
		title: 'La forme',
		options: [
			{ value: 'rond', label: 'Rond', image: formeRond },
			{ value: 'champetre', label: 'Champêtre', image: formeChampetre }
		]
	},
	{
		name: 'color',
		title: 'La couleur dominante',
		options: [
			{ value: 'rouge', label: 'Rouge', swatch: '#b3263a' },
			{ value: 'orange', label: 'Orange', swatch: '#e9823a' },
			{ value: 'rose', label: 'Rose', swatch: '#efb0bf' },
			{ value: 'jaune', label: 'Jaune', swatch: '#f2cf5b' },
			{ value: 'blanc', label: 'Blanc', swatch: '#f7f4ee' }
		]
	},
	{
		name: 'mainFlower',
		title: 'La fleur principale',
		hint: '5 tiges par variété',
		options: [
			{ value: 'rose', label: 'Roses', image: fleurRose },
			{ value: 'dahlia', label: 'Dahlias', image: fleurDahlia }
		]
	},
	{
		name: 'secondaryFlower',
		title: 'La fleur secondaire',
		hint: '5 tiges par variété',
		options: [
			{ value: 'tulipe', label: 'Tulipes', image: fleurTulipe },
			{ value: 'pivoine', label: 'Pivoines', image: fleurPivoine },
			{ value: 'cosmos', label: 'Cosmos', image: fleurCosmos }
		]
	},
	{
		name: 'greenery',
		title: 'Le feuillage',
		options: [
			{ value: 'fougere', label: 'Fougères', image: herbeFougere },
			{ value: 'eucalyptus', label: 'Eucalyptus', image: herbeEucalyptus }
		]
	}
];

/** Libellé lisible d'un choix enregistré (back office). */
export function bouquetLabel(step: BouquetStep['name'], value: string): string {
	return (
		BOUQUET_STEPS.find((s) => s.name === step)?.options.find((o) => o.value === value)?.label ??
		value
	);
}

export const ORDER_STATUSES = [
	{ value: 'NEW', label: 'Nouvelle' },
	{ value: 'IN_PROGRESS', label: 'En préparation' },
	{ value: 'READY', label: 'Prête' },
	{ value: 'DONE', label: 'Terminée' },
	{ value: 'CANCELLED', label: 'Annulée' }
] as const;

export type OrderStatusValue = (typeof ORDER_STATUSES)[number]['value'];

export const statusLabel = (value: string) =>
	ORDER_STATUSES.find((s) => s.value === value)?.label ?? value;

/** Stock sous lequel un produit est signalé (même seuil que l'API). */
export const LOW_STOCK = 5;

export const SHOP = {
	name: "Stras'bouq",
	city: 'Strasbourg',
	hours: [
		['Lundi', 'Fermé'],
		['Mardi', '9h – 12h30 · 14h – 17h'],
		['Mercredi', '9h – 12h30 · 14h – 17h'],
		['Jeudi', '9h – 12h30 · 14h – 18h30'],
		['Vendredi', '9h – 12h30 · 14h – 18h30'],
		['Samedi', '9h – 12h30 · 14h – 18h30'],
		['Dimanche', '9h – 12h30 · 14h – 20h']
	]
} as const;
