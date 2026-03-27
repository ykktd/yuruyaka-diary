<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		clickable?: boolean;
		children: Snippet;
	}

	let { clickable = false, children }: Props = $props();
</script>

<div
	class={[
		'rounded-2xl border border-slate-100 bg-white p-6 shadow-sm',
		clickable && 'cursor-pointer transition-shadow hover:shadow-md'
	]
		.filter(Boolean)
		.join(' ')}
>
	{@render children()}
</div>
