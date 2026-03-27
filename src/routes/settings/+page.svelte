<script lang="ts">
	import { untrack } from 'svelte';
	import { supabase } from '$lib/supabase/client';
	import type { LayoutData } from '../$types';

	let { data }: { data: LayoutData } = $props();

	// 表示名変更（untrack で初期値のみ取得）
	let newDisplayName = $state(
		untrack(() => (data.user?.user_metadata?.display_name as string | undefined) ?? '')
	);
	let nameSaving = $state(false);
	let nameSuccess = $state('');
	let nameError = $state('');

	async function handleNameSave(e: SubmitEvent) {
		e.preventDefault();
		nameSaving = true;
		nameSuccess = '';
		nameError = '';
		try {
			const { error } = await supabase.auth.updateUser({
				data: { display_name: newDisplayName }
			});
			if (error) throw error;
			nameSuccess = '表示名を更新しました';
		} catch {
			nameError = '更新に失敗しました。もう一度お試しください';
		} finally {
			nameSaving = false;
		}
	}

	// パスワード変更
	let newPassword = $state('');
	let confirmPassword = $state('');
	let passwordSaving = $state(false);
	let passwordSuccess = $state('');
	let passwordError = $state('');

	async function handlePasswordSave(e: SubmitEvent) {
		e.preventDefault();
		passwordError = '';
		passwordSuccess = '';

		if (newPassword.length < 6) {
			passwordError = 'パスワードは6文字以上で入力してください';
			return;
		}
		if (newPassword !== confirmPassword) {
			passwordError = 'パスワードが一致しません';
			return;
		}

		passwordSaving = true;
		try {
			const { error } = await supabase.auth.updateUser({ password: newPassword });
			if (error) throw error;
			passwordSuccess = 'パスワードを更新しました';
			newPassword = '';
			confirmPassword = '';
		} catch {
			passwordError = 'パスワードの更新に失敗しました。もう一度お試しください';
		} finally {
			passwordSaving = false;
		}
	}
</script>

<main class="mx-auto max-w-md space-y-6 px-4 py-6 pb-32">
	<p class="text-xs font-medium tracking-widest text-slate-400 uppercase">設定</p>

	<!-- 表示名変更 -->
	<div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
		<p class="mb-4 text-xs font-medium tracking-widest text-slate-400 uppercase">表示名の変更</p>
		<form onsubmit={handleNameSave} class="space-y-4">
			<input
				type="text"
				bind:value={newDisplayName}
				required
				class="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-300 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
				placeholder="表示名"
			/>
			{#if nameSuccess}
				<p class="text-sm text-green-600">{nameSuccess}</p>
			{/if}
			{#if nameError}
				<p class="text-sm text-red-500">{nameError}</p>
			{/if}
			<button
				type="submit"
				disabled={nameSaving}
				class="w-full rounded-xl bg-brand-500 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
			>
				{nameSaving ? '保存中...' : '保存する'}
			</button>
		</form>
	</div>

	<!-- パスワード変更 -->
	<div class="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
		<p class="mb-4 text-xs font-medium tracking-widest text-slate-400 uppercase">
			パスワードの変更
		</p>
		<form onsubmit={handlePasswordSave} class="space-y-4">
			<input
				type="password"
				bind:value={newPassword}
				required
				class="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-300 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
				placeholder="新しいパスワード（6文字以上）"
			/>
			<input
				type="password"
				bind:value={confirmPassword}
				required
				class="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-300 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
				placeholder="パスワードの確認"
			/>
			{#if passwordSuccess}
				<p class="text-sm text-green-600">{passwordSuccess}</p>
			{/if}
			{#if passwordError}
				<p class="text-sm text-red-500">{passwordError}</p>
			{/if}
			<button
				type="submit"
				disabled={passwordSaving}
				class="w-full rounded-xl bg-brand-500 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-600 disabled:opacity-50"
			>
				{passwordSaving ? '変更中...' : '変更する'}
			</button>
		</form>
	</div>
</main>
