<script lang="ts">
	import { resolve } from '$app/paths';
	import hero from '#lib/assets/images/hero.webp';
	import surMesure from '#lib/assets/images/sur-mesure.webp';
	import vincent from '#lib/assets/images/vincent.webp';
	import yavuz from '#lib/assets/images/yavuz.webp';
	import ProductCard from '#lib/components/site/ProductCard.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let carousel = $state<HTMLUListElement>();

	/** Fait défiler le carrousel d'environ une « page » de cartes. */
	function slide(direction: 1 | -1) {
		if (!carousel) return;
		const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
		carousel.scrollBy({
			left: direction * carousel.clientWidth * 0.9,
			behavior: reduce ? 'auto' : 'smooth'
		});
	}

	const promises = [
		{
			title: 'Fleurs de saison',
			text: 'Sélectionnées chaque semaine chez des producteurs de la région.'
		},
		{
			title: 'Composé à la main',
			text: 'Chaque bouquet est unique, monté dans notre atelier.'
		},
		{
			title: 'Retrait ou livraison',
			text: 'En boutique, ou livré dans Strasbourg et ses environs.'
		}
	];
</script>

<svelte:head>
	<title>Stras'bouq · Fleuriste artisan à Strasbourg</title>
	<meta
		name="description"
		content="Bouquets de saison, fleurs à la tige, vases et coffrets. Composez votre bouquet sur mesure chez Stras'bouq, fleuriste à Strasbourg."
	/>
</svelte:head>

<section class="hero" aria-labelledby="hero-title">
	<img class="hero__bg" src={hero} alt="" fetchpriority="high" />
	<div class="hero__inner">
		<p class="eyebrow hero__eyebrow">Artisans fleuristes · Strasbourg</p>
		<h1 id="hero-title" class="hero__title">
			<span class="script">Stras'bouq</span>
			Des fleurs qui racontent votre histoire.
		</h1>
		<p class="hero__lead">
			Bouquets de saison, fleurs à la tige et compositions sur mesure, préparés à la main par
			Vincent et Yavuz.
		</p>
		<div class="hero__actions">
			<a class="btn btn--light" href={resolve('/(site)/catalogue/[[categorie]]', {})}
				>Découvrir le catalogue</a
			>
			<a class="btn btn--ghost hero__ghost" href={resolve('/(site)/bouquet-sur-mesure')}
				>Composer mon bouquet</a
			>
		</div>
	</div>
	<a class="hero__scroll" href="#selection" aria-label="Voir la sélection du moment">
		<span aria-hidden="true"></span>
	</a>
</section>

