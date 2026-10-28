<script lang="ts">
	import { SHOP } from '#lib/catalog.ts';
	import PageHeader from '#lib/components/site/PageHeader.svelte';
</script>

<svelte:head>
	<title>Mentions légales · Stras'bouq</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<PageHeader title="Mentions légales" script="Informations" />

<div class="legal container">
	<section>
		<h2>Éditeur</h2>
		<p>Stras'bouq, artisans fleuristes, {SHOP.city}.</p>
		<p>[Raison sociale, SIRET et adresse du siège à compléter avant la mise en ligne.]</p>
	</section>
	<section>
		<h2>Hébergement</h2>
		<p>[Nom et adresse de l'hébergeur à compléter.]</p>
	</section>
	<section>
		<h2>Données personnelles</h2>
		<p>
			Les informations saisies dans les formulaires (contact, bouquet sur mesure) servent
			uniquement à traiter votre demande. Elles ne sont ni revendues ni transmises à des
			tiers, et sont supprimées une fois la demande traitée. Vous pouvez demander leur
			suppression à tout moment en nous contactant.
		</p>
	</section>
	<section>
		<h2>Cookies</h2>
		<p>
			Ce site n'utilise aucun cookie publicitaire ni outil de mesure d'audience. Le seul
			cookie déposé sert à la connexion de l'équipe au back office.
		</p>
	</section>
</div>

<style lang="scss">
	@use 'tokens' as *;

	.legal {
		display: grid;
		gap: 28px;
		max-width: 820px;
		padding-top: 48px;

		h2 {
			margin-bottom: 8px;
			font-size: 1.5rem;
		}

		p {
			color: $ink-soft;
		}

		p + p {
			margin-top: 8px;
		}
	}
</style>
