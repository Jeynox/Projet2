<script lang="ts">
	import { resolve } from '$app/paths';
	import champetre from '#lib/assets/images/bouquet-fleur-champetre.webp';
	import { CATEGORIES, categoryBySlug } from '#lib/catalog.ts';
	import PageHeader from '#lib/components/site/PageHeader.svelte';
	import ProductCard from '#lib/components/site/ProductCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const current = $derived(categoryBySlug(data.category ?? undefined));
	const filters = [
		{ slug: undefined, label: 'Tout voir' },
		...CATEGORIES.map((c) => ({ slug: c.slug, label: c.label }))
	];
</script>

<svelte:head>
	<title>{current ? `${current.label} · ` : ''}Catalogue · Stras'bouq</title>
	<meta
		name="description"
		content="Fleurs à la tige, bouquets, vases et coffrets cadeaux : tout le catalogue de Stras'bouq, fleuriste à Strasbourg."
	/>
</svelte:head>

<PageHeader title={current?.label ?? 'Le catalogue'} script="Catalogue" image={champetre}>
	<p>Fleurs de saison, bouquets composés main, vases et coffrets à offrir.</p>
</PageHeader>

<div class="catalogue container">
	<nav class="filters" aria-label="Catégories">
		<ul role="list">
			{#each filters as filter (filter.label)}
				{@const active = (filter.slug ?? null) === data.category}
				<li>
					<a
						class="chip"
						href={resolve('/(site)/catalogue/[[categorie]]', {
							categorie: filter.slug
						})}
						aria-current={active ? 'page' : undefined}
						data-sveltekit-noscroll>{filter.label}</a
					>
				</li>
			{/each}
		</ul>
	</nav>

	<p class="count" aria-live="polite">
		{data.products.length} article{data.products.length > 1 ? 's' : ''}
	</p>

	{#if data.products.length}
		<ul class="grid" role="list">
			{#each data.products as product, i (product.id)}
				<li class="reveal"><ProductCard {product} eager={i < 4} /></li>
			{/each}
		</ul>
	{:else}
		<div class="empty">
			<p class="script">Bientôt…</p>
			<p>Aucun article dans cette catégorie pour le moment.</p>
			<a class="btn" href={resolve('/(site)/bouquet-sur-mesure')}
				>Composer un bouquet sur mesure</a
			>
		</div>
	{/if}
</div>

<style lang="scss">
	@use 'tokens' as *;

	.catalogue {
		padding-top: 40px;
	}

	.filters {
		position: sticky;
		top: 76px;
		z-index: 10;
		margin-inline: -8px;
		padding: 8px;
		border-radius: 999px;
		background: rgba($paper, 0.85);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);

		ul {
			display: flex;
			gap: 8px;
			overflow-x: auto;
			scrollbar-width: none;
		}
	}

	.chip {
		display: inline-block;
		padding: 9px 20px;
		border: 1.5px solid $line;
		border-radius: 999px;
		background: $surface;
		white-space: nowrap;
		text-decoration: none;
		font-weight: 500;
		transition:
			background-color 0.25s,
			border-color 0.25s,
			color 0.25s,
			transform 0.25s $ease-out;

		&:hover {
			border-color: $ink;
		}

		&[aria-current='page'] {
			background: $ink;
			border-color: $ink;
			color: #fff;
		}

		@include motion {
			&:active {
				transform: scale(0.96);
			}
		}
	}

	.count {
		margin: 22px 0 18px;
		color: $ink-soft;
		font-size: 0.95rem;
	}

	.grid {
		display: grid;
		gap: 24px;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 230px), 1fr));
	}

	.empty {
		display: grid;
		justify-items: center;
		gap: 12px;
		padding: 64px 16px;
		text-align: center;
		color: $ink-soft;

		.script {
			font-size: 3.4rem;
			color: $rose;
		}
	}
</style>
