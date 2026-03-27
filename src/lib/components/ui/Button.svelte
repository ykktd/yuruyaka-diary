<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'primary' | 'secondary' | 'ghost';
		fullWidth?: boolean;
		disabled?: boolean;
		onclick?: () => void;
		children: Snippet;
	}

	let {
		variant = 'primary',
		fullWidth = false,
		disabled = false,
		onclick,
		children
	}: Props = $props();
</script>

<button
	{disabled}
	{onclick}
	class={[
		'inline-flex cursor-pointer items-center justify-center rounded-xl px-6 py-3 text-sm font-medium transition-colors',
		fullWidth && 'w-full',
		variant === 'primary' &&
			'bg-brand-500 text-white shadow-lg shadow-brand-200/50 hover:bg-brand-600 disabled:opacity-50',
		variant === 'secondary' &&
			'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50',
		variant === 'ghost' && 'text-slate-400 hover:text-slate-600 disabled:opacity-50'
	]
		.filter(Boolean)
		.join(' ')}
>
	{@render children()}
</button>
