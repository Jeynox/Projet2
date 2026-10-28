<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import surMesure from '#lib/assets/images/sur-mesure.webp';
	import { BOUQUET_STEPS, type BouquetStep } from '#lib/catalog.ts';
	import PageHeader from '#lib/components/site/PageHeader.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	type Choices = Record<BouquetStep['name'], string>;
	const initial = (): Choices => ({
		shape: form?.values?.shape ?? '',
		color: form?.values?.color ?? '',
		mainFlower: form?.values?.mainFlower ?? '',
		secondaryFlower: form?.values?.secondaryFlower ?? '',
		greenery: form?.values?.greenery ?? ''
	});
	let choices = $state(initial());
	let submitting = $state(false);

	const done = $derived(BOUQUET_STEPS.filter((s) => choices[s.name]).length);
	const progress = $derived(Math.round((done / BOUQUET_STEPS.length) * 100));

	const labelOf = (step: BouquetStep) =>
		step.options.find((o) => o.value === choices[step.name])?.label;
</script>

<svelte:head>
	<title>Bouquet sur mesure · Stras'bouq</title>
	<meta
		name="description"
		content="Composez votre bouquet : forme, couleur, fleurs et feuillage. Stras'bouq le prépare pour vous à Strasbourg."
	/>
</svelte:head>

<PageHeader title="sur mesure" script="Votre bouquet" image={surMesure}>
	<p>
		Cinq choix, et nous nous occupons du reste. Nous vous recontactons pour fixer le retrait ou
		la livraison.
	</p>
</PageHeader>

