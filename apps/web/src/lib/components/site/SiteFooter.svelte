<script lang="ts">
	import { resolve } from '$app/paths';
	import logo from '#lib/assets/logo.png';
	import { SHOP } from '#lib/catalog.ts';

	const year = new Date().getFullYear();
</script>

<footer class="footer">
	<div class="footer__inner">
		<div class="footer__brand">
			<img src={logo} alt="" width="56" height="56" />
			<p class="script">Stras'bouq</p>
			<p class="footer__tagline">Artisans fleuristes au cœur de Strasbourg.</p>
		</div>

		<div>
			<h2 class="footer__title">Le site</h2>
			<ul role="list">
				<li><a href={resolve('/(site)/catalogue/[[categorie]]', {})}>Catalogue</a></li>
				<li><a href={resolve('/(site)/bouquet-sur-mesure')}>Bouquet sur mesure</a></li>
				<li><a href={resolve('/(site)/contact')}>Contact</a></li>
				<li><a href={resolve('/(site)/mentions-legales')}>Mentions légales</a></li>
			</ul>
		</div>

		<div>
			<h2 class="footer__title">La boutique</h2>
			<ul role="list">
				<li>{SHOP.city} centre</li>
				<li>Du mardi au dimanche</li>
			</ul>
		</div>
	</div>

	<p class="footer__bottom">
		© {year} Stras'bouq · Fait main à Strasbourg · Aucun cookie publicitaire
	</p>
</footer>

<style lang="scss">
	@use 'tokens' as *;

	.footer {
		position: relative;
		margin-top: clamp(64px, 10vw, 120px);
		padding-top: clamp(48px, 7vw, 80px);
		background: $ink;
		color: rgba(255, 255, 255, 0.82);
		overflow: hidden;

		// Halo rose discret en fond
		&::before {
			content: '';
			position: absolute;
			top: -40%;
			right: -10%;
			width: 520px;
			height: 520px;
			border-radius: 50%;
			background: radial-gradient(circle, rgba($blush, 0.16), transparent 70%);
			pointer-events: none;
		}

		&__inner {
			@include container;
			position: relative;
			display: grid;
			gap: 40px;

			@include from($bp-md) {
				grid-template-columns: 1.4fr 1fr 1fr;
			}
		}

		&__brand {
			.script {
				margin-top: 10px;
				font-size: 2.8rem;
				color: #fff;
			}
		}

		&__tagline {
			margin-top: 6px;
			max-width: 32ch;
		}

		&__title {
			margin-bottom: 14px;
			font-family: $font-sans;
			font-size: 0.78rem;
			font-weight: 600;
			letter-spacing: 0.18em;
			text-transform: uppercase;
			color: $blush;
		}

		ul {
			display: grid;
			gap: 8px;
		}

		a {
			text-decoration: none;

			&:hover {
				color: #fff;
				text-decoration: underline;
			}
		}

		a:focus-visible {
			outline-color: $blush;
		}

		&__bottom {
			@include container;
			position: relative;
			margin-top: 48px;
			padding-block: 22px;
			border-top: 1px solid rgba(255, 255, 255, 0.12);
			font-size: 0.85rem;
			color: rgba(255, 255, 255, 0.62);
		}
	}
</style>
