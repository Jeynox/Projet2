<script lang="ts">
	type Props = { name: string; label: string; current: string | null; hint?: string };
	let {
		name,
		label,
		current,
		hint = 'JPG, PNG, WebP, GIF ou AVIF — 8 Mo max. Convertie en WebP.'
	}: Props = $props();

	/** Aperçu local de la nouvelle image avant envoi (URL blob: , jamais envoyée ailleurs). */
	let preview = $state<string | null>(null);

	function onchange(event: Event & { currentTarget: HTMLInputElement }) {
		if (preview) URL.revokeObjectURL(preview);
		const file = event.currentTarget.files?.[0];
		preview = file ? URL.createObjectURL(file) : null;
	}

	const shown = $derived(preview ?? current);
</script>

<div class="field field--full">
	<label for="{name}-file">{label}</label>
	<div class="image-field">
		<div class="image-field__preview">
			{#if shown}
				<img src={shown} alt="Aperçu actuel" />
			{:else}
				<span aria-hidden="true">✿</span>
			{/if}
		</div>
		<div class="image-field__inputs">
			<input
				id="{name}-file"
				type="file"
				name="{name}File"
				accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
				{onchange}
			/>
			<input type="hidden" {name} value={current ?? ''} />
			{#if current}
				<label class="check"
					><input type="checkbox" name="{name}Remove" /> Retirer l'image actuelle</label
				>
			{/if}
			<span class="hint">{hint}</span>
		</div>
	</div>
</div>

<style lang="scss">
	@use 'tokens' as *;

	.image-field {
		display: flex;
		flex-wrap: wrap;
		gap: 18px;
		align-items: center;

		&__preview {
			display: grid;
			place-items: center;
			width: 120px;
			aspect-ratio: 4 / 5;
			border: 1.5px dashed $line;
			border-radius: $radius-sm;
			background: $blush-soft;
			color: $rose;
			font-size: 2rem;
			overflow: hidden;

			img {
				width: 100%;
				height: 100%;
				object-fit: cover;
			}
		}

		&__inputs {
			display: flex;
			flex-direction: column;
			gap: 8px;
			min-width: 0;
		}
	}
</style>
