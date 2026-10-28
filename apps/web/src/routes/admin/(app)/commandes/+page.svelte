<script lang="ts">
	import { enhance } from '$app/forms';
	import { BOUQUET_STEPS, bouquetLabel, ORDER_STATUSES, statusLabel } from '#lib/catalog.ts';
	import FormFeedback from '#lib/components/admin/FormFeedback.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let filter = $state<'active' | 'all'>('active');
	const isActive = (status: string) =>
		status === 'NEW' || status === 'IN_PROGRESS' || status === 'READY';
	const shown = $derived(
		filter === 'all' ? data.orders : data.orders.filter((o) => isActive(o.status))
	);

	const date = (iso: string) =>
		new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(
			new Date(iso)
		);

	const tone: Record<string, string> = {
		NEW: 'rose',
		IN_PROGRESS: 'warn',
		READY: 'ok',
		DONE: '',
		CANCELLED: 'danger'
	};
</script>

<svelte:head>
	<title>Commandes · Back office</title>
</svelte:head>

<div class="page-head">
	<div>
		<h1>Bouquets sur mesure</h1>
		<p>Les demandes envoyées depuis le configurateur du site.</p>
	</div>
	<div class="tabs" role="group" aria-label="Filtrer les commandes">
		<button type="button" aria-pressed={filter === 'active'} onclick={() => (filter = 'active')}
			>En cours</button
		>
		<button type="button" aria-pressed={filter === 'all'} onclick={() => (filter = 'all')}
			>Toutes ({data.orders.length})</button
		>
	</div>
</div>

<FormFeedback {form} />

{#if shown.length}
	<ul class="orders" role="list">
		{#each shown as order (order.id)}
			<li class="order panel">
				<header class="order__head">
					<div>
						<h2>Commande n° {order.id}</h2>
						<p class="muted">{date(order.createdAt)}</p>
					</div>
					<span class="badge badge--{tone[order.status]}"
						>{statusLabel(order.status)}</span
					>
				</header>

				<dl class="order__recipe">
					{#each BOUQUET_STEPS as step (step.name)}
						<div>
							<dt>{step.title}</dt>
							<dd>{bouquetLabel(step.name, order[step.name])}</dd>
						</div>
					{/each}
				</dl>

				<div class="order__customer">
					<strong>{order.customerName}</strong>
					<a href="mailto:{order.email}">{order.email}</a>
					{#if order.phone}<a href="tel:{order.phone.replace(/[^\d+]/g, '')}"
							>{order.phone}</a
						>{/if}
					{#if order.note}<p class="order__note">« {order.note} »</p>{/if}
				</div>

				<footer class="order__actions">
					<form method="POST" action="?/status" use:enhance>
						<input type="hidden" name="id" value={order.id} />
						<label class="visually-hidden" for="status-{order.id}"
							>Statut de la commande {order.id}</label
						>
						<select
							id="status-{order.id}"
							name="status"
							value={order.status}
							onchange={(e) => e.currentTarget.form?.requestSubmit()}
						>
							{#each ORDER_STATUSES as status (status.value)}
								<option value={status.value}>{status.label}</option>
							{/each}
						</select>
						<noscript><button class="icon-btn" type="submit">Valider</button></noscript>
					</form>
					<form
						method="POST"
						action="?/delete"
						use:enhance={({ cancel }) => {
							if (!confirm(`Supprimer la commande n° ${order.id} ?`)) cancel();
						}}
					>
						<input type="hidden" name="id" value={order.id} />
						<button class="icon-btn icon-btn--danger" type="submit">Supprimer</button>
					</form>
				</footer>
			</li>
		{/each}
	</ul>
{:else}
	<p class="panel empty-state">Aucune commande {filter === 'active' ? 'en cours' : ''}.</p>
{/if}

<style lang="scss">
	@use 'tokens' as *;

	.tabs {
		display: inline-flex;
		padding: 4px;
		border-radius: 999px;
		background: $surface;
		border: 1px solid $line;

		button {
			padding: 8px 16px;
			border: 0;
			border-radius: 999px;
			background: transparent;
			cursor: pointer;
			font-weight: 500;
			transition: background-color 0.2s;

			&[aria-pressed='true'] {
				background: $ink;
				color: #fff;
			}
		}
	}

	.orders {
		display: grid;
		gap: 18px;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
	}

	.order {
		display: flex;
		flex-direction: column;
		gap: 16px;

		@include motion {
			animation: fade-up 0.5s $ease-out both;
		}

		&__head {
			display: flex;
			justify-content: space-between;
			align-items: flex-start;
			gap: 12px;

			h2 {
				font-size: 1.2rem;
			}
		}

		&__recipe {
			display: grid;
			gap: 6px;
			margin: 0;
			padding: 14px;
			border-radius: $radius-sm;
			background: $blush-soft;

			div {
				display: flex;
				justify-content: space-between;
				gap: 12px;
			}

			dt {
				color: $ink-soft;
			}

			dd {
				margin: 0;
				font-weight: 600;
			}
		}

		&__customer {
			display: grid;
			gap: 2px;

			a {
				color: $rose;
				word-break: break-all;
			}
		}

		&__note {
			margin-top: 8px;
			font-style: italic;
			color: $ink-soft;
		}

		&__actions {
			display: flex;
			justify-content: space-between;
			align-items: center;
			gap: 10px;
			margin-top: auto;
			padding-top: 14px;
			border-top: 1px solid $line-soft;

			select {
				height: 36px;
				padding: 0 12px;
				border: 1px solid $line;
				border-radius: 999px;
				background: $surface;
			}
		}
	}

	.muted {
		color: $ink-soft;
		font-size: 0.88rem;
	}
</style>
