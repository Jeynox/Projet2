import { API_URL, INTERNAL_API_KEY } from '$app/env/private';

export class ApiError extends Error {
	constructor(
		message: string,
		readonly code?: string
	) {
		super(message);
	}
}

interface GraphQLResponse<T> {
	data?: T | null;
	errors?: { message: string; extensions?: { code?: string } }[];
}

export interface GqlOptions {
	/** JWT de l'admin. */
	token?: string | null;
	/** IP du visiteur, transmise à l'API pour la limitation des tentatives et des envois. */
	clientIp?: string;
}

/** En-têtes qui prouvent à l'API que la requête vient bien de ce serveur. */
function internalHeaders(clientIp?: string): Record<string, string> {
	return {
		...(INTERNAL_API_KEY ? { 'x-internal-key': INTERNAL_API_KEY } : {}),
		...(clientIp ? { 'x-client-ip': clientIp } : {})
	};
}

/** Appelle l'API GraphQL côté serveur. Lève une ApiError au premier message d'erreur. */
export async function gql<T>(
	query: string,
	variables?: Record<string, unknown>,
	{ token, clientIp }: GqlOptions = {}
): Promise<T> {
	let res: Response;
	try {
		res = await fetch(`${API_URL}/graphql`, {
			method: 'POST',
			headers: {
				'content-type': 'application/json',
				...internalHeaders(clientIp),
				...(token ? { authorization: `Bearer ${token}` } : {})
			},
			body: JSON.stringify({ query, variables })
		});
	} catch {
		throw new ApiError("L'API est injoignable", 'API_UNREACHABLE');
	}

	const body = (await res.json().catch(() => ({}))) as GraphQLResponse<T>;
	if (body.errors?.length) {
		const [first] = body.errors;
		throw new ApiError(first.message, first.extensions?.code);
	}
	if (!body.data) throw new ApiError(`Réponse vide de l'API (${res.status})`);
	return body.data;
}

/** Envoie une image à l'API (qui la valide et la ré-encode en WebP) et renvoie son chemin `/uploads/…`. */
export async function uploadFile(file: File, token: string): Promise<string> {
	const form = new FormData();
	form.append('file', file);
	const res = await fetch(`${API_URL}/upload`, {
		method: 'POST',
		headers: { ...internalHeaders(), authorization: `Bearer ${token}` },
		body: form
	});
	const body = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
	if (!res.ok || !body.url) throw new ApiError(body.error ?? `Upload refusé (${res.status})`);
	return body.url;
}

/** Récupère un fichier uploadé auprès de l'API (le nom doit déjà avoir été validé). */
export function fetchUpload(file: string): Promise<Response> {
	return fetch(`${API_URL}/uploads/${file}`, { headers: internalHeaders() });
}
