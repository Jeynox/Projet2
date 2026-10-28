<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import logo from '#lib/assets/logo.png';

	const notFound = $derived(page.status === 404);

	// Pétales qui tombent en fond : position, taille, durée et retard variés (décor uniquement)
	const petals = Array.from({ length: 14 }, (_, i) => ({
		x: (i * 37) % 100,
		size: 10 + ((i * 7) % 12),
		duration: 9 + ((i * 5) % 8),
		delay: -((i * 13) % 17),
		sway: i % 2 ? 40 : -40
	}));
	const flowerPetals = Array.from({ length: 8 }, (_, i) => i * 45);
</script>

<svelte:head>
	<title>{notFound ? 'Page introuvable' : `Erreur ${page.status}`} · Stras'bouq</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="error">
	<div class="petals" aria-hidden="true">
		{#each petals as petal, i (i)}
			<span
				style:--x="{petal.x}%"
				style:--size="{petal.size}px"
				style:--duration="{petal.duration}s"
				style:--delay="{petal.delay}s"
				style:--sway="{petal.sway}px"
			></span>
		{/each}
	</div>

	<a class="error__brand" href={resolve('/(site)')}>
		<img src={logo} alt="" width="40" height="40" />
		<span class="script">Stras'bouq</span>
	</a>

	<div class="error__content">
		<p class="error__code" aria-hidden="true">
			{#if notFound}
				<span>4</span>
				<svg class="flower" viewBox="-50 -50 100 100">
					<defs>
						<radialGradient
							id="petal-gradient"
							cx="0"
							cy="-22"
							r="26"
							gradientUnits="userSpaceOnUse"
						>
							<stop offset="0%" stop-color="#fbeef1" />
							<stop offset="100%" stop-color="#e9a9b8" />
						</radialGradient>
					</defs>
					{#each flowerPetals as angle (angle)}
						<ellipse
							cx="0"
							cy="-24"
							rx="12"
							ry="22"
							fill="url(#petal-gradient)"
							transform="rotate({angle})"
						/>
					{/each}
					<circle r="11" fill="#e8b94a" />
					<circle r="5" fill="#c98f2a" />
				</svg>
				<span>4</span>
			{:else}
				<span>{page.status}</span>
			{/if}
		</p>

		<h1>
			<span class="script">Oups…</span>
			{notFound ? 'Cette page a fané.' : 'Un pétale s’est coincé.'}
		</h1>
		<p class="error__text">
			{#if notFound}
				La page que vous cherchez a peut-être été cueillie, déplacée, ou n’a jamais fleuri.
				Laissez-nous vous raccompagner vers de plus beaux bouquets.
			{:else}
				Une erreur inattendue est survenue de notre côté. Réessayez dans un instant ; si le
				problème persiste, écrivez-nous.
			{/if}
		</p>

		<div class="error__actions">
			<a class="btn btn--light" href={resolve('/(site)')}>Retour à l’accueil</a>
			<a class="btn btn--ghost" href={resolve('/(site)/catalogue/[[categorie]]', {})}
				>Voir le catalogue</a
			>
		</div>
	</div>
</main>

<style lang="scss">
	@use 'tokens' as *;

	.error {
		position: relative;
		isolation: isolate;
		display: grid;
		grid-template-rows: auto 1fr;
		min-height: 100vh;
		padding: 24px clamp(16px, 4vw, 40px) 48px;
		overflow: hidden;
		color: #fff;
		background:
			radial-gradient(ellipse at 15% 10%, rgba($blush, 0.2), transparent 55%),
			radial-gradient(ellipse at 90% 90%, rgba($sage, 0.25), transparent 55%), $ink;

		&__brand {
			display: flex;
			align-items: center;
			gap: 10px;
			justify-self: start;
			text-decoration: none;

			.script {
				font-size: 2rem;
				padding-top: 4px;
			}
		}

		&__content {
			display: grid;
			justify-items: center;
			align-content: center;
			gap: 18px;
			max-width: 640px;
			margin: 0 auto;
			text-align: center;
		}

		&__code {
			display: flex;
			align-items: center;
			gap: 0.08em;
			font-family: $font-serif;
			font-size: clamp(6rem, 4rem + 10vw, 11rem);
			font-weight: 300;
			line-height: 1;
			color: $blush;

			@include motion {
				animation: fade-up 0.9s $ease-out both;
			}
		}

		h1 {
			font-size: clamp(2rem, 1.4rem + 2.6vw, 3.2rem);

			@include motion {
				animation: fade-up 0.9s 0.15s $ease-out both;
			}

			.script {
				display: block;
				font-size: 1.3em;
				color: $blush;
				margin-bottom: -0.05em;
			}
		}

		&__text {
			max-width: 48ch;
			font-size: 1.1rem;
			color: rgba(255, 255, 255, 0.82);

			@include motion {
				animation: fade-up 0.9s 0.3s $ease-out both;
			}
		}

		&__actions {
			display: flex;
			flex-wrap: wrap;
			justify-content: center;
			gap: 12px;
			margin-top: 10px;

			@include motion {
				animation: fade-up 0.9s 0.45s $ease-out both;
			}
		}

		a:focus-visible {
			outline-color: $blush;
		}
	}

	// Le « 0 » : une fleur qui éclot puis tourne doucement
	.flower {
		width: 0.82em;
		height: 0.82em;
		filter: drop-shadow(0 10px 30px rgba($blush, 0.35));

		@include motion {
			animation:
				bloom 1.2s 0.2s $ease-spring both,
				spin 24s 1.4s linear infinite;
		}
	}

	@keyframes bloom {
		from {
			transform: scale(0) rotate(-90deg);
		}
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.petals {
		position: absolute;
		inset: 0;
		z-index: -1;
		pointer-events: none;

		span {
			position: absolute;
			top: -40px;
			left: var(--x);
			width: var(--size);
			height: var(--size);
			border-radius: 150% 0 150% 0;
			background: linear-gradient(135deg, #fbeef1, #e9a9b8);
			opacity: 0.55;

			@include motion {
				animation: fall var(--duration) var(--delay) linear infinite;
			}
		}

		// Sans animation : quelques pétales posés, simple décor
		@media (prefers-reduced-motion: reduce) {
			span {
				top: calc(var(--x) * 0.9);
				opacity: 0.25;
			}
		}
	}

	@keyframes fall {
		0% {
			transform: translate(0, 0) rotate(0deg);
		}
		50% {
			transform: translate(var(--sway), 55vh) rotate(180deg);
		}
		100% {
			transform: translate(0, 110vh) rotate(360deg);
		}
	}
</style>
