<script lang="ts">
	import type { PageData } from './$types';
	import { goto } from '$app/navigation';
	import { untrack } from 'svelte';
	import { Moon, Zap, MapPin, ArrowLeft, Save } from 'lucide-svelte';
	import MoodSlider from '$lib/components/ui/MoodSlider.svelte';
	import CheckboxChip from '$lib/components/ui/CheckboxChip.svelte';
	import { upsertEntry } from '$lib/services/entries';
	import { upsertResponse } from '$lib/services/responses';

	let { data }: { data: PageData } = $props();

	// 日付ラベル
	const dateLabel = $derived(() => {
		const d = new Date(data.date + 'T00:00:00');
		const m = d.getMonth() + 1;
		const day = d.getDate();
		const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
		return { short: `${m}月${day}日`, weekday: weekdays[d.getDay()] };
	});

	// 既存の response を promptId で引く
	function getResponseContent(promptId: string | undefined): string {
		if (!promptId) return '';
		return data.responses.find((r) => r.promptId === promptId)?.content ?? '';
	}

	// フォーム状態（untrack: ページロード時の初期値のみキャプチャ、以降はユーザー編集を追跡）
	let questionAnswer = $state(untrack(() => getResponseContent(data.todayPrompt?.id)));
	let freeNote = $state(untrack(() => getResponseContent(data.freeNotePrompt?.id)));
	let mood = $state(untrack(() => data.entry?.mood ?? 50));
	let sleptWell = $state(untrack(() => data.entry?.sleptWell ?? false));
	let busy = $state(untrack(() => data.entry?.busy ?? false));
	let wentOut = $state(untrack(() => data.entry?.wentOut ?? false));
	let saving = $state(false);
	let errorMessage = $state('');

	async function handleSave() {
		saving = true;
		errorMessage = '';
		try {
			const entry = await upsertEntry({
				date: data.date,
				mood,
				sleptWell,
				busy,
				wentOut
			});

			const savePromises: Promise<unknown>[] = [];
			if (data.todayPrompt) {
				savePromises.push(upsertResponse(entry.id, data.todayPrompt.id, questionAnswer));
			}
			if (data.freeNotePrompt) {
				savePromises.push(upsertResponse(entry.id, data.freeNotePrompt.id, freeNote));
			}
			await Promise.all(savePromises);

			await goto('/');
		} catch (e) {
			console.error('save error:', e);
			errorMessage = '保存に失敗しました。もう一度お試しください。';
		} finally {
			saving = false;
		}
	}
</script>

<div class="mx-auto max-w-md px-4 pt-6 pb-32">
	<!-- ヘッダー -->
	<div class="mb-8 flex items-center gap-3">
		<a
			href="/"
			class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-colors hover:text-slate-600"
		>
			<ArrowLeft size={18} />
		</a>
		<div>
			<p>
				<span class="font-bold text-slate-800">{dateLabel().short}</span>
				<span class="text-slate-400">（{dateLabel().weekday}）</span>
			</p>
			{#if data.isPastDay}
				<p class="text-xs text-brand-500">過去の記録を作成中</p>
			{/if}
		</div>
	</div>

	<div class="space-y-6">
		<!-- 質問エリア -->
		{#if data.todayPrompt}
			<div>
				<p class="mb-2 text-xs font-medium tracking-widest text-slate-400 uppercase">
					Question of the day
				</p>
				<div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
					<p class="mb-3 font-bold text-slate-800">{data.todayPrompt.text}</p>
					<textarea
						bind:value={questionAnswer}
						placeholder="回答は必須ではありません..."
						rows="4"
						class="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 placeholder-slate-300 transition-colors outline-none focus:border-brand-300 focus:bg-white"
					></textarea>
				</div>
			</div>
		{/if}

		<!-- 自由記述エリア -->
		<div>
			<p class="mb-2 text-xs font-medium tracking-widest text-slate-400 uppercase">Free Note</p>
			<div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
				<textarea
					bind:value={freeNote}
					placeholder="ここは自由に書いていい場所です"
					rows="5"
					class="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 placeholder-slate-300 transition-colors outline-none focus:border-brand-300 focus:bg-white"
				></textarea>
			</div>
		</div>

		<!-- 気分スライダー -->
		<div>
			<p class="mb-2 text-xs font-medium tracking-widest text-slate-400 uppercase">Mood</p>
			<div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
				<MoodSlider bind:value={mood} />
			</div>
		</div>

		<!-- チェックボックスチップ -->
		<div>
			<p class="mb-2 text-xs font-medium tracking-widest text-slate-400 uppercase">Activities</p>
			<div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
				<div class="flex flex-wrap gap-2">
					<CheckboxChip label="よく寝た" bind:checked={sleptWell} icon={Moon} />
					<CheckboxChip label="忙しかった" bind:checked={busy} icon={Zap} />
					<CheckboxChip label="外出した" bind:checked={wentOut} icon={MapPin} />
				</div>
			</div>
		</div>
	</div>
</div>

<!-- 固定フッター保存ボタン -->
<div
	class="fixed right-0 bottom-0 left-0 border-t border-slate-100 bg-white/80 p-4 backdrop-blur-sm"
>
	<div class="mx-auto max-w-md">
		{#if errorMessage}
			<p class="mb-2 text-center text-xs text-red-500">{errorMessage}</p>
		{/if}
		<button
			onclick={handleSave}
			disabled={saving}
			class="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-4 text-base font-medium text-white shadow-xl shadow-brand-500/20 transition-colors hover:bg-brand-600 disabled:opacity-50"
		>
			<Save size={18} />
			{saving ? '保存中...' : '保存する'}
		</button>
	</div>
</div>
