import { GraphQLError } from 'graphql';
import type { AuthUser } from '../auth.js';

export function requireAdmin(user: AuthUser | null): AuthUser {
	if (!user) {
		throw new GraphQLError('Authentification requise', { extensions: { code: 'UNAUTHENTICATED' } });
	}
	return user;
}

export function badInput(message: string): GraphQLError {
	return new GraphQLError(message, { extensions: { code: 'BAD_USER_INPUT' } });
}

export function notFound(what: string): GraphQLError {
	return new GraphQLError(`${what} introuvable`, { extensions: { code: 'NOT_FOUND' } });
}

export function tooManyAttempts(waitMs: number, what = 'tentatives'): GraphQLError {
	const minutes = Math.ceil(waitMs / 60_000);
	return new GraphQLError(`Trop de ${what}. Réessayez dans ${minutes} min.`, {
		extensions: { code: 'TOO_MANY_REQUESTS', retryAfter: Math.ceil(waitMs / 1000) }
	});
}

/** « Bouquet d'Été » → « bouquet-d-ete » */
export function slugify(text: string): string {
	return text
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 100);
}

const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
/** Nom d'une image uploadée sur l'API : `<uuid>.webp` (toutes les images sont ré-encodées). */
export const IMAGE_FILE = new RegExp(`^${UUID}\\.webp$`);

/**
 * Les images ne peuvent venir que de nos propres uploads : pas d'URL externe
 * (pixel de tracking, contenu tiers, contournement de la CSP).
 */
export function uploadPath(value: string | null | undefined, field: string): string | null {
	const trimmed = value?.trim();
	if (!trimmed) return null;
	const file = trimmed.startsWith('/uploads/') ? trimmed.slice('/uploads/'.length) : '';
	if (!IMAGE_FILE.test(file)) throw badInput(`${field} : fichier invalide, utilisez l'upload`);
	return trimmed;
}

/** Trim + longueur maximale (les colonnes sont bornées, autant renvoyer une erreur lisible). */
export function maxLength(value: string | null | undefined, max: number, field: string): string {
	const trimmed = (value ?? '').trim();
	if (trimmed.length > max) throw badInput(`${field} : ${max} caractères maximum`);
	return trimmed;
}

/** Champ texte obligatoire et borné. */
export function requiredText(value: string | null | undefined, max: number, field: string): string {
	const text = maxLength(value, max, field);
	if (!text) throw badInput(`${field} : champ obligatoire`);
	return text;
}

/** Identifiant GraphQL → entier positif, sinon erreur (évite d'envoyer NaN à la base). */
export function toId(id: string): number {
	const n = Number(id);
	if (!Number.isSafeInteger(n) || n <= 0) throw badInput('Identifiant invalide');
	return n;
}

/** Entier borné (prix, stock, position…). */
export function boundedInt(value: number, min: number, max: number, field: string): number {
	if (!Number.isInteger(value) || value < min || value > max) {
		throw badInput(`${field} : valeur invalide (entre ${min} et ${max})`);
	}
	return value;
}

const EMAIL = /^[^\s@<>()"']+@[^\s@<>()"']+\.[^\s@<>()"']+$/;

export function requiredEmail(value: string | null | undefined, field = 'E-mail'): string {
	const email = requiredText(value, 200, field).toLowerCase();
	if (!EMAIL.test(email)) throw badInput(`${field} : adresse invalide`);
	return email;
}

const PHONE = /^[+\d][\d\s.()-]{5,28}$/;

export function optionalPhone(value: string | null | undefined): string {
	const phone = maxLength(value, 30, 'Téléphone');
	if (phone && !PHONE.test(phone)) throw badInput('Téléphone : numéro invalide');
	return phone;
}

/** Valeur obligatoirement choisie dans une liste fermée. */
export function oneOf<T extends string>(value: string, allowed: readonly T[], field: string): T {
	if (!(allowed as readonly string[]).includes(value)) throw badInput(`${field} : choix invalide`);
	return value as T;
}
