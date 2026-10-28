import { fail, type RequestEvent } from '@sveltejs/kit';
import { ApiError, gql } from './api';

/**
 * Envoie un formulaire public à l'API avec l'IP du visiteur (limitation anti-spam côté API).
 * Les erreurs de validation ou de quota deviennent un `fail()` affichable.
 */
export async function submitPublicForm<T>(
	event: Pick<RequestEvent, 'getClientAddress'>,
	query: string,
	variables: Record<string, unknown>,
	values: Record<string, string>
) {
	try {
		return {
			ok: true as const,
			data: await gql<T>(query, variables, { clientIp: event.getClientAddress() })
		};
	} catch (e) {
		if (e instanceof ApiError) {
			const status =
				e.code === 'TOO_MANY_REQUESTS' ? 429 : e.code === 'BAD_USER_INPUT' ? 400 : 503;
			const error =
				status === 503
					? 'Le service est momentanément indisponible. Réessayez dans un instant.'
					: e.message;
			return { ok: false as const, failure: fail(status, { error, values }) };
		}
		throw e;
	}
}

/** Champ piège invisible : un humain le laisse vide, un robot le remplit. */
export const isBot = (form: FormData) => String(form.get('website') ?? '') !== '';
