<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import hero from '#lib/assets/images/hero.webp';
	import logo from '#lib/assets/logo.png';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Connexion · Back office Stras'bouq</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="login">
	<img class="login__bg" src={hero} alt="" />

	<div class="login__card">
		<a class="login__brand" href={resolve('/(site)')}>
			<img src={logo} alt="" width="48" height="48" />
			<span class="script">Stras'bouq</span>
		</a>
		<h1>Back office</h1>
		<p class="login__intro">
			Connectez-vous pour gérer le catalogue, le stock et les demandes.
		</p>

		<form
			method="POST"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update();
					submitting = false;
				};
			}}
		>
			<div class="form-field">
				<label for="email">E-mail</label>
				<input
					id="email"
					name="email"
					type="email"
					autocomplete="username"
					required
					value={form?.email ?? ''}
				/>
			</div>
			<div class="form-field">
				<label for="password">Mot de passe</label>
				<input
					id="password"
					name="password"
					type="password"
					autocomplete="current-password"
					required
				/>
			</div>

			{#if form?.error}
				<p class="notice notice--error" role="alert">{form.error}</p>
			{/if}

			<button class="btn btn--block" type="submit" disabled={submitting}>
				{submitting ? 'Connexion…' : 'Se connecter'}
			</button>
		</form>

		<a class="login__back" href={resolve('/(site)')}>← Retour au site</a>
	</div>
</main>

<style lang="scss">
	@use 'tokens' as *;

	.login {
		position: relative;
		isolation: isolate;
		display: grid;
		place-items: center;
		min-height: 100vh;
		padding: 24px 16px;
		background: $ink;

		&::after {
			content: '';
			position: absolute;
			inset: 0;
			z-index: -1;
			background: rgba($ink, 0.6);
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
			gap: 18px;
			width: 100%;
			max-width: 420px;
			padding: clamp(28px, 5vw, 44px);
			border-radius: $radius;
			background: $surface;
			box-shadow: $shadow-lg;

			@include motion {
				animation: fade-up 0.7s $ease-out both;
			}

			h1 {
				font-size: 2rem;
			}

			form {
				display: grid;
				gap: 16px;
			}
		}

		&__brand {
			display: flex;
			align-items: center;
			gap: 10px;
			text-decoration: none;

			img {
				padding: 6px;
				border-radius: 50%;
				background: $ink;
			}

			.script {
				font-size: 2.2rem;
			}
		}

		&__intro {
			margin-top: -8px;
			color: $ink-soft;
		}

		&__back {
			font-size: 0.9rem;
			color: $ink-soft;
			text-decoration: none;

			&:hover {
				color: $rose;
			}
		}
	}
</style>
