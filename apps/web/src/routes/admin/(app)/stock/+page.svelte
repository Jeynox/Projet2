<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatPrice, LOW_STOCK } from '#lib/catalog.ts';
	import FormFeedback from '#lib/components/admin/FormFeedback.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const max = $derived(Math.max(20, ...data.products.map((p) => p.stock)));
</script>

<svelte:head>
	<title>Stock · Back office</title>
</svelte:head>

<div class="page-head">
	<div>
		<h1>Stock</h1>
		<p>Les produits à réapprovisionner en premier. Seuil d'alerte : {LOW_STOCK} unités.</p>
	</div>
</div>

<FormFeedback {form} />

<section class="panel">
	<table class="table">
		<thead>
			<tr>
				<th scope="col">Produit</th>
				<th scope="col">Niveau</th>
				<th scope="col" class="num">Prix</th>
				<th scope="col">Réassort</th>
			</tr>
		</thead>
		<tbody>
			{#each data.products as product (product.id)}
				{@const level =
					product.stock === 0 ? 'out' : product.stock < LOW_STOCK ? 'low' : 'ok'}
				<tr>
					<td>
						<div class="product">
							{#if product.imageUrl}<img
									class="thumb"
									src={product.imageUrl}
									alt=""
									loading="lazy"
								/>{/if}
							<strong>{product.name}</strong>
						</div>
					</td>
					<td data-label="Stock">
						<div class="level level--{level}">
							<span class="level__bar" aria-hidden="true">
								<span style:width="{Math.min(100, (product.stock / max) * 100)}%"
								></span>
							</span>
							<span class="level__value">{product.stock}</span>
						</div>
					</td>
					<td data-label="Prix" class="num">{formatPrice(product.priceCents)}</td>
					<td>
						<form method="POST" action="?/restock" class="restock" use:enhance>
							<input type="hidden" name="id" value={product.id} />
							{#each [1, 5, 10] as n (n)}
								<button class="icon-btn" type="submit" name="amount" value={n}
									>+{n}<span class="visually-hidden">
										pour {product.name}</span
									></button
								>
							{/each}
							<label class="visually-hidden" for="custom-{product.id}"
								>Quantité pour {product.name}</label
							>
							<input
								id="custom-{product.id}"
								name="custom"
								type="number"
								min="-100000"
								max="100000"
								placeholder="±"
							/>
							<button class="icon-btn" type="submit">OK</button>
						</form>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</section>

<style lang="scss">
	@use 'tokens' as *;

	.product {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.level {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 160px;

		&__bar {
			flex: 1;
			height: 8px;
			border-radius: 999px;
			background: $line-soft;
			overflow: hidden;

			span {
				display: block;
				height: 100%;
				border-radius: inherit;
				background: var(--level);
				transition: width 0.6s $ease-out;
			}
		}

		&__value {
			min-width: 2.5ch;
			font-weight: 700;
			font-variant-numeric: tabular-nums;
			color: var(--level);
		}

		&--ok {
			--level: #{$sage};
		}
		&--low {
			--level: #{$amber};
		}
		&--out {
			--level: #{$danger};
		}
	}

	.restock {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		align-items: center;

		input[type='number'] {
			width: 76px;
			height: 36px;
			padding: 0 10px;
			border: 1px solid $line;
			border-radius: 999px;
		}
	}
</style>
