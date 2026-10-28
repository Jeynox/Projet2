import { describe, expect, it } from 'vitest';
import { jsonLd, metaDescription, xmlEscape } from './seo';
import { assertProductionSiteUrl, parseSiteUrl } from './site-url';

describe('jsonLd', () => {
	it('ne laisse pas un texte fermer la balise script', () => {
		const out = jsonLd({ name: '</script><script>alert(1)</script>' });
		expect(out.match(/<\/script>/g)).toHaveLength(1);
		expect(out.endsWith('</script>')).toBe(true);
		expect(out).not.toContain('<script>alert');
	});

	it('reste du JSON valide', () => {
		const data = { name: 'Daniel & <co>', bio: 'ligne suivante' };
		const json = jsonLd(data).replace(/^<script[^>]*>|<\/script>$/g, '');
		expect(JSON.parse(json)).toEqual(data);
	});
});

describe('metaDescription', () => {
	it('retire la mise en forme et garde les textes courts tels quels', () => {
		expect(metaDescription('Je code *pour que ça tienne*.')).toBe(
			'Je code pour que ça tienne.'
		);
	});

	it('coupe les textes longs sur un mot', () => {
		const out = metaDescription('mot '.repeat(80));
		expect(out.length).toBeLessThanOrEqual(155);
		expect(out.endsWith('mot…')).toBe(true);
	});
});

describe('xmlEscape', () => {
	it('échappe les caractères spéciaux XML', () => {
		expect(xmlEscape(`<a href="x">&'</a>`)).toBe(
			'&lt;a href=&quot;x&quot;&gt;&amp;&apos;&lt;/a&gt;'
		);
	});
});

describe('parseSiteUrl', () => {
	it("renvoie l'origine seule, ou undefined si vide", () => {
		expect(parseSiteUrl('https://daniel.studio/')).toBe('https://daniel.studio');
		expect(parseSiteUrl('  ')).toBeUndefined();
	});

	it('refuse chemins, paramètres, identifiants et protocoles exotiques', () => {
		for (const bad of [
			'https://daniel.studio/blog',
			'https://daniel.studio/?x=1',
			'https://user:pass@daniel.studio',
			'javascript:alert(1)',
			'pas une url'
		]) {
			expect(() => parseSiteUrl(bad)).toThrow();
		}
	});
});

describe('assertProductionSiteUrl', () => {
	it('exige une URL en https en prod, sauf en local', () => {
		expect(() => assertProductionSiteUrl(undefined)).toThrow(/obligatoire/);
		expect(() => assertProductionSiteUrl('http://daniel.studio')).toThrow(/https/);
		expect(() => assertProductionSiteUrl('http://localhost:3000')).not.toThrow();
		expect(() => assertProductionSiteUrl('https://daniel.studio')).not.toThrow();
	});
});
