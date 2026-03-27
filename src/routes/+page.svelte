<script lang="ts">
	import type { PageData } from './$types';
	import { WEEK_DAYS } from '$lib/constants';
	import { Plus, Home, BookOpen, Settings, PenLine } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	const dateLabel = $derived(() => {
		const d = new Date(data.today + 'T00:00:00');
		const m = d.getMonth() + 1;
		const day = d.getDate();
		const weekday = WEEK_DAYS[d.getDay()];
		return `${m}月${day}日（${weekday}）`;
	});

	const last7Days = $derived(() => {
		const days: string[] = [];
		for (let i = 6; i >= 0; i--) {
			const d = new Date(data.today + 'T00:00:00');
			d.setDate(d.getDate() - i);
			// toISOString はUTC変換でずれるため、ローカル日付文字列を直接構築する
			const yyyy = d.getFullYear();
			const mm = String(d.getMonth() + 1).padStart(2, '0');
			const dd = String(d.getDate()).padStart(2, '0');
			days.push(`${yyyy}-${mm}-${dd}`);
		}
		return days;
	});
</script>

<main class="mx-auto max-w-md space-y-8 px-4 py-10 pb-32">
	<!-- 日付ヘッダー -->
	<div class="text-center">
		<p class="mb-1 text-xs font-medium tracking-widest text-slate-400 uppercase">TODAY</p>
		<p class="text-3xl font-bold text-slate-800">{dateLabel()}</p>
	</div>

	<!-- メイン CTA カード -->
	{#if data.todayEntry}
		<div class="rounded-2xl bg-slate-100/80 p-8 text-center">
			<div class="mb-4 flex justify-center">
				<div class="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-400">
					<PenLine size={28} />
				</div>
			</div>
			<p class="mb-1 text-lg font-bold text-slate-700">記録済みです</p>
			<p class="mb-6 text-sm text-slate-400">今日も一日お疲れ様でした。</p>
			<a
				href={`/record/${data.today}`}
				class="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-4 text-base font-medium text-slate-600 transition-colors hover:bg-slate-50"
			>
				記録を見返す／編集
			</a>
		</div>
	{:else}
		<div class="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
			<p class="mb-1 text-lg font-bold text-slate-800">今日の記録</p>
			<p class="mb-6 text-sm text-slate-400">0文字でも、気分だけでもOK。</p>
			<a
				href={`/record/${data.today}`}
				class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-5 text-base font-medium text-white shadow-lg shadow-brand-200/50 transition-colors hover:bg-brand-600"
			>
				<Plus size={20} />
				今日を記録する
			</a>
		</div>
	{/if}

	<!-- 昨日のサブ導線 -->
	{#if !data.yesterdayEntry}
		<div class="text-center">
			<a
				href={`/record/${data.yesterday}`}
				class="text-sm text-slate-400 underline underline-offset-2 transition-colors hover:text-slate-600"
			>
				昨日の記録を書く
			</a>
		</div>
	{/if}

	<!-- 過去7日 -->
	<div class="text-center">
		<p class="mb-4 text-xs font-medium tracking-widest text-slate-400 uppercase">RECENT DAYS</p>
		<div class="flex justify-between">
			{#each last7Days() as date (date)}
				{@const hasEntry = data.recentDates.includes(date)}
				{@const d = new Date(date + 'T00:00:00')}
				{@const isToday = date === data.today}
				<div class="flex flex-1 flex-col items-center">
					<span
						class={[
							'text-sm font-medium',
							isToday
								? 'text-brand-500'
								: hasEntry
									? 'text-brand-300'
									: 'text-slate-300'
						].join(' ')}
					>
						{WEEK_DAYS[d.getDay()]}
					</span>
				</div>
			{/each}
		</div>
	</div>
</main>

<!-- ボトムナビゲーション -->
<nav class="fixed right-0 bottom-0 left-0 border-t border-slate-100 bg-white">
	<div class="mx-auto flex max-w-md">
		<a href="/" class="flex flex-1 flex-col items-center gap-1 py-3 text-brand-500">
			<Home size={22} />
			<span class="text-xs font-medium">ホーム</span>
		</a>
		<a href="/entries" class="flex flex-1 flex-col items-center gap-1 py-3 text-slate-400 transition-colors hover:text-slate-600">
			<BookOpen size={22} />
			<span class="text-xs font-medium">これまでの記録</span>
		</a>
		<a href="/settings" class="flex flex-1 flex-col items-center gap-1 py-3 text-slate-400 transition-colors hover:text-slate-600">
			<Settings size={22} />
			<span class="text-xs font-medium">設定</span>
		</a>
	</div>
</nav>
