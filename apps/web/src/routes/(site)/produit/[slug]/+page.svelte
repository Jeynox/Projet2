<script lang="ts">
	import { resolve } from '$app/paths';
	import { categoryByValue, formatPrice, LOW_STOCK } from '#lib/catalog.ts';
	import ProductCard from '#lib/components/site/ProductCard.svelte';
	import { metaDescription } from '#lib/seo.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const product = $derived(data.product);
	const category = $derived(categoryByValue(product.category));
</script>

<svelte:head>
	<title>{product.name} · Stras'bouq</title>
	<meta name="description" content={metaDescription(product.description || product.name)} />
</svelte:head>

<div class="band" aria-hidden="true"></div>

<article class="product container">
	<nav class="crumbs" aria-label="Fil d'Ariane">
		<ol role="list">
			<li><a href={resolve('/(site)/catalogue/[[categorie]]', {})}>Catalogue</a></li>
			{#if category}
				<li>
					<a
						href={resolve('/(site)/catalogue/[[categorie]]', {
							categorie: category.slug
						})}>{category.label}</a
					>
				</li>
			{/if}
			<li aria-current="page">{product.name}</li>
		</ol>
	</nav>

	<div class="product__layout">
		<div class="product__media">
			{#if product.imageUrl}
				<img src={product.imageUrl} alt={product.name} width="800" height="1000" />
			{:else}
				<div class="product__placeholder" aria-hidden="true">✿</div>
			{/if}
		</div>

		<div class="product__info">
			<p class="eyebrow">{category?.singular}</p>
			<h1>{product.name}</h1>
			<p class="product__price">{formatPrice(product.priceCents)}</p>

			{#if product.stock === 0}
				<p class="stock stock--out">Épuisé pour le moment</p>
			{:else if product.stock < LOW_STOCK}
				<p class="stock stock--low">Plus que {product.stock} en boutique</p>
			{:else}
				<p class="stock">Disponible en boutique</p>
			{/if}

			{#if product.description}
				<p class="product__description">{product.description}</p>
			{/if}

			<div class="product__actions">
				<!-- Ouvre le formulaire de contact avec un message pré-rempli (?produit=…) -->
				<form method="GET" action={resolve('/(site)/contact')}>
					<input type="hidden" name="produit" value={product.name} />
					<button class="btn btn--rose" type="submit">Réserver cet article</button>
				</form>
				<a class="btn btn--ghost" href={resolve('/(site)/bouquet-sur-mesure')}
					>Créer un bouquet sur mesure</a
				>
			</div>

			<ul class="product__perks" role="list">
				<li>Retrait en boutique, centre de Strasbourg</li>
				<li>Livraison possible dans l'Eurométropole</li>
				<li>Carte message offerte</li>
			</ul>
		</div>
	</div>
</article>

{#if data.related.length}
	<section class="related container" aria-labelledby="related-title">
		<h2 id="related-title" class="section-title reveal">
			<span class="script">Vous aimerez</span> aussi
		</h2>
		<ul class="related__grid" role="list">
			{#each data.related as item (item.id)}
				<li class="reveal"><ProductCard product={item} /></li>
			{/each}
		</ul>
	</section>
{/if}

<style lang="scss">
	@use 'tokens' as *;

	// Bande sombre sous l'en-tête fixe
	.band {
		height: 84px;
		background: $ink;
	}

	.crumbs {
		padding: 28px 0;
		font-size: 0.9rem;
		color: $ink-soft;

		ol {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
		}

		li + li::before {
			content: '/';
			margin-right: 8px;
			color: $mist;
		}

		a:hover {
			color: $rose;
		}
	}

	.product__layout {
		display: grid;
		gap: clamp(28px, 5vw, 64px);
		align-items: start;

		@include from($bp-md) {
			grid-template-columns: 1.05fr 1fr;
		}
	}

	.product__media {
		border-radius: $radius;
		overflow: hidden;
		background: $blush-soft;
		box-shadow: $shadow;

		@include from($bp-md) {
			position: sticky;
			top: 100px;
		}

		img {
			width: 100%;
			aspect-ratio: 4 / 5;
			object-fit: cover;

			@include motion {
				animation: media-in 1s $ease-out both;
			}
		}
	}

	@keyframes media-in {
		from {
			opacity: 0;
			transform: scale(1.06);
		}
	}

	.product__placeholder {
		display: grid;
		place-items: center;
		aspect-ratio: 4 / 5;
		font-size: 5rem;
		color: $rose;
	}

	.product__info {
		display: grid;
		gap: 14px;
		justify-items: start;

		@include motion {
			animation: fade-up 0.8s 0.1s $ease-out both;
		}

		h1 {
			font-size: clamp(2.2rem, 1.6rem + 2.6vw, 3.6rem);
		}
	}

	.product__price {
		font-family: $font-serif;
		font-size: 1.8rem;
		color: $rose;
	}

	.stock {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		font-size: 0.95rem;
		color: $sage;

		&::before {
			content: '';
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: currentColor;
		}

		&--low {
			color: $amber;
		}

		&--out {
			color: $ink-soft;
		}
	}

	.product__description {
		max-width: 52ch;
		color: $ink-soft;
		font-size: 1.08rem;
	}

	.product__actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 8px;
	}

	.product__perks {
		display: grid;
		gap: 8px;
		margin-top: 18px;
		padding-top: 20px;
		border-top: 1px solid $line;
		width: 100%;
		color: $ink-soft;
		font-size: 0.95rem;

		li::before {
			content: '✿';
			margin-right: 10px;
			color: $rose;
		}
	}

	.related {
		margin-top: clamp(72px, 10vw, 120px);

		h2 {
			margin-bottom: 32px;
		}

		&__grid {
			display: grid;
			gap: 22px;
			grid-template-columns: repeat(auto-fill, minmax(min(100%, 220px), 1fr));
		}
	}
</style>
