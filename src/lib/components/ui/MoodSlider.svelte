<script lang="ts">
	interface Props {
		value?: number;
	}

	let { value = $bindable(50) }: Props = $props();
</script>

<div class="space-y-2">
	<input
		type="range"
		min="0"
		max="100"
		bind:value
		class="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-brand-500"
	/>
	<div class="flex justify-between text-xs text-slate-400">
		<span>Bad</span>
		<span>Neutral</span>
		<span>Good</span>
	</div>
</div>