<ul class="promises container" role="list">
	{#each promises as promise, i (promise.title)}
		<li class="promise reveal">
			<span class="promise__num" aria-hidden="true">0{i + 1}</span>
			<h2>{promise.title}</h2>
			<p>{promise.text}</p>
		</li>
	{/each}
</ul>

{#if data.featured.length}
	<section id="selection" class="selection container" aria-labelledby="selection-title">
		<div class="selection__head reveal">
			<h2 id="selection-title" class="section-title">
				<span class="script">Promotions</span> & nouveautés
			</h2>
			<div class="selection__nav">
				<a class="arrow-link" href={resolve('/(site)/catalogue/[[categorie]]', {})}
					>Tout le catalogue <span>→</span></a
				>
				<button type="button" aria-controls="selection-list" onclick={() => slide(-1)}>
					<span aria-hidden="true">←</span><span class="visually-hidden"
						>Produits précédents</span
					>
				</button>
				<button type="button" aria-controls="selection-list" onclick={() => slide(1)}>
					<span aria-hidden="true">→</span><span class="visually-hidden"
						>Produits suivants</span
					>
				</button>
			</div>
		</div>
		<!-- L'animation d'apparition est sur la liste entière : dans un conteneur qui défile
		     horizontalement, une animation liée au défilement vertical ne s'appliquerait pas aux cartes. -->
		<ul id="selection-list" class="selection__grid reveal" role="list" bind:this={carousel}>
			{#each data.featured as product (product.id)}
				<li><ProductCard {product} /></li>
			{/each}
		</ul>
	</section>
{/if}

<section class="custom container" aria-labelledby="custom-title">
	<div class="custom__card reveal">
		<img class="custom__bg" src={surMesure} alt="" loading="lazy" />
		<div class="custom__glass">
			<h2 id="custom-title" class="custom__title">
				<span class="script">Votre bouquet</span> sur mesure
			</h2>
			<p>
				Choisissez la forme, la couleur, vos fleurs et le feuillage : nous le composons pour
				vous en boutique.
			</p>
			<a class="btn btn--rose" href={resolve('/(site)/bouquet-sur-mesure')}
				>Je compose mon bouquet</a
			>
		</div>
	</div>
</section>

<section class="about container" aria-labelledby="about-title">
	<figure class="about__portrait reveal">
		<img
			src={yavuz}
			alt="Portrait de Yavuz, fleuriste"
			loading="lazy"
			width="297"
			height="330"
		/>
		<figcaption>Yavuz</figcaption>
	</figure>
	<div class="about__text reveal">
		<p class="eyebrow">Qui sommes-nous</p>
		<h2 id="about-title" class="section-title"><span class="script">Vincent</span> & Yavuz</h2>
		<p>
			Un petit couple de fleuristes de la région de Strasbourg. Ils se sont rencontrés lors du
			concours du Meilleur Ouvrier fleuriste 2022.
		</p>
		<p>
			Entre eux, ce fut le coup de foudre : ils ont décidé d'ouvrir une nouvelle boutique en
			plein centre-ville de Strasbourg, leur ville natale.
		</p>
		<a class="arrow-link" href={resolve('/(site)/contact')}>Venir nous voir <span>→</span></a>
	</div>
	<figure class="about__portrait about__portrait--offset reveal">
		<img
			src={vincent}
			alt="Portrait de Vincent, fleuriste"
			loading="lazy"
			width="403"
			height="473"
		/>
		<figcaption>Vincent</figcaption>
	</figure>
</section>

<style lang="scss">
	@use 'tokens' as *;

	.hero {
		position: relative;
		isolation: isolate;
		// Deux rangées : le contenu centré verticalement, puis l'indicateur de défilement,
		// qui garde sa place et ne peut plus être recouvert par les boutons.
		display: grid;
		grid-template-rows: 1fr auto;
		align-items: center;
		gap: 24px;
		min-height: min(100svh, 920px);
		// En bas : place pour les cartes « promesses » qui chevauchent le hero (56px)
		padding: 108px 0 88px;
		overflow: hidden;
		background: $ink;
		color: #fff;

		// Petits téléphones : espacements resserrés pour garder l'indicateur dans le premier écran
		@include until($bp-md) {
			gap: 16px;
			padding-top: 96px;

			.hero__title {
				margin-top: 12px;
			}

			.hero__lead {
				margin-top: 16px;
			}

			.hero__actions {
				margin-top: 24px;
			}
		}

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			z-index: -1;
			background:
				linear-gradient(
					90deg,
					rgba($ink, 0.88) 0%,
					rgba($ink, 0.55) 45%,
					rgba($ink, 0.1) 100%
				),
				linear-gradient(0deg, rgba($ink, 0.7), transparent 40%);
		}

		&__bg {
			position: absolute;
			inset: 0;
			z-index: -2;
			width: 100%;
			height: 100%;
			object-fit: cover;
			object-position: 70% center;

			@include motion {
				animation: hero-zoom 22s ease-out both;
			}
		}

		&__inner {
			@include container(1320px);

			// Mobile : tout est centré, boutons empilés de même largeur
			@include until($bp-md) {
				display: grid;
				justify-items: center;
				text-align: center;
			}
		}

		&__eyebrow {
			color: $blush;

			@include motion {
				animation: fade-up 0.8s 0.1s $ease-out both;
			}
		}

		&__title {
			max-width: 14ch;
			margin-top: 18px;
			// Bornée aussi par la hauteur d'écran : sur un portable, l'indicateur de défilement reste visible
			font-size: clamp(2.5rem, min(1.3rem + 4.6vw, 1rem + 6.2vh), 5rem);
			font-weight: 380;

			@include until($bp-md) {
				margin-inline: auto;
			}

			.script {
				display: block;
				font-size: 1.55em;
				color: $blush;
				margin-bottom: -0.05em;
			}

			@include motion {
				animation: fade-up 1s 0.2s $ease-out both;
			}
		}

		&__lead {
			max-width: 46ch;
			margin-top: 22px;
			font-size: 1.15rem;
			color: rgba(255, 255, 255, 0.86);

			@include motion {
				animation: fade-up 1s 0.35s $ease-out both;
			}
		}

		&__actions {
			display: flex;
			flex-wrap: wrap;
			gap: 14px;
			margin-top: 34px;

			@include until($bp-md) {
				flex-direction: column;
				width: min(100%, 320px);
			}

			@include motion {
				animation: fade-up 1s 0.5s $ease-out both;
			}
		}

		&__ghost {
			color: #fff;
		}

		&__scroll {
			position: relative;
			justify-self: center;
			width: 28px;
			height: 46px;
			border: 1.5px solid rgba(255, 255, 255, 0.6);
			border-radius: 999px;
			transition: border-color 0.25s;

			&:hover {
				border-color: #fff;
			}

			&:focus-visible {
				outline-color: $blush;
			}

			@include motion {
				animation: fade-up 1s 0.8s $ease-out both;
			}

			span {
				position: absolute;
				top: 9px;
				left: 50%;
				width: 4px;
				height: 8px;
				margin-left: -2px;
				border-radius: 2px;
				background: #fff;

				@include motion {
					animation: scroll-hint 1.8s ease-in-out infinite;
				}
			}
		}
	}

	@keyframes hero-zoom {
		from {
			transform: scale(1.15);
		}
	}

	@keyframes scroll-hint {
		0% {
			opacity: 0;
			transform: translateY(0);
		}
		40% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: translateY(14px);
		}
	}

	.promises {
		position: relative;
		z-index: 1;
		display: grid;
		gap: 16px;
		margin: -56px auto 0;
		// Plus étroit que le reste de la page : le bloc reste centré avec de l'air de chaque côté
		max-width: 1000px;
		padding-inline: clamp(32px, 8vw, 40px);

		@include from($bp-md) {
			grid-template-columns: repeat(3, 1fr);
			gap: 20px;
		}
	}

	.promise {
		padding: 26px 28px;
		border-radius: $radius;
		background: $surface;
		box-shadow: $shadow;
		text-align: center;

		h2 {
			font-size: 1.3rem;
		}

		p {
			margin-top: 6px;
			color: $ink-soft;
			font-size: 0.98rem;
		}

		&__num {
			display: block;
			margin-bottom: 8px;
			font-family: $font-serif;
			font-style: italic;
			color: $rose;
		}
	}

	.selection {
		margin-top: clamp(72px, 10vw, 128px);

		&__head {
			display: flex;
			flex-wrap: wrap;
			align-items: flex-end;
			justify-content: space-between;
			gap: 16px;
			margin-bottom: 36px;
		}

		&__nav {
			display: flex;
			align-items: center;
			gap: 10px;

			button {
				display: grid;
				place-items: center;
				width: 44px;
				height: 44px;
				border: 1.5px solid $line;
				border-radius: 50%;
				background: $surface;
				font-size: 1.1rem;
				cursor: pointer;
				transition:
					border-color 0.2s,
					background-color 0.2s,
					color 0.2s;

				&:hover {
					border-color: $ink;
					background: $ink;
					color: #fff;
				}
			}
		}

		// Carrousel horizontal à défilement aimanté (repris du carrousel de l'ancien site)
		&__grid {
			display: grid;
			grid-auto-flow: column;
			grid-auto-columns: 78%;
			gap: 22px;
			overflow-x: auto;
			overscroll-behavior-x: contain;
			scroll-snap-type: x mandatory;
			scrollbar-width: none;
			// Espace pour l'ombre et le soulèvement des cartes au survol
			padding: 10px 2px 24px;

			@include from($bp-sm) {
				grid-auto-columns: calc((100% - 22px) / 2);
			}

			@include from($bp-md) {
				grid-auto-columns: calc((100% - 2 * 22px) / 3);
			}

			@include from($bp-lg) {
				grid-auto-columns: calc((100% - 3 * 22px) / 4);
			}

			li {
				scroll-snap-align: start;
			}
		}
	}

	.custom {
		margin-top: clamp(72px, 10vw, 128px);

		&__card {
			position: relative;
			isolation: isolate;
			display: grid;
			place-items: center;
			min-height: 460px;
			padding: clamp(24px, 5vw, 64px);
			border-radius: $radius;
			overflow: hidden;
			background: $ink;
		}

		&__bg {
			position: absolute;
			inset: 0;
			z-index: -1;
			width: 100%;
			height: 100%;
			object-fit: cover;
			transition: transform 1.4s $ease-out;
		}

		@include motion {
			&__card:hover &__bg {
				transform: scale(1.05);
			}
		}

		// Encadré flouté de l'ancienne page d'accueil
		&__glass {
			max-width: 560px;
			padding: clamp(24px, 4vw, 44px);
			border: 1px solid rgba(255, 255, 255, 0.35);
			border-radius: $radius;
			background: rgba(217, 217, 217, 0.18);
			backdrop-filter: blur(10px);
			-webkit-backdrop-filter: blur(10px);
			color: #fff;
			text-align: center;

			p {
				margin: 14px 0 26px;
				color: rgba(255, 255, 255, 0.9);
			}
		}

		&__title {
			font-size: clamp(2rem, 1.4rem + 2.4vw, 3rem);

			.script {
				display: block;
				font-size: 1.4em;
				color: $blush;
			}
		}
	}

	.about {
		display: grid;
		gap: 32px;
		align-items: center;
		margin-top: clamp(72px, 10vw, 128px);

		@include from($bp-md) {
			grid-template-columns: 1fr 1.4fr 1fr;
			gap: 48px;
		}

		&__text {
			display: grid;
			gap: 16px;
			justify-items: start;
			color: $ink-soft;

			h2 {
				color: $ink;
			}
		}

		&__portrait {
			position: relative;
			margin: 0;

			img {
				width: 100%;
				aspect-ratio: 4 / 5;
				object-fit: cover;
				border-radius: 999px 999px $radius $radius;
				box-shadow: $shadow;
			}

			figcaption {
				position: absolute;
				left: 50%;
				bottom: -14px;
				transform: translateX(-50%);
				padding: 2px 18px;
				border-radius: 999px;
				background: $surface;
				box-shadow: $shadow-sm;
				font-family: $font-script;
				font-size: 1.8rem;
			}

			@include until($bp-md) {
				max-width: 280px;
				justify-self: center;
			}
		}

		&__portrait--offset {
			@include from($bp-md) {
				margin-top: 80px;
			}
		}
	}
</style>
