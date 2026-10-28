<script lang="ts">
	import { resolve } from '$app/paths';
	import { bouquetLabel, statusLabel } from '#lib/catalog.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const cards = $derived([
		{
			label: 'Commandes en attente',
			value: data.stats.pendingOrders,
			href: resolve('/admin/(app)/commandes'),
			tone: 'rose'
		},
		{
			label: 'Messages non lus',
			value: data.stats.unreadMessages,
			href: resolve('/admin/(app)/messages'),
			tone: 'ink'
		},
		{
			label: 'Produits en stock faible',
			value: data.stats.lowStock,
			href: resolve('/admin/(app)/stock'),
			tone: 'amber'
		},
		{
			label: 'Produits au catalogue',
			value: data.stats.products,
			href: resolve('/admin/(app)/produits'),
			tone: 'sage'
		}
	]);

	const date = (iso: string) =>
		new Intl.DateTimeFormat('fr-FR', {
			day: 'numeric',
			month: 'short',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(iso));
	const hello = new Date().getHours() < 18 ? 'Bonjour' : 'Bonsoir';
</script>

<svelte:head>
	<title>Tableau de bord · Back office</title>
</svelte:head>

<div class="page-head">
	<div>
		<h1>{hello} 👋</h1>
		<p>Voici ce qui se passe à la boutique aujourd'hui.</p>
	</div>
	<a class="btn btn--rose" href={resolve('/admin/(app)/produits/nouveau')}>+ Nouveau produit</a>
</div>

<ul class="stats" role="list">
	{#each cards as card, i (card.label)}
		<li style:--delay="{i * 70}ms">
			<a class="stat stat--{card.tone}" href={card.href}>
				<span class="stat__value">{card.value}</span>
				<span class="stat__label">{card.label}</span>
			</a>
		</li>
	{/each}
</ul>

<div class="panel-grid">
	<section class="panel" aria-labelledby="orders-title">
		<div class="panel__head">
			<h2 id="orders-title">Bouquets à préparer</h2>
			<a class="arrow-link" href={resolve('/admin/(app)/commandes')}
				>Tout voir <span>→</span></a
			>
		</div>
		{#if data.orders.length}
			<ul class="list" role="list">
				{#each data.orders as order (order.id)}
					<li>
						<div>
							<strong>n° {order.id} · {order.customerName}</strong>
							<span class="muted">
								{bouquetLabel('shape', order.shape)} · {bouquetLabel(
									'mainFlower',
									order.mainFlower
								)}
								& {bouquetLabel('secondaryFlower', order.secondaryFlower)} · {date(
									order.createdAt
								)}
							</span>
						</div>
						<span
							class="badge"
							class:badge--rose={order.status === 'NEW'}
							class:badge--warn={order.status === 'IN_PROGRESS'}
							>{statusLabel(order.status)}</span
						>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="empty-state">Aucune commande en attente. 🌿</p>
		{/if}
	</section>

	<section class="panel" aria-labelledby="messages-title">
		<div class="panel__head">
			<h2 id="messages-title">Messages non lus</h2>
			<a class="arrow-link" href={resolve('/admin/(app)/messages')}
				>Tout voir <span>→</span></a
			>
		</div>
		{#if data.messages.length}
			<ul class="list" role="list">
				{#each data.messages as message (message.id)}
					<li>
						<div>
							<strong>{message.name}</strong>
							<span class="muted excerpt">{message.body}</span>
						</div>
						<span class="muted nowrap">{date(message.createdAt)}</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="empty-state">Boîte de réception à jour. ✉</p>
		{/if}
	</section>

	<section class="panel panel--wide" aria-labelledby="stock-title">
		<div class="panel__head">
			<h2 id="stock-title">À réapprovisionner</h2>
			<a class="arrow-link" href={resolve('/admin/(app)/stock')}
				>Gérer le stock <span>→</span></a
			>
		</div>
		{#if data.lowStock.length}
			<ul class="low" role="list">
				{#each data.lowStock as product (product.id)}
					<li>
						{#if product.imageUrl}<img
								class="thumb"
								src={product.imageUrl}
								alt=""
							/>{/if}
						<span>{product.name}</span>
						<span
							class="badge"
							class:badge--danger={product.stock === 0}
							class:badge--warn={product.stock > 0}
						>
							{product.stock === 0
								? 'Épuisé'
								: `${product.stock} restant${product.stock > 1 ? 's' : ''}`}
						</span>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="empty-state">Tous les stocks sont au vert.</p>
		{/if}
	</section>
</div>

<style lang="scss">
	@use 'tokens' as *;

	.stats {
		display: grid;
		gap: 16px;
		margin-bottom: 24px;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));

		li {
			@include motion {
				animation: fade-up 0.6s var(--delay) $ease-out both;
			}
		}
	}

	.stat {
		display: grid;
		gap: 2px;
		padding: 22px 24px;
		border-radius: $radius;
		background: $surface;
		border: 1px solid $line-soft;
		box-shadow: $shadow-sm;
		text-decoration: none;
		position: relative;
		overflow: hidden;
		transition:
			transform 0.3s $ease-out,
			box-shadow 0.3s;

		&::before {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			bottom: 0;
			width: 4px;
			background: var(--tone);
		}

		&:hover {
			transform: translateY(-3px);
			box-shadow: $shadow;
		}

		&--rose {
			--tone: #{$rose};
		}
		&--ink {
			--tone: #{$ink};
		}
		&--amber {
			--tone: #{$amber};
		}
		&--sage {
			--tone: #{$sage};
		}

		&__value {
			font-family: $font-serif;
			font-size: 2.4rem;
			line-height: 1.1;
		}

		&__label {
			color: $ink-soft;
			font-size: 0.92rem;
		}
	}

	.panel__head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 14px;

		h2 {
			font-size: 1.3rem;
		}
	}

	.panel--wide {
		@include from($bp-lg) {
			grid-column: 1 / -1;
		}
	}

	.list {
		display: grid;

		li {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;
			padding: 12px 0;
			border-bottom: 1px solid $line-soft;

			&:last-child {
				border-bottom: 0;
			}

			> div {
				display: grid;
				min-width: 0;
			}
		}
	}

	.muted {
		color: $ink-soft;
		font-size: 0.88rem;
	}

	.excerpt {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.nowrap {
		white-space: nowrap;
	}

	.low {
		display: grid;
		gap: 12px;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));

		li {
			display: flex;
			align-items: center;
			gap: 12px;
			padding: 10px;
			border-radius: $radius-sm;
			background: #faf8f6;

			span:nth-child(2) {
				flex: 1;
				font-weight: 500;
			}
		}
	}
</style>
