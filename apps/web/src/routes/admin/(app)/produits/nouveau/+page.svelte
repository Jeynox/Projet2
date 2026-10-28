<script lang="ts">
	import { resolve } from '$app/paths';
	import ProductForm from '#lib/components/admin/ProductForm.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
</script>

<svelte:head>
	<title>Nouveau produit · Back office</title>
</svelte:head>

<div class="page-head">
	<div>
		<a class="arrow-link" href={resolve('/admin/(app)/produits')}>← Produits</a>
		<h1>Nouveau produit</h1>
	</div>
</div>

<ProductForm {form} submitLabel="Créer le produit" />