<div class="builder container">
	{#if form?.success}
		<div class="thanks" role="status">
			<p class="script">Merci !</p>
			<h2>Votre demande est bien arrivée.</h2>
			<p>
				{#if form.orderId !== '0'}Demande n° <strong>{form.orderId}</strong>.
				{/if}Nous vous recontactons très vite pour confirmer votre bouquet.
			</p>
			<a class="btn" href={resolve('/(site)/catalogue/[[categorie]]', {})}
				>Voir le catalogue</a
			>
		</div>
	{:else}
		<form
			method="POST"
			class="builder__form"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update({ reset: false });
					submitting = false;
				};
			}}
		>
			<div class="steps">
				{#each BOUQUET_STEPS as step, i (step.name)}
					<fieldset class="step reveal">
						<legend>
							<span class="step__num" aria-hidden="true">{i + 1}</span>
							<span>{step.title}</span>
							{#if step.hint}<span class="step__hint">· {step.hint}</span>{/if}
						</legend>
						<div class="options" class:options--swatches={!!step.options[0].swatch}>
							{#each step.options as option (option.value)}
								<div class="option">
									<input
										type="radio"
										id="{step.name}-{option.value}"
										name={step.name}
										value={option.value}
										bind:group={choices[step.name]}
										required
									/>
									<label for="{step.name}-{option.value}">
										{#if option.image}
											<img
												src={option.image}
												alt=""
												loading="lazy"
												width="320"
												height="320"
											/>
										{:else if option.swatch}
											<span class="swatch" style:background={option.swatch}
											></span>
										{/if}
										<span class="option__label">{option.label}</span>
										<span class="option__check" aria-hidden="true">✓</span>
									</label>
								</div>
							{/each}
						</div>
					</fieldset>
				{/each}

				<fieldset class="step reveal">
					<legend>
						<span class="step__num" aria-hidden="true">6</span>
						<span>Vos coordonnées</span>
					</legend>
					<div class="contact-grid">
						<div class="form-field">
							<label for="customerName">Nom et prénom</label>
							<input
								id="customerName"
								name="customerName"
								autocomplete="name"
								maxlength="120"
								required
								value={form?.values?.customerName ?? ''}
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
							<label for="phone"
								>Téléphone <span class="optional">(facultatif)</span></label
							>
							<input
								id="phone"
								name="phone"
								type="tel"
								autocomplete="tel"
								maxlength="30"
								value={form?.values?.phone ?? ''}
							/>
						</div>
						<div class="form-field form-field--full">
							<label for="note"
								>Précisions <span class="optional">(facultatif)</span></label
							>
							<textarea
								id="note"
								name="note"
								maxlength="1000"
								placeholder="Occasion, date souhaitée, message pour la carte…"
								>{form?.values?.note ?? ''}</textarea
							>
						</div>
					</div>
					<div class="honeypot" aria-hidden="true">
						<label for="website">Ne pas remplir</label>
						<input id="website" name="website" tabindex="-1" autocomplete="off" />
					</div>
				</fieldset>
			</div>

			<aside class="summary" aria-label="Récapitulatif">
				<h2>Votre bouquet</h2>
				<div
					class="summary__bar"
					role="progressbar"
					aria-label="Choix effectués"
					aria-valuenow={done}
					aria-valuemin={0}
					aria-valuemax={BOUQUET_STEPS.length}
				>
					<span style:width="{progress}%"></span>
				</div>
				<dl>
					{#each BOUQUET_STEPS as step (step.name)}
						{@const label = labelOf(step)}
						<div class:filled={!!label}>
							<dt>{step.title}</dt>
							<dd>{label ?? '—'}</dd>
						</div>
					{/each}
				</dl>

				{#if form?.error}
					<p class="notice notice--error" role="alert">{form.error}</p>
				{/if}

				<button class="btn btn--rose btn--block" type="submit" disabled={submitting}>
					{submitting ? 'Envoi…' : 'Envoyer ma demande'}
				</button>
				<p class="summary__note">
					Aucun paiement en ligne : nous confirmons le prix avec vous avant de préparer le
					bouquet.
				</p>
			</aside>
		</form>
	{/if}
</div>

<style lang="scss">
	@use 'tokens' as *;

	.builder {
		padding-top: clamp(32px, 5vw, 56px);

		&__form {
			display: grid;
			gap: 32px;
			align-items: start;

			@include from($bp-lg) {
				grid-template-columns: 1fr 340px;
			}
		}
	}

	.steps {
		display: grid;
		gap: 22px;
	}

	.step {
		margin: 0;
		padding: clamp(20px, 3vw, 32px);
		border: 0;
		border-radius: $radius;
		background: $surface;
		box-shadow: $shadow-sm;

		legend {
			float: left;
			width: 100%;
			display: flex;
			flex-wrap: wrap;
			align-items: center;
			gap: 12px;
			margin-bottom: 20px;
			padding: 0;
			font-family: $font-serif;
			font-size: 1.45rem;

			+ * {
				clear: both;
			}
		}

		&__num {
			display: grid;
			place-items: center;
			width: 34px;
			height: 34px;
			border-radius: 50%;
			background: $blush-soft;
			color: $rose;
			font-size: 1rem;
			font-family: $font-sans;
			font-weight: 600;
		}

		&__hint {
			font-family: $font-sans;
			font-size: 0.9rem;
			color: $ink-soft;
		}
	}

	.options {
		display: grid;
		gap: 14px;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));

		&--swatches {
			grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
		}
	}

	.option {
		position: relative;

		// Radio natif conservé (clavier, lecteurs d'écran), masqué visuellement
		input {
			@include visually-hidden;
		}

		label {
			position: relative;
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 10px;
			height: 100%;
			padding: 10px 10px 14px;
			border: 2px solid $line;
			border-radius: $radius-sm;
			cursor: pointer;
			transition:
				border-color 0.25s,
				box-shadow 0.25s,
				transform 0.3s $ease-out;

			&:hover {
				border-color: $mist;
				transform: translateY(-2px);
			}
		}

		img {
			width: 100%;
			aspect-ratio: 1;
			object-fit: cover;
			border-radius: $radius-xs;
			transition: transform 0.5s $ease-out;
		}

		&__label {
			font-weight: 550;
		}

		&__check {
			position: absolute;
			top: -10px;
			right: -10px;
			display: grid;
			place-items: center;
			width: 28px;
			height: 28px;
			border-radius: 50%;
			background: $rose;
			color: #fff;
			font-size: 0.85rem;
			font-weight: 700;
			transform: scale(0);
			transition: transform 0.35s $ease-spring;
		}

		input:checked + label {
			border-color: $rose;
			box-shadow: 0 0 0 4px rgba($rose, 0.12);

			.option__check {
				transform: scale(1);
			}

			img {
				transform: scale(0.96);
			}
		}

		input:focus-visible + label {
			@include focus-ring;
		}
	}

	.swatch {
		width: 54px;
		height: 54px;
		margin-top: 6px;
		border-radius: 50%;
		box-shadow: inset 0 0 0 1px rgba($ink, 0.12);
	}

	.contact-grid {
		display: grid;
		gap: 18px;

		@include from($bp-sm) {
			grid-template-columns: 1fr 1fr;
		}

		.form-field--full {
			grid-column: 1 / -1;
		}
	}

	.summary {
		display: grid;
		gap: 18px;
		padding: 28px;
		border-radius: $radius;
		background: $ink;
		color: #fff;
		box-shadow: $shadow-lg;

		@include from($bp-lg) {
			position: sticky;
			top: 96px;
		}

		h2 {
			font-size: 1.6rem;
		}

		&__bar {
			height: 6px;
			border-radius: 999px;
			background: rgba(255, 255, 255, 0.14);
			overflow: hidden;

			span {
				display: block;
				height: 100%;
				border-radius: inherit;
				background: linear-gradient(90deg, $blush, #fff);
				transition: width 0.5s $ease-out;
			}
		}

		dl {
			display: grid;
			gap: 10px;
			margin: 0;

			div {
				display: flex;
				justify-content: space-between;
				gap: 12px;
				padding-bottom: 10px;
				border-bottom: 1px solid rgba(255, 255, 255, 0.1);
				color: rgba(255, 255, 255, 0.6);
				transition: color 0.3s;

				&.filled {
					color: #fff;

					dd {
						animation: pop 0.4s $ease-spring;
					}
				}
			}

			dd {
				margin: 0;
				font-weight: 550;
			}
		}

		&__note {
			font-size: 0.85rem;
			color: rgba(255, 255, 255, 0.7);
		}

		.btn:focus-visible {
			outline-color: $blush;
		}
	}

	@keyframes pop {
		from {
			transform: scale(0.8);
			opacity: 0;
		}
	}

	.thanks {
		display: grid;
		justify-items: center;
		gap: 14px;
		max-width: 620px;
		margin: 0 auto;
		padding: clamp(32px, 6vw, 64px);
		border-radius: $radius;
		background: $surface;
		box-shadow: $shadow;
		text-align: center;

		@include motion {
			animation: fade-up 0.7s $ease-out both;
		}

		.script {
			font-size: 4rem;
			color: $rose;
		}

		h2 {
			font-size: 1.8rem;
		}

		p {
			color: $ink-soft;
		}
	}
</style>
