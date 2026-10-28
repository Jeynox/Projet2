<script lang="ts">
	let { form }: { form: { error?: string; success?: string } | null | undefined } = $props();
</script>

{#if form?.error}
	<p class="flash flash--error" role="alert">{form.error}</p>
{:else if form?.success}
	<p class="flash flash--success" role="status">{form.success}</p>
{/if}
