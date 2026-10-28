<script lang="ts">
	import { enhance } from '$app/forms';
	import FormFeedback from '#lib/components/admin/FormFeedback.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const unread = $derived(data.messages.filter((m) => !m.read).length);
	const date = (iso: string) =>
		new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(
			new Date(iso)
		);
</script>

<svelte:head>
	<title>Messages · Back office</title>
</svelte:head>

<div class="page-head">
	<div>
		<h1>Messages clients</h1>
		<p>{unread} non lu{unread > 1 ? 's' : ''} sur {data.messages.length}.</p>
	</div>
</div>

<FormFeedback {form} />

{#if data.messages.length}
	<ul class="messages" role="list">
		{#each data.messages as message (message.id)}
			<li class="message panel" class:message--unread={!message.read}>
				<header>
					<div>
						<h2>
							{#if !message.read}<span class="dot" aria-hidden="true"></span>{/if}
							{message.name}
							{#if !message.read}<span class="visually-hidden">(non lu)</span>{/if}
						</h2>
						<a href="mailto:{message.email}">{message.email}</a>
					</div>
					<time datetime={message.createdAt}>{date(message.createdAt)}</time>
				</header>
				<p class="message__body">{message.body}</p>
				<footer class="actions">
					<a
						class="icon-btn"
						href="mailto:{message.email}?subject={encodeURIComponent(
							"Votre message à Stras'bouq"
						)}">Répondre</a
					>
					<form method="POST" action="?/read" use:enhance>
						<input type="hidden" name="id" value={message.id} />
						<input type="hidden" name="read" value={String(!message.read)} />
						<button class="icon-btn" type="submit"
							>{message.read ? 'Marquer non lu' : 'Marquer comme lu'}</button
						>
					</form>
					<form
						method="POST"
						action="?/delete"
						use:enhance={({ cancel }) => {
							if (!confirm(`Supprimer le message de ${message.name} ?`)) cancel();
						}}
					>
						<input type="hidden" name="id" value={message.id} />
						<button class="icon-btn icon-btn--danger" type="submit">Supprimer</button>
					</form>
				</footer>
			</li>
		{/each}
	</ul>
{:else}
	<p class="panel empty-state">Aucun message pour l'instant.</p>
{/if}

<style lang="scss">
	@use 'tokens' as *;

	.messages {
		display: grid;
		gap: 14px;
		max-width: 900px;
	}

	.message {
		display: grid;
		gap: 12px;
		border-left: 4px solid transparent;
		transition: border-color 0.3s;

		&--unread {
			border-left-color: $rose;
		}

		header {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;
			gap: 8px;

			h2 {
				display: flex;
				align-items: center;
				gap: 8px;
				font-size: 1.15rem;
			}

			a {
				color: $rose;
				font-size: 0.9rem;
			}
		}

		time {
			color: $ink-soft;
			font-size: 0.88rem;
		}

		&__body {
			white-space: pre-line;
		}
	}

	.dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: $rose;
	}
</style>
