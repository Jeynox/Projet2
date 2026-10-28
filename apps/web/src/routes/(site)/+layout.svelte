<script lang="ts">
	import SiteFooter from '#lib/components/site/SiteFooter.svelte';
	import SiteHeader from '#lib/components/site/SiteHeader.svelte';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<a class="skip-link" href="#contenu">Aller au contenu</a>
<SiteHeader />
<main id="contenu" tabindex="-1">
	{@render children()}
</main>
<SiteFooter />

<style>
	main:focus {
		outline: none;
	}
</style>
