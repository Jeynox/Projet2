<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		title: string;
		/** Mot manuscrit au-dessus du titre. */
		script?: string;
		image?: string;
		children?: Snippet;
	};
	let { title, script, image, children }: Props = $props();
</script>

<header class="page-header">
	{#if image}
		<img class="page-header__bg" src={image} alt="" fetchpriority="high" />
	{/if}
	<div class="page-header__inner">
		<h1 class="page-header__title">
			{#if script}<span class="script">{script}</span>{/if}
			{title}
		</h1>
		{#if children}
			<div class="page-header__intro">{@render children()}</div>
		{/if}
	</div>
</header>

<style lang="scss">
	@use 'tokens' as *;

	.page-header {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		padding: calc(84px + clamp(48px, 8vw, 96px)) 0 clamp(48px, 7vw, 88px);
		background: $ink;
		color: #fff;

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			z-index: -1;
			background:
				radial-gradient(ellipse at 80% 0%, rgba($blush, 0.18), transparent 60%),
				linear-gradient(180deg, rgba($ink, 0.55), rgba($ink, 0.85));
		}

		&__bg {
			position: absolute;
			inset: 0;
			z-index: -2;
			width: 100%;
			height: 100%;
			object-fit: cover;

			@include motion {
				animation: slow-zoom 18s ease-out both;
			}
		}

		&__inner {
			@include container;
		}

		&__title {
			font-size: clamp(2.4rem, 1.4rem + 4vw, 4.4rem);

			@include motion {
				animation: fade-up 0.9s $ease-out both;
			}

			.script {
				display: block;
				font-size: 1.3em;
				color: $blush;
				margin-bottom: -0.1em;
			}
		}

		&__intro {
			max-width: 60ch;
			margin-top: 18px;
			font-size: 1.12rem;
			color: rgba(255, 255, 255, 0.85);

			@include motion {
				animation: fade-up 0.9s 0.15s $ease-out both;
			}
		}
	}

	@keyframes slow-zoom {
		from {
			transform: scale(1.12);
		}
	}
</style>
