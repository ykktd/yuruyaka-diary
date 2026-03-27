<script lang="ts">
	import { Moon, Zap, MapPin } from 'lucide-svelte';
	import { WEEK_DAYS } from '$lib/constants';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	function dateLabel(dateStr: string): string {
		const d = new Date(dateStr + 'T00:00:00');
		const m = d.getMonth() + 1;
		const day = d.getDate();
		const weekday = WEEK_DAYS[d.getDay()];
		return `${m}月${day}日（${weekday}）`;
	}

	function moodColor(mood: number): string {
		if (mood <= 33) return 'bg-red-300';
		if (mood <= 66) return 'bg-yellow-300';
		return 'bg-green-300';
	}
</script>

<main class="mx-auto max-w-md space-y-3 px-4 py-6 pb-32">
	<p class="mb-4 text-xs font-medium tracking-widest text-slate-400 uppercase">これまでの記録</p>

	{#if data.entries.length === 0}
		<p class="py-16 text-center text-sm text-slate-400">まだ記録がありません</p>
	{:else}
		{#each data.entries as entry (entry.id)}
			<a
				href={`/record/${entry.date}`}
				class="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50"
			>
				<div class="flex-1">
					<p class="text-sm font-medium text-slate-700">{dateLabel(entry.date)}</p>
				</div>

				<div class="flex items-center gap-2">
					{#if entry.sleptWell}
						<Moon size={15} class="text-slate-400" />
					{/if}
					{#if entry.busy}
						<Zap size={15} class="text-slate-400" />
					{/if}
					{#if entry.wentOut}
						<MapPin size={15} class="text-slate-400" />
					{/if}
					<div class={`h-3 w-3 rounded-full ${moodColor(entry.mood)}`}></div>
				</div>
			</a>
		{/each}
	{/if}
</main>
