<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { CATEGORIES, categoryByValue, formatPrice, LOW_STOCK } from '#lib/catalog.ts';
	import FormFeedback from '#lib/components/admin/FormFeedback.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let query = $state('');
	let category = $state('');

	const filtered = $derived(
		data.products.filter(
			(p) =>
				(!category || p.category === category) &&
				p.name.toLowerCase().includes(query.trim().toLowerCase())
		)
	);
</script>

<svelte:head>
	<title>Produits · Back office</title>
</svelte:head>

<div class="page-head">
	<div>
		<h1>Produits</h1>
		<p>{data.products.length} article{data.products.length > 1 ? 's' : ''} au catalogue.</p>
	</div>
	<a class="btn btn--rose" href={resolve('/admin/(app)/produits/nouveau')}>+ Nouveau produit</a>
</div>

<FormFeedback {form} />

<section class="panel">
	<div class="filters">
		<div class="field">
			<label for="search">Rechercher</label>
			<input id="search" type="search" placeholder="Nom du produit" bind:value={query} />
		</div>
		<div class="field">
			<label for="filter-category">Catégorie</label>
			<select id="filter-category" bind:value={category}>
				<option value="">Toutes</option>
				{#each CATEGORIES as c (c.value)}
					<option value={c.value}>{c.label}</option>
				{/each}
			</select>
		</div>
	</div>

	{#if filtered.length}
		<table class="table">
			<thead>
				<tr>
					<th scope="col"><span class="visually-hidden">Photo</span></th>
					<th scope="col">Produit</th>
					<th scope="col">Catégorie</th>
					<th scope="col" class="num">Prix</th>
					<th scope="col" class="num">Stock</th>
					<th scope="col">Statut</th>
					<th scope="col"><span class="visually-hidden">Actions</span></th>
				</tr>
			</thead>
			<tbody>
				{#each filtered as product (product.id)}
					<tr>
						<td>
							{#if product.imageUrl}
								<img class="thumb" src={product.imageUrl} alt="" loading="lazy" />
							{:else}
								<span class="thumb thumb--empty" aria-hidden="true">✿</span>
							{/if}
						</td>
						<td><strong>{product.name}</strong></td>
						<td data-label="Catégorie">{categoryByValue(product.category)?.singular}</td
						>
						<td data-label="Prix" class="num">{formatPrice(product.priceCents)}</td>
						<td data-label="Stock" class="num">
							<span
								class="badge"
								class:badge--danger={product.stock === 0}
								class:badge--warn={product.stock > 0 && product.stock < LOW_STOCK}
								class:badge--ok={product.stock >= LOW_STOCK}>{product.stock}</span
							>
						</td>
						<td data-label="Statut">
							<span class="tags">
								{#if product.published}
									<span class="badge badge--ok">En ligne</span>
								{:else}
									<span class="badge">Masqué</span>
								{/if}
								{#if product.featured}<span class="badge badge--rose"
										>★ Accueil</span
									>{/if}
							</span>
						</td>
						<td>
							<div class="actions">
								<a
									class="icon-btn"
									href={resolve('/admin/(app)/produits/[id]', { id: product.id })}
									>Modifier<span class="visually-hidden"> {product.name}</span></a
								>
								<form
									method="POST"
									action="?/delete"
									use:enhance={({ cancel }) => {
										if (
											!confirm(
												`Supprimer « ${product.name} » ? Cette action est définitive.`
											)
										)
											cancel();
									}}
								>
									<input type="hidden" name="id" value={product.id} />
									<input type="hidden" name="name" value={product.name} />
									<button class="icon-btn icon-btn--danger" type="submit"
										>Supprimer<span class="visually-hidden">
											{product.name}</span
										></button
									>
								</form>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<p class="empty-state">Aucun produit ne correspond.</p>
	{/if}
</section>

<style lang="scss">
	@use 'tokens' as *;

	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin-bottom: 18px;

		.field {
			flex: 1 1 220px;
		}
	}

	.thumb--empty {
		display: grid;
		place-items: center;
		color: $rose;
	}

	.tags {
		display: inline-flex;
		flex-wrap: wrap;
		gap: 6px;
	}
</style>
