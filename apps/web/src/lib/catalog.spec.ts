import { describe, expect, it } from 'vitest';
import { bouquetLabel, categoryBySlug, formatPrice, priceInput } from './catalog';

describe('catalogue', () => {
	it('formate les prix en euros', () => {
		expect(formatPrice(4550).replace(/\s/g, ' ')).toBe('45,50 €');
		expect(priceInput(250)).toBe('2,50');
	});

	it('retrouve les catégories par leur segment d’URL', () => {
		expect(categoryBySlug('bouquets')?.value).toBe('BOUQUET');
		expect(categoryBySlug('../admin')).toBeUndefined();
	});

	it('affiche les choix du configurateur en clair', () => {
		expect(bouquetLabel('shape', 'champetre')).toBe('Champêtre');
		expect(bouquetLabel('greenery', 'inconnu')).toBe('inconnu');
	});
});
