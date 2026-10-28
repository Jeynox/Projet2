/** U+2028 et U+2029 : valides en JSON, mais à échapper dans un script. */
const LINE_SEPARATORS = new RegExp(`[${String.fromCharCode(0x2028, 0x2029)}]`, 'g');

/**
 * Sérialise des données structurées (schema.org) pour un `<script type="application/ld+json">`.
 * `<`, `>`, `&` et les séparateurs de ligne Unicode sont échappés : un texte saisi dans le back
 * office ne peut ni fermer la balise (`</script>`) ni injecter du HTML.
 */
export function jsonLd(data: unknown): string {
	const json = JSON.stringify(data)
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e')
		.replace(/&/g, '\\u0026')
		.replace(LINE_SEPARATORS, (c) => `\\u${c.charCodeAt(0).toString(16)}`);
	return `<script type="application/ld+json">${json}</script>`;
}

/**
 * Texte pour une meta description : sans les astérisques de mise en forme, espaces normalisés,
 * coupé proprement vers 155 caractères (au-delà, Google tronque).
 */
export function metaDescription(text: string, max = 155): string {
	const plain = text.replaceAll('*', '').replace(/\s+/g, ' ').trim();
	if (plain.length <= max) return plain;
	const cut = plain.slice(0, max - 1);
	const lastSpace = cut.lastIndexOf(' ');
	return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:.—-]+$/, '')}…`;
}

/** Échappe un texte pour un document XML (sitemap). */
export const xmlEscape = (text: string): string =>
	text.replace(
		/[<>&'"]/g,
		(c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c] ?? c
	);
