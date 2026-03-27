<script lang="ts">
	import type { ComponentType, SvelteComponent } from 'svelte';

	interface Props {
		label: string;
		checked?: boolean;
		icon?: ComponentType<SvelteComponent> | undefined;
		onchange?: (checked: boolean) => void;
	}

	let { label, checked = $bindable(false), icon, onchange }: Props = $props();

	function toggle() {
		checked = !checked;
		onchange?.(checked);
	}
</script>

<button
	type="button"
	onclick={toggle}
	class={[
		'inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
		checked
			? 'border-brand-300 bg-brand-100 text-brand-600'
			: 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
	].join(' ')}
>
	{#if icon}
		<svelte:component this={icon} size={16} />
	{/if}
	{label}
</button>
