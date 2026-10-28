<script lang="ts">
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import logo from '#lib/assets/logo.png';
	import '#lib/styles/admin.scss';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	let menuOpen = $state(false);

	const links = $derived([
		{ href: resolve('/admin/(app)'), label: 'Tableau de bord', icon: '◎', count: 0 },
		{
			href: resolve('/admin/(app)/commandes'),
			label: 'Commandes',
			icon: '✿',
			count: data.counters.pendingOrders
		},
		{ href: resolve('/admin/(app)/produits'), label: 'Produits', icon: '❖', count: 0 },
		{
			href: resolve('/admin/(app)/stock'),
			label: 'Stock',
			icon: '▤',
			count: data.counters.lowStock
		},
		{
			href: resolve('/admin/(app)/messages'),
			label: 'Messages',
			icon: '✉',
			count: data.counters.unreadMessages
		}
	]);

	const isCurrent = (href: string) =>
		href === resolve('/admin/(app)')
			? page.url.pathname === href
			: page.url.pathname.startsWith(href);

	afterNavigate(() => {
		menuOpen = false;
	});
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<a class="skip-link" href="#admin-main">Aller au contenu</a>

<div class="admin shell">
	<aside class="side" class:side--open={menuOpen}>
		<div class="side__top">
			<a class="side__brand" href={resolve('/admin/(app)')}>
				<img src={logo} alt="" width="36" height="36" />
				<span>
					<span class="script">Stras'bouq</span>
					<span class="side__sub">Back office</span>
				</span>
			</a>
			<button
				class="side__toggle"
				type="button"
				aria-expanded={menuOpen}
				aria-controls="admin-nav"
				onclick={() => (menuOpen = !menuOpen)}
			>
				{menuOpen ? 'Fermer' : 'Menu'}
			</button>
		</div>

		<nav id="admin-nav" class="side__nav" aria-label="Back office">
			<ul role="list">
				{#each links as link (link.href)}
					<li>
						<a
							href={link.href}
							aria-current={isCurrent(link.href) ? 'page' : undefined}
						>
							<span class="side__icon" aria-hidden="true">{link.icon}</span>
							<span>{link.label}</span>
							{#if link.count > 0}
								<span class="side__count">
									{link.count}<span class="visually-hidden"> en attente</span>
								</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		</nav>

		<div class="side__foot">
			<a href={resolve('/(site)')} target="_blank" rel="noopener">Voir le site ↗</a>
			<span class="side__user">{data.adminEmail}</span>
			<form method="POST" action={resolve('/admin/logout')}>
				<button class="btn btn--ghost btn--sm" type="submit">Se déconnecter</button>
			</form>
		</div>
	</aside>

	<main id="admin-main" class="main" tabindex="-1">
		{@render children()}
	</main>
</div>

<style lang="scss">
	@use 'tokens' as *;

	.shell {
		display: grid;

		@include from($bp-lg) {
			grid-template-columns: 260px 1fr;
		}
	}

	.side {
		display: flex;
		flex-direction: column;
		gap: 20px;
		padding: 16px;
		background: $ink;
		color: rgba(255, 255, 255, 0.85);

		@include from($bp-lg) {
			position: sticky;
			top: 0;
			height: 100vh;
			padding: 28px 18px;
		}

		&__top {
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		&__brand {
			display: flex;
			align-items: center;
			gap: 10px;
			color: #fff;
			text-decoration: none;

			> span {
				display: grid;
			}

			.script {
				font-size: 1.9rem;
			}
		}

		&__sub {
			font-size: 0.72rem;
			letter-spacing: 0.16em;
			text-transform: uppercase;
			color: $blush;
		}

		&__toggle {
			padding: 8px 16px;
			border: 1px solid rgba(255, 255, 255, 0.3);
			border-radius: 999px;
			background: transparent;
			color: #fff;
			cursor: pointer;

			@include from($bp-lg) {
				display: none;
			}
		}

		&__nav ul {
			display: grid;
			gap: 4px;
		}

		&__nav a {
			display: flex;
			align-items: center;
			gap: 12px;
			padding: 11px 14px;
			border-radius: $radius-sm;
			text-decoration: none;
			transition:
				background-color 0.2s,
				color 0.2s;

			&:hover {
				background: rgba(255, 255, 255, 0.07);
				color: #fff;
			}

			&[aria-current='page'] {
				background: rgba($blush, 0.16);
				color: #fff;
				font-weight: 600;

				.side__icon {
					color: $blush;
				}
			}
		}

		&__icon {
			width: 20px;
			text-align: center;
			opacity: 0.85;
		}

		&__count {
			margin-left: auto;
			min-width: 24px;
			padding: 1px 8px;
			border-radius: 999px;
			background: $rose;
			color: #fff;
			font-size: 0.78rem;
			font-weight: 700;
			text-align: center;
		}

		&__foot {
			display: grid;
			gap: 10px;
			justify-items: start;
			margin-top: auto;
			padding-top: 18px;
			border-top: 1px solid rgba(255, 255, 255, 0.1);
			font-size: 0.88rem;

			a {
				color: #fff;
			}
		}

		&__user {
			color: rgba(255, 255, 255, 0.6);
			word-break: break-all;
		}

		a:focus-visible,
		button:focus-visible {
			outline-color: $blush;
		}

		// Mobile : navigation repliable
		@include until($bp-lg) {
			&__nav,
			&__foot {
				display: none;
			}

			&--open &__nav,
			&--open &__foot {
				display: grid;
			}
		}
	}

	.main {
		min-width: 0;
		padding: clamp(20px, 4vw, 48px);

		&:focus {
			outline: none;
		}
	}
</style>
