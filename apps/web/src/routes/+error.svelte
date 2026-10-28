<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import page404 from '#lib/assets/images/page404.webp';
</script>

<svelte:head>
	<title>Erreur {page.status} · Stras'bouq</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="error">
	<img class="error__bg" src={page404} alt="" />
	<div class="error__card">
		<p class="error__code" aria-hidden="true">{page.status}</p>
		<h1>
			{page.status === 404 ? 'Oups, vous vous êtes égaré·e.' : 'Une erreur est survenue.'}
		</h1>
		<p>{page.status === 404 ? 'Cette page a dû faner…' : page.error?.message}</p>
		<a class="btn btn--light" href={resolve('/(site)')}>Se remettre sur les rails</a>
	</div>
</main>

<style lang="scss">
	@use 'tokens' as *;

	.error {
		position: relative;
		isolation: isolate;
		display: grid;
		place-items: center;
		min-height: 100vh;
		padding: 24px;
		background: $ink;
		color: #fff;

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			z-index: -1;
			background: rgba($ink, 0.55);
		}

		&__bg {
			position: absolute;
			inset: 0;
			z-index: -2;
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		&__card {
			display: grid;
			justify-items: center;
			gap: 14px;
			max-width: 520px;
			padding: clamp(28px, 5vw, 48px);
			border: 1px solid rgba(255, 255, 255, 0.3);
			border-radius: $radius;
			background: rgba(217, 217, 217, 0.14);
			backdrop-filter: blur(12px);
			-webkit-backdrop-filter: blur(12px);
			text-align: center;

			@include motion {
				animation: fade-up 0.8s $ease-out both;
			}

			h1 {
				font-size: clamp(1.7rem, 1.2rem + 2vw, 2.4rem);
			}
		}

		&__code {
			font-family: $font-script;
			font-size: 6rem;
			line-height: 0.9;
			color: $blush;
		}

		.btn:focus-visible {
			outline-color: $blush;
		}
	}
</style>
