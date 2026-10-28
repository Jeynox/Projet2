<script lang="ts">
	import { resolve } from '$app/paths';
	import { categoryByValue, formatPrice, LOW_STOCK } from '#lib/catalog.ts';
	import type { Product } from '#lib/types.ts';

	let { product, eager = false }: { product: Product; eager?: boolean } = $props();

	const category = $derived(categoryByValue(product.category));
</script>

<a class="card" href={resolve('/(site)/produit/[slug]', { slug: product.slug })}>
	<div class="card__media">
		{#if product.imageUrl}
			<img
				src={product.imageUrl}
				alt=""
				loading={eager ? 'eager' : 'lazy'}
				decoding="async"
				width="600"
				height="750"
			/>
		{:else}
			<div class="card__placeholder" aria-hidden="true">✿</div>
		{/if}

		{#if product.stock === 0}
			<span class="badge badge--out">Épuisé</span>
		{:else if product.stock < LOW_STOCK}
			<span class="badge">Plus que {product.stock}</span>
		{/if}

		<!-- Bandeau prix qui glisse au survol, repris de l'ancien catalogue -->
		<span class="card__price">{formatPrice(product.priceCents)}</span>
	</div>
	<div class="card__body">
		<span class="card__category">{category?.singular}</span>
		<h3 class="card__name">{product.name}</h3>
		<span class="card__price-inline">{formatPrice(product.priceCents)}</span>
	</div>
</a>

<style lang="scss">
	@use 'tokens' as *;

	.card {
		display: flex;
		flex-direction: column;
		height: 100%;
		text-decoration: none;
		border-radius: $radius;
		background: $surface;
		box-shadow: $shadow-sm;
		overflow: hidden;
		transition:
			transform 0.45s $ease-out,
			box-shadow 0.45s $ease-out;

		@include motion {
			&:hover {
				transform: translateY(-6px);
				box-shadow: $shadow;
			}
		}

		&:focus-visible {
			outline-offset: 4px;
		}

		&__media {
			position: relative;
			aspect-ratio: 4 / 5;
			overflow: hidden;
			background: $blush-soft;

			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
				transition: transform 0.9s $ease-out;
			}
		}

		@include motion {
			&:hover &__media img {
				transform: scale(1.07);
			}
		}

		&__placeholder {
			display: grid;
			place-items: center;
			height: 100%;
			font-size: 3rem;
			color: $rose;
		}

		&__price {
			position: absolute;
			left: 14px;
			bottom: 14px;
			padding: 6px 14px;
			border-radius: 999px;
			background: rgba($ink, 0.78);
			backdrop-filter: blur(6px);
			color: #fff;
			font-weight: 550;
			opacity: 0;
			transform: translateY(12px);
			transition:
				opacity 0.4s $ease-out,
				transform 0.4s $ease-out;
		}

		&:hover &__price,
		&:focus-visible &__price {
			opacity: 1;
			transform: none;
		}

		&__body {
			display: grid;
			gap: 2px;
			padding: 16px 18px 20px;
		}

		&__category {
			font-size: 0.75rem;
			font-weight: 600;
			letter-spacing: 0.14em;
			text-transform: uppercase;
			color: $rose;
		}

		&__name {
			font-size: 1.25rem;
		}

		&__price-inline {
			margin-top: 4px;
			color: $ink-soft;
		}
	}

	.badge {
		position: absolute;
		top: 14px;
		right: 14px;
		padding: 4px 12px;
		border-radius: 999px;
		background: $surface;
		color: $amber;
		font-size: 0.8rem;
		font-weight: 600;
		box-shadow: $shadow-sm;

		&--out {
			color: $ink-soft;
		}
	}
</style>
