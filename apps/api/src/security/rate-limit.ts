interface Entry {
	attempts: number;
	windowStart: number;
	blockedUntil: number;
	/** Nombre de blocages successifs : chaque nouveau blocage double la durée. */
	strikes: number;
	lastSeen: number;
}

export interface LimiterOptions {
	/** Tentatives autorisées par fenêtre. */
	max: number;
	windowMs: number;
	/** Durée du premier blocage, doublée à chaque récidive (plafonnée à 24 h). */
	blockMs: number;
	/** Garde-fou mémoire. */
	maxKeys?: number;
}

const DAY = 24 * 60 * 60 * 1000;

/**
 * Limiteur de tentatives en mémoire (une seule instance d'API).
 * Comptage pessimiste : chaque tentative est comptée AVANT vérification, et effacée en cas de succès.
 * Des requêtes parallèles ne peuvent donc pas passer entre les mailles.
 */
export class AttemptLimiter {
	private readonly entries = new Map<string, Entry>();

	constructor(private readonly options: LimiterOptions) {
		setInterval(() => this.prune(), 60_000).unref();
	}

	/** Enregistre une tentative. Renvoie 0 si elle est autorisée, sinon le délai d'attente en ms. */
	attempt(key: string, now = Date.now()): number {
		const { max, windowMs, blockMs, maxKeys = 50_000 } = this.options;
		let entry = this.entries.get(key);

		if (!entry) {
			if (this.entries.size >= maxKeys) this.evictOldest();
			entry = { attempts: 0, windowStart: now, blockedUntil: 0, strikes: 0, lastSeen: now };
			this.entries.set(key, entry);
		}
		entry.lastSeen = now;

		if (entry.blockedUntil > now) return entry.blockedUntil - now;

		if (now - entry.windowStart > windowMs) {
			entry.attempts = 0;
			entry.windowStart = now;
		}

		entry.attempts++;
		if (entry.attempts > max) {
			const duration = Math.min(blockMs * 2 ** entry.strikes, DAY);
			entry.strikes++;
			entry.blockedUntil = now + duration;
			entry.attempts = 0;
			entry.windowStart = now;
			return duration;
		}
		return 0;
	}

	/** À appeler après un succès. */
	reset(key: string): void {
		this.entries.delete(key);
	}

	clear(): void {
		this.entries.clear();
	}

	private prune(now = Date.now()) {
		for (const [key, entry] of this.entries) {
			if (entry.blockedUntil < now && now - entry.lastSeen > DAY) this.entries.delete(key);
		}
	}

	private evictOldest() {
		const oldest = this.entries.keys().next();
		if (!oldest.done) this.entries.delete(oldest.value);
	}
}

const MINUTE = 60_000;

/** 5 essais / 15 min par IP, puis 15 min de blocage (30, 60… en cas de récidive). */
export const loginIpLimiter = new AttemptLimiter({ max: 5, windowMs: 15 * MINUTE, blockMs: 15 * MINUTE });

/** 10 essais / 15 min par compte, quelle que soit l'IP (attaques distribuées). */
export const loginAccountLimiter = new AttemptLimiter({
	max: 10,
	windowMs: 15 * MINUTE,
	blockMs: 15 * MINUTE
});

/** Formulaires publics (contact, bouquet sur mesure) : 5 envois / 10 min par IP, anti-spam. */
export const publicFormLimiter = new AttemptLimiter({
	max: 5,
	windowMs: 10 * MINUTE,
	blockMs: 15 * MINUTE
});
