interface Entry {
	attempts: number;
	windowStart: number;
	blockedUntil: number;
	strikes: number;
	lastSeen: number;
}

const DAY = 24 * 60 * 60 * 1000;
const MINUTE = 60_000;

/**
 * Limiteur de tentatives en mémoire. Chaque tentative est comptée AVANT vérification
 * (pas de contournement par requêtes parallèles), puis effacée en cas de succès.
 * Le blocage double à chaque récidive, plafonné à 24 h.
 */
export class AttemptLimiter {
	private readonly entries = new Map<string, Entry>();

	constructor(private readonly options: { max: number; windowMs: number; blockMs: number }) {
		setInterval(() => this.prune(), MINUTE).unref?.();
	}

	/** Renvoie 0 si la tentative est autorisée, sinon le délai d'attente en ms. */
	attempt(key: string, now = Date.now()): number {
		const { max, windowMs, blockMs } = this.options;
		let entry = this.entries.get(key);
		if (!entry) {
			if (this.entries.size >= 50_000) {
				const oldest = this.entries.keys().next();
				if (!oldest.done) this.entries.delete(oldest.value);
			}
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

	reset(key: string): void {
		this.entries.delete(key);
	}

	private prune(now = Date.now()) {
		for (const [key, entry] of this.entries) {
			if (entry.blockedUntil < now && now - entry.lastSeen > DAY) this.entries.delete(key);
		}
	}
}

/** Première barrière côté front : 5 essais / 15 min par IP (l'API applique ses propres limites en plus). */
export const loginLimiter = new AttemptLimiter({
	max: 5,
	windowMs: 15 * MINUTE,
	blockMs: 15 * MINUTE
});
