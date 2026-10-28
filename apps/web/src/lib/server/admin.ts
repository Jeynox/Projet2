import { fail, redirect, type Cookies, type RequestEvent } from '@sveltejs/kit';
import { dev } from '$app/env';
import { ApiError, gql, uploadFile } from './api';

/**
 * En prod, le préfixe `__Host-` oblige le navigateur à n'accepter le cookie qu'en HTTPS,
 * sur ce domaine exact (pas de sous-domaine) et pour tout le site.
 */
export const TOKEN_COOKIE = dev ? 'admin_token' : '__Host-admin_token';

/** Même durée que le JWT émis par l'API (JWT_EXPIRES_IN, 8 h par défaut). */
const SESSION_SECONDS = 60 * 60 * 8;

export function setTokenCookie(cookies: Cookies, token: string) {
	cookies.set(TOKEN_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'strict',
		secure: !dev,
		maxAge: SESSION_SECONDS
	});
}

/** Appel GraphQL authentifié. Session expirée → cookie supprimé et retour au login. */
export async function adminGql<T>(
	event: Pick<RequestEvent, 'locals' | 'cookies'>,
	query: string,
	variables?: Record<string, unknown>
): Promise<T> {
	try {
		return await gql<T>(query, variables, { token: event.locals.token });
	} catch (e) {
		if (e instanceof ApiError && e.code === 'UNAUTHENTICATED') {
			event.cookies.delete(TOKEN_COOKIE, { path: '/' });
			redirect(303, '/admin/login');
		}
		throw e;
	}
}

/**
 * Exécute une mutation depuis une action de formulaire : les erreurs de l'API
 * deviennent un `fail(400)` affichable, au lieu d'une page d'erreur.
 */
export async function mutate<T>(
	event: Pick<RequestEvent, 'locals' | 'cookies'>,
	query: string,
	variables?: Record<string, unknown>
) {
	try {
		return { ok: true as const, data: await adminGql<T>(event, query, variables) };
	} catch (e) {
		if (e instanceof ApiError) {
			return {
				ok: false as const,
				error: e.message,
				failure: fail(400, { error: e.message })
			};
		}
		throw e;
	}
}

// Lecture des champs de formulaire

export const str = (form: FormData, name: string) => String(form.get(name) ?? '').trim();
export const bool = (form: FormData, name: string) => form.get(name) === 'on';
export const int = (form: FormData, name: string) => {
	const n = Number(form.get(name));
	return Number.isFinite(n) && String(form.get(name) ?? '').trim() !== '' ? Math.trunc(n) : null;
};
/** « 12,50 » ou « 12.5 » € → 1250 centimes (null si illisible). */
export const cents = (form: FormData, name: string) => {
	const raw = str(form, name).replace(/\s|€/g, '').replace(',', '.');
	if (!/^\d+(\.\d{1,2})?$/.test(raw)) return null;
	return Math.round(Number(raw) * 100);
};

/**
 * Résout la valeur finale d'un champ géré par <ImageField name="…">:
 * nouveau fichier → upload ; case « retirer » → null ; sinon l'URL actuelle.
 */
export async function resolveUpload(
	event: Pick<RequestEvent, 'locals'>,
	form: FormData,
	name: string
): Promise<string | null> {
	const file = form.get(`${name}File`);
	if (file instanceof File && file.size > 0) return uploadFile(file, event.locals.token ?? '');
	if (bool(form, `${name}Remove`)) return null;
	return str(form, name) || null;
}
