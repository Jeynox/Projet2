<script lang="ts">
	// Polices auto-hébergées : aucune requête vers Google (vie privée des visiteurs, CSP stricte)
	import '@fontsource/imperial-script/400.css';
	import '@fontsource-variable/fraunces/opsz.css';
	import '@fontsource-variable/fraunces/opsz-italic.css';
	import '@fontsource-variable/roboto/wght.css';
	import '#lib/styles/global.scss';
	import { onNavigate } from '$app/navigation';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	// Fondu entre les pages (View Transitions API), ignoré par les navigateurs qui ne la gèrent pas
	onNavigate((navigation) => {
		if (
			!document.startViewTransition ||
			navigation.from?.url.pathname === navigation.to?.url.pathname
		)
			return;
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.png" type="image/png" />
</svelte:head>

{@render children()}
