import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import path from 'node:path';

export default defineConfig({
	plugins: [
		sveltekit({
			// SCSS dans les <style lang="scss"> (aussi lu par svelte-check)
			preprocess: vitePreprocess(),
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter(),
			// Origine publique figée au build (ex. Docker local en http). Sans elle, adapter-node la
			// déduit de l'en-tête Host en supposant https — le bon comportement derrière un proxy HTTPS.
			// La protection CSRF compare l'en-tête Origin des formulaires à cette valeur.
			...(process.env.ORIGIN ? { paths: { origin: process.env.ORIGIN } } : {}),
			// Content-Security-Policy : seul le code servi par le site peut s'exécuter (les scripts
			// inline de SvelteKit reçoivent un nonce). Bloque l'injection de script même si une
			// faille XSS passait ailleurs.
			csp: {
				mode: 'auto',
				directives: {
					'default-src': ['self'],
					'script-src': ['self'],
					// 'unsafe-inline' : attributs style générés par Svelte (style:…) — aucun script concerné
					'style-src': ['self', 'unsafe-inline'],
					// Polices auto-hébergées : aucun domaine tiers autorisé
					'font-src': ['self'],
					// blob: : aperçu local de l'image choisie dans le back office
					'img-src': ['self', 'data:', 'blob:'],
					'connect-src': ['self'],
					'manifest-src': ['self'],
					'media-src': ['none'],
					'worker-src': ['none'],
					'frame-src': ['none'],
					'object-src': ['none'],
					'base-uri': ['self'],
					'form-action': ['self'],
					'frame-ancestors': ['none']
				}
			}
		})
	],
	build: {
		// Polices toujours servies en fichiers : la CSP (font-src 'self') refuse les data: URI
		assetsInlineLimit: (file) => (file.endsWith('.woff2') ? false : undefined)
	},
	css: {
		preprocessorOptions: {
			// Permet `@use 'tokens' as *;` dans n'importe quel composant
			scss: { loadPaths: [path.resolve(import.meta.dirname, 'src/lib/styles')] }
		}
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				css: {
					preprocessorOptions: {
						// Permet `@use 'tokens' as *;` dans n'importe quel composant
						scss: { loadPaths: [path.resolve(import.meta.dirname, 'src/lib/styles')] }
					}
				},
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
