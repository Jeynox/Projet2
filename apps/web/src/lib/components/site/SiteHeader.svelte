<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import logo from '#lib/assets/logo.png';

	const links = [
		{ href: resolve('/(site)'), label: 'Accueil' },
		{ href: resolve('/(site)/catalogue/[[categorie]]', {}), label: 'Catalogue' },
		{ href: resolve('/(site)/bouquet-sur-mesure'), label: 'Bouquet sur mesure' },
		{ href: resolve('/(site)/contact'), label: 'Contact' }
	];

	let scrollY = $state(0);
	let open = $state(false);
	const scrolled = $derived(scrollY > 40);

	const isCurrent = (href: string) =>
		href === resolve('/(site)')
			? page.url.pathname === href
			: page.url.pathname.startsWith(href);

	afterNavigate(() => {
		open = false;
	});
</script>

<svelte:window
	bind:scrollY
	onkeydown={(e) => {
		if (e.key === 'Escape') open = false;
	}}
/>

<header class="header" class:header--solid={scrolled || open}>
	<div class="header__inner">
		<a class="brand" href={resolve('/(site)')} aria-label="Stras'bouq, retour à l'accueil">
			<img src={logo} alt="" width="44" height="44" />
			<span class="script">Stras'bouq</span>
		</a>

		<button
			class="burger"
			type="button"
			aria-expanded={open}
			aria-controls="menu-principal"
			onclick={() => (open = !open)}
		>
			<span class="visually-hidden">{open ? 'Fermer le menu' : 'Ouvrir le menu'}</span>
			<span class="burger__bar" aria-hidden="true"></span>
		</button>

		<nav
			id="menu-principal"
			class="nav"
			class:nav--open={open}
			aria-label="Navigation principale"
		>
			<ul role="list">
				{#each links as link (link.href)}
					<li>
						<a href={link.href} aria-current={isCurrent(link.href) ? 'page' : undefined}
							>{link.label}</a
						>
					</li>
				{/each}
			</ul>
			<a class="btn btn--light btn--sm nav__cta" href={resolve('/(site)/bouquet-sur-mesure')}
				>Composer mon bouquet</a
			>
		</nav>
	</div>
</header>

<style lang="scss">
	@use 'tokens' as *;

	.header {
		position: fixed;
		inset: 0 0 auto;
		z-index: 50;
		color: #fff;
		// Verre dépoli de l'ancienne barre de navigation, en plus discret
		background: rgba($ink, 0.18);
		backdrop-filter: blur(16px) saturate(140%);
		-webkit-backdrop-filter: blur(16px) saturate(140%);
		border-bottom: 1px solid rgba(255, 255, 255, 0.22);
		transition:
			background-color 0.35s $ease-out,
			border-color 0.35s;

		&--solid {
			background: rgba($ink, 0.92);
			border-color: transparent;
		}

		&__inner {
			@include container(1320px);
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 24px;
			height: 84px;
			transition: height 0.35s $ease-out;
		}

		&--solid &__inner {
			height: 68px;
		}
	}

	.brand {
		display: flex;
		align-items: center;
		gap: 12px;
		text-decoration: none;
		position: relative;
		z-index: 2;

		img {
			width: 44px;
			height: 44px;
			transition: transform 0.6s $ease-spring;
		}

		.script {
			font-size: 2.3rem;
			line-height: 1;
			padding-top: 6px;
		}

		@include motion {
			&:hover img {
				transform: rotate(-12deg) scale(1.08);
			}
		}
	}

	.nav {
		display: flex;
		align-items: center;
		gap: 32px;

		ul {
			display: flex;
			gap: 6px;
		}

		ul a {
			position: relative;
			display: block;
			padding: 8px 14px;
			text-decoration: none;
			font-weight: 450;
			letter-spacing: 0.01em;

			// Soulignement qui se dessine au survol / sur la page courante
			&::after {
				content: '';
				position: absolute;
				left: 14px;
				right: 14px;
				bottom: 2px;
				height: 1.5px;
				background: $blush;
				transform: scaleX(0);
				transform-origin: right;
				transition: transform 0.35s $ease-out;
			}

			&:hover::after,
			&[aria-current='page']::after {
				transform: scaleX(1);
				transform-origin: left;
			}
		}

		a:focus-visible {
			outline-color: $blush;
		}
	}

	.burger {
		display: none;
	}

	@include until($bp-md) {
		.burger {
			position: relative;
			z-index: 2;
			display: grid;
			place-items: center;
			width: 46px;
			height: 46px;
			border: 1px solid rgba(255, 255, 255, 0.35);
			border-radius: 50%;
			background: transparent;
			cursor: pointer;

			&__bar,
			&__bar::before,
			&__bar::after {
				display: block;
				width: 18px;
				height: 1.5px;
				background: #fff;
				transition:
					transform 0.35s $ease-out,
					opacity 0.2s;
			}

			&__bar {
				position: relative;

				&::before,
				&::after {
					content: '';
					position: absolute;
					left: 0;
				}

				&::before {
					top: -6px;
				}

				&::after {
					top: 6px;
				}
			}

			&[aria-expanded='true'] .burger__bar {
				background: transparent;

				&::before {
					transform: translateY(6px) rotate(45deg);
				}

				&::after {
					transform: translateY(-6px) rotate(-45deg);
				}
			}
		}

		.nav {
			position: fixed;
			inset: 0;
			flex-direction: column;
			justify-content: center;
			gap: 40px;
			background: rgba($ink, 0.97);
			opacity: 0;
			visibility: hidden;
			transition:
				opacity 0.35s $ease-out,
				visibility 0.35s;

			ul {
				flex-direction: column;
				align-items: center;
				gap: 4px;
			}

			ul a {
				font-family: $font-serif;
				font-size: 1.9rem;
				transform: translateY(16px);
				opacity: 0;
				transition:
					transform 0.5s $ease-out,
					opacity 0.5s;
			}

			&--open {
				opacity: 1;
				visibility: visible;

				ul a {
					transform: none;
					opacity: 1;
				}

				@for $i from 1 through 4 {
					li:nth-child(#{$i}) a {
						transition-delay: #{0.05 + $i * 0.05}s;
					}
				}
			}
		}
	}

	@include from($bp-md) {
		.nav__cta {
			display: none;
		}
	}

	@include from($bp-lg) {
		.nav__cta {
			display: inline-flex;
		}
	}
</style>
