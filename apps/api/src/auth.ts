import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from './config.js';

export interface AuthUser {
	id: number;
	email: string;
}

const JWT_ALGORITHM = 'HS256';
const JWT_ISSUER = 'strasbouq-api';
const JWT_AUDIENCE = 'strasbouq-admin';

/** bcrypt ignore tout ce qui dépasse 72 octets : on refuse plutôt que de tronquer en silence. */
export const PASSWORD_MAX_BYTES = 72;
export const PASSWORD_MIN_LENGTH = 12;

/** Hash d'un secret aléatoire : garde un temps de réponse constant quand l'e-mail n'existe pas. */
let dummyHash: string | undefined;

export function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

/** Vérifie un mot de passe. Sans hash (compte inexistant), fait quand même un bcrypt pour le timing. */
export async function verifyPassword(password: string, hash: string | null): Promise<boolean> {
	if (Buffer.byteLength(password) > PASSWORD_MAX_BYTES) return false;
	if (!hash) {
		dummyHash ??= await bcrypt.hash(crypto.randomUUID(), 12);
		await bcrypt.compare(password, dummyHash);
		return false;
	}
	return bcrypt.compare(password, hash);
}

/** Règles du mot de passe admin. Renvoie un message d'erreur, ou null s'il est valide. */
export function passwordPolicyError(password: string): string | null {
	if (password.length < PASSWORD_MIN_LENGTH) {
		return `Le mot de passe admin doit faire au moins ${PASSWORD_MIN_LENGTH} caractères`;
	}
	if (Buffer.byteLength(password) > PASSWORD_MAX_BYTES) {
		return `Le mot de passe admin ne doit pas dépasser ${PASSWORD_MAX_BYTES} octets`;
	}
	return null;
}

export function signToken(user: AuthUser): string {
	return jwt.sign({ email: user.email }, config.jwtSecret, {
		algorithm: JWT_ALGORITHM,
		issuer: JWT_ISSUER,
		audience: JWT_AUDIENCE,
		subject: String(user.id),
		expiresIn: config.jwtExpiresIn as SignOptions['expiresIn']
	});
}

/** Renvoie l'utilisateur porté par un header `Authorization: Bearer …`, ou null. */
export function userFromAuthHeader(header: string | undefined): AuthUser | null {
	if (!header?.startsWith('Bearer ')) return null;
	try {
		const payload = jwt.verify(header.slice(7), config.jwtSecret, {
			algorithms: [JWT_ALGORITHM],
			issuer: JWT_ISSUER,
			audience: JWT_AUDIENCE
		});
		if (typeof payload === 'string' || !payload.sub) return null;
		const id = Number(payload.sub);
		return Number.isSafeInteger(id) ? { id, email: String(payload.email) } : null;
	} catch {
		return null;
	}
}

/** Comparaison à temps constant de deux secrets (longueurs différentes comprises). */
export function safeEqual(a: string, b: string): boolean {
	const ha = crypto.createHash('sha256').update(a).digest();
	const hb = crypto.createHash('sha256').update(b).digest();
	return crypto.timingSafeEqual(ha, hb);
}
