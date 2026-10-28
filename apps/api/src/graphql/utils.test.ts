import { describe, expect, it } from 'vitest';
import { detectImageType } from '../uploads.js';
import { boundedInt, oneOf, optionalPhone, requiredEmail, slugify, toId, uploadPath } from './utils.js';

describe('validation des entrées', () => {
	it('génère des slugs propres', () => {
		expect(slugify("Bouquet d'Été — n°2")).toBe('bouquet-d-ete-n-2');
	});

	it("refuse les images qui ne viennent pas de l'upload", () => {
		expect(uploadPath('/uploads/0b8f3c3e-1a2b-4c5d-8e9f-0a1b2c3d4e5f.webp', 'Image')).toBeTruthy();
		expect(() => uploadPath('https://evil.example/pixel.gif', 'Image')).toThrow();
		expect(() => uploadPath('/uploads/../../etc/passwd', 'Image')).toThrow();
		expect(uploadPath('', 'Image')).toBeNull();
	});

	it('valide les listes fermées et les bornes', () => {
		expect(oneOf('rond', ['rond', 'champetre'], 'Forme')).toBe('rond');
		expect(() => oneOf('<script>', ['rond'], 'Forme')).toThrow();
		expect(() => boundedInt(-1, 0, 10, 'Stock')).toThrow();
		expect(() => boundedInt(1.5, 0, 10, 'Stock')).toThrow();
		expect(() => toId('1 OR 1=1')).toThrow();
	});

	it('valide e-mails et téléphones', () => {
		expect(requiredEmail(' Camille@Example.com ')).toBe('camille@example.com');
		expect(() => requiredEmail('pas-un-mail')).toThrow();
		expect(optionalPhone('01 23 45 67 89')).toBe('01 23 45 67 89');
		expect(() => optionalPhone('<b>0</b>')).toThrow();
	});

	it('identifie les images par leur signature, pas leur nom', () => {
		expect(detectImageType(Buffer.from('<?php system($_GET[0]); ?>'))).toBeNull();
		expect(detectImageType(Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]))).toBe('jpeg');
	});
});
