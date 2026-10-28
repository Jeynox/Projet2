<script lang="ts">
	import { resolve } from '$app/paths';
	import ProductForm from '#lib/components/admin/ProductForm.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const feedback = $derived(form ?? (data.created ? { success: 'Produit créé.' } : null));
</script>

<svelte:head>
	<title>{data.product.name} · Back office</title>
</svelte:head>

<div class="page-head">
	<div>
		<a class="arrow-link" href={resolve('/admin/(app)/produits')}>← Produits</a>
		<h1>{data.product.name}</h1>
	</div>
	{#if data.product.published}
		<a
			class="btn btn--ghost btn--sm"
			href={resolve('/(site)/produit/[slug]', { slug: data.product.slug })}
			target="_blank"
			rel="noopener">Voir sur le site ↗</a
		>
	{/if}
</div>

{#key data.product.updatedAt}
	<ProductForm product={data.product} form={feedback} submitLabel="Enregistrer" />
{/key}
