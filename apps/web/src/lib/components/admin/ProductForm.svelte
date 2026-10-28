<script lang="ts">
	import { enhance } from '$app/forms';
	import { resolve } from '$app/paths';
	import { CATEGORIES, priceInput } from '#lib/catalog.ts';
	import type { Product } from '#lib/types.ts';
	import FormFeedback from './FormFeedback.svelte';
	import ImageField from './ImageField.svelte';

	type Props = {
		product?: Product | null;
		form: { error?: string; success?: string } | null | undefined;
		submitLabel: string;
	};
	let { product = null, form, submitLabel }: Props = $props();
	let submitting = $state(false);
</script>

<FormFeedback {form} />

<form
	class="panel"
	method="POST"
	action="?/save"
	enctype="multipart/form-data"
	use:enhance={() => {
		submitting = true;
		return async ({ update }) => {
			await update({ reset: false });
			submitting = false;
		};
	}}
>
	<div class="form-grid">
		<div class="field">
			<label for="name">Nom</label>
			<input id="name" name="name" maxlength="100" required value={product?.name ?? ''} />
		</div>
		<div class="field">
			<label for="category">Catégorie</label>
			<select id="category" name="category" required>
				<option value="" disabled selected={!product}>Choisir…</option>
				{#each CATEGORIES as category (category.value)}
					<option value={category.value} selected={product?.category === category.value}
						>{category.label}</option
					>
				{/each}
			</select>
		</div>
		<div class="field">
			<label for="price">Prix (€)</label>
			<input
				id="price"
				name="price"
				inputmode="decimal"
				pattern="\d+([.,]\d\d?)?"
				placeholder="12,50"
				required
				value={product ? priceInput(product.priceCents) : ''}
			/>
		</div>
		<div class="field">
			<label for="stock">Stock</label>
			<input
				id="stock"
				name="stock"
				type="number"
				min="0"
				max="100000"
				required
				value={product?.stock ?? 0}
			/>
		</div>
		<div class="field field--full">
			<label for="description">Description</label>
			<textarea id="description" name="description" maxlength="2000"
				>{product?.description ?? ''}</textarea
			>
		</div>

		<ImageField name="imageUrl" label="Photo" current={product?.imageUrl ?? null} />

		<div class="field">
			<label for="slug">Adresse de la page <span class="hint">(facultatif)</span></label>
			<input
				id="slug"
				name="slug"
				maxlength="100"
				placeholder="généré depuis le nom"
				value={product?.slug ?? ''}
			/>
		</div>
		<div class="field">
			<label for="position">Ordre d'affichage</label>
			<input
				id="position"
				name="position"
				type="number"
				min="0"
				max="10000"
				value={product?.position ?? ''}
			/>
		</div>

		<div class="field field--full toggles">
			<label class="check"
				><input type="checkbox" name="published" checked={product?.published ?? true} /> Visible
				sur le site</label
			>
			<label class="check"
				><input type="checkbox" name="featured" checked={product?.featured ?? false} /> Mis en
				avant sur l'accueil (promotions & nouveautés)</label
			>
		</div>
	</div>

	<div class="form-actions">
		<button class="btn btn--rose" type="submit" disabled={submitting}>
			{submitting ? 'Enregistrement…' : submitLabel}
		</button>
		<a class="btn btn--ghost" href={resolve('/admin/(app)/produits')}>Annuler</a>
	</div>
</form>

<style lang="scss">
	.toggles {
		gap: 12px;
	}
</style>
