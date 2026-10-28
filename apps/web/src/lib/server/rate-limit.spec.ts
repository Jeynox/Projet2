import { describe, expect, it } from 'vitest';
import { AttemptLimiter } from './rate-limit';

describe('AttemptLimiter (front)', () => {
	it('bloque au-delà du maximum puis double la durée en cas de récidive', () => {
		const limiter = new AttemptLimiter({ max: 2, windowMs: 60_000, blockMs: 60_000 });
		expect(limiter.attempt('ip', 0)).toBe(0);
		expect(limiter.attempt('ip', 1)).toBe(0);
		expect(limiter.attempt('ip', 2)).toBe(60_000);
		const later = 60_003;
		limiter.attempt('ip', later);
		limiter.attempt('ip', later);
		expect(limiter.attempt('ip', later)).toBe(120_000);
	});
});
