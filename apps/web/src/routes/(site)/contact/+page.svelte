<script lang="ts">
	import { enhance } from '$app/forms';
	import hero from '#lib/assets/images/hero.webp';
	import { SHOP } from '#lib/catalog.ts';
	import PageHeader from '#lib/components/site/PageHeader.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	let submitting = $state(false);
	const initialBody = () => form?.values?.body ?? data.prefill;
	let length = $state(initialBody().length);

	// Jour courant mis en avant dans les horaires (0 = lundi)
	const today = (new Date().getDay() + 6) % 7;
</script>

<svelte:head>
	<title>Contact & horaires · Stras'bouq</title>
	<meta
		name="description"
		content="Horaires et formulaire de contact de Stras'bouq, fleuriste au centre de Strasbourg."
	/>
</svelte:head>

<PageHeader title="Nous écrire" script="Contact" image={hero}>
	<p>Une question, une commande spéciale, un événement ? Nous répondons sous 24 h.</p>
</PageHeader>

<div class="contact container">
	<section class="hours reveal" aria-labelledby="hours-title">
		<h2 id="hours-title">Horaires d'ouverture</h2>
		<ul role="list">
			{#each SHOP.hours as [day, hours], i (day)}
				<li class:today={i === today} class:closed={hours === 'Fermé'}>
					<span
						>{day}{#if i === today}<span class="visually-hidden">
								(aujourd'hui)</span
							>{/if}</span
					>
					<span>{hours}</span>
				</li>
			{/each}
		</ul>
		<p class="place">
			<span class="place__label">La boutique</span>
			<span class="place__name">Centre-ville de {SHOP.city}</span>
		</p>
	</section>

	<section class="message reveal" aria-labelledby="form-title">
		{#if form?.success}
			<div class="sent" role="status">
				<p class="script">Merci !</p>
				<h2 id="form-title">Message envoyé.</h2>
				<p>Nous vous répondons très vite par e-mail.</p>
			</div>
		{:else}
			<h2 id="form-title">Nous contacter</h2>
			<form
				method="POST"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update({ reset: false });
						submitting = false;
					};
				}}
			>
				<div class="form-field">
					<label for="name">Nom</label>
					<input
						id="name"
						name="name"
						autocomplete="name"
						maxlength="120"
						required
						value={form?.values?.name ?? ''}
					/>
				</div>
				<div class="form-field">
					<label for="email">E-mail</label>
					<input
						id="email"
						name="email"
						type="email"
						autocomplete="email"
						maxlength="200"
						required
						value={form?.values?.email ?? ''}
					/>
				</div>
				<div class="form-field">
					<label for="body">Message</label>
					<textarea
						id="body"
						name="body"
						maxlength="2000"
						required
						aria-describedby="body-count"
						oninput={(e) => (length = e.currentTarget.value.length)}
						>{initialBody()}</textarea
					>
					<span id="body-count" class="count">{length} / 2000</span>
				</div>
				<div class="honeypot" aria-hidden="true">
					<label for="website">Ne pas remplir</label>
					<input id="website" name="website" tabindex="-1" autocomplete="off" />
				</div>

				{#if form?.error}
					<p class="notice notice--error" role="alert">{form.error}</p>
				{/if}

				<button class="btn btn--rose" type="submit" disabled={submitting}>
					{submitting ? 'Envoi…' : 'Envoyer'}
				</button>
				<p class="privacy">
					Vos coordonnées servent uniquement à vous répondre. Elles ne sont jamais
					transmises à des tiers.
				</p>
			</form>
		{/if}
	</section>
</div>

<style lang="scss">
	@use 'tokens' as *;

	.contact {
		display: grid;
		gap: 28px;
		padding-top: clamp(32px, 5vw, 56px);
		align-items: start;

		@include from($bp-md) {
			grid-template-columns: 0.9fr 1.1fr;
		}
	}

	section {
		padding: clamp(24px, 4vw, 40px);
		border-radius: $radius;
		background: $surface;
		box-shadow: $shadow-sm;

		h2 {
			margin-bottom: 22px;
			font-size: 1.7rem;
		}
	}

	.hours {
		background: $ink;
		color: #fff;

		ul {
			display: grid;
		}

		li {
			display: flex;
			justify-content: space-between;
			gap: 16px;
			padding: 11px 0;
			border-bottom: 1px solid rgba(255, 255, 255, 0.1);
			color: rgba(255, 255, 255, 0.82);

			&.closed span:last-child {
				color: rgba(255, 255, 255, 0.55);
			}

			&.today {
				color: #fff;
				font-weight: 600;

				span:first-child::after {
					content: ' •';
					color: $blush;
				}
			}
		}
	}

	.place {
		display: grid;
		margin-top: 28px;

		&__label {
			font-size: 0.78rem;
			letter-spacing: 0.18em;
			text-transform: uppercase;
			color: $blush;
		}

		&__name {
			font-family: $font-serif;
			font-size: 1.6rem;
		}
	}

	form {
		display: grid;
		gap: 18px;
		justify-items: start;

		.form-field {
			width: 100%;
		}
	}

	.count {
		align-self: flex-end;
		font-size: 0.82rem;
		color: $ink-soft;
	}

	.privacy {
		font-size: 0.85rem;
		color: $ink-soft;
	}

	.sent {
		display: grid;
		gap: 10px;
		text-align: center;

		@include motion {
			animation: fade-up 0.7s $ease-out both;
		}

		.script {
			font-size: 4rem;
			color: $rose;
		}

		h2 {
			margin: 0;
		}
	}
</style>
