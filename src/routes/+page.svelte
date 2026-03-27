<script lang="ts">
	import type { PageData } from './$types';
	import { WEEK_DAYS } from '$lib/constants';

	let { data }: { data: PageData } = $props();

	const todayLabel = $derived(() => {
		const d = new Date(data.today + 'T00:00:00');
		const y = d.getFullYear();
		const m = d.getMonth() + 1;
		const day = d.getDate();
		const weekday = WEEK_DAYS[d.getDay()];
		return `${y}年${m}月${day}日 ${weekday}曜日`;
	});

	const last7Days = $derived(() => {
		const days: string[] = [];
		for (let i = 6; i >= 0; i--) {
			const d = new Date(data.today + 'T00:00:00');
			d.setDate(d.getDate() - i);
			days.push(d.toISOString().split('T')[0]);
		}
		return days;
	});
</script>

<main class="mx-auto max-w-md space-y-8 px-4 py-10">
	<!-- 日付ヘッダー -->
	<div class="text-center">
		<p class="text-lg font-medium text-slate-800">{todayLabel()}</p>
	</div>

	<!-- メイン CTA -->
	<div class="flex flex-col items-center gap-3">
		{#if data.todayEntry}
			<a
				href={`/record/${data.today}`}
				class="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-4 text-base font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
			>
				今日の記録を見る・編集する
			</a>
		{:else}
			<a
				href={`/record/${data.today}`}
				class="flex w-full items-center justify-center rounded-xl bg-brand-500 px-6 py-4 text-base font-medium text-white shadow-lg shadow-brand-200/50 transition-colors hover:bg-brand-600"
			>
				今日を記録する
			</a>
		{/if}

		{#if !data.yesterdayEntry}
			<a
				href={`/record/${data.yesterday}`}
				class="text-sm text-slate-400 transition-colors hover:text-slate-600"
			>
				昨日の記録を書く
			</a>
		{/if}
	</div>

	<!-- 過去7日グラフ -->
	<div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
		<p class="mb-4 text-xs text-slate-400">過去7日</p>
		<div class="flex items-end gap-1.5">
			{#each last7Days() as date (date)}
				{@const hasEntry = data.recentDates.includes(date)}
				{@const d = new Date(date + 'T00:00:00')}
				<div class="flex flex-1 flex-col items-center gap-1">
					<div
						class={['h-8 w-full rounded-md', hasEntry ? 'bg-brand-400' : 'bg-slate-200'].join(' ')}
					></div>
					<span class="text-xs text-slate-400">{WEEK_DAYS[d.getDay()]}</span>
				</div>
			{/each}
		</div>
	</div>
</main>
