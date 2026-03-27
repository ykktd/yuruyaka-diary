<script lang="ts">
	import { goto } from '$app/navigation';
	import { signUp } from '$lib/services/auth';
	import { supabase } from '$lib/supabase/client';

	let displayName = $state('');
	let email = $state('');
	let password = $state('');
	let errorMessage = $state('');
	let loading = $state(false);

	function toJapaneseError(message: string): string {
		if (message.includes('User already registered')) {
			return 'このメールアドレスはすでに登録されています';
		}
		if (message.includes('Password should be at least 6 characters')) {
			return 'パスワードは6文字以上で入力してください';
		}
		return '登録に失敗しました。もう一度お試しください';
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = '';
		loading = true;
		try {
			await signUp(email, password, displayName);
			// メール確認が無効の場合はセッションが即時発行される
			const {
				data: { session }
			} = await supabase.auth.getSession();
			if (session) {
				goto('/');
			} else {
				// メール確認が有効な場合
				goto('/login?registered=1');
			}
		} catch (err) {
			errorMessage = toJapaneseError(err instanceof Error ? err.message : '');
		} finally {
			loading = false;
		}
	}
</script>

<main class="mx-auto max-w-md px-4 py-16">
	<div class="mb-8 text-center">
		<h2 class="text-2xl font-bold text-slate-800">新規登録</h2>
	</div>

	<div class="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
		<form onsubmit={handleSubmit} class="space-y-5">
			<div class="space-y-1">
				<label
					for="displayName"
					class="text-xs font-medium tracking-widest text-slate-400 uppercase"
				>
					表示名
				</label>
				<input
					id="displayName"
					type="text"
					bind:value={displayName}
					required
					class="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-300 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
					placeholder="あなたの名前"
				/>
			</div>

			<div class="space-y-1">
				<label for="email" class="text-xs font-medium tracking-widest text-slate-400 uppercase">
					メールアドレス
				</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					required
					class="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-300 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
					placeholder="example@email.com"
				/>
			</div>

			<div class="space-y-1">
				<label for="password" class="text-xs font-medium tracking-widest text-slate-400 uppercase">
					パスワード
				</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					required
					class="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder-slate-300 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
					placeholder="6文字以上"
				/>
			</div>

			{#if errorMessage}
				<p class="text-sm text-red-500">{errorMessage}</p>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full rounded-xl bg-brand-500 py-4 text-base font-medium text-white shadow-lg shadow-brand-200/50 transition-colors hover:bg-brand-600 disabled:opacity-50"
			>
				{loading ? '登録中...' : '登録する'}
			</button>
		</form>
	</div>

	<p class="mt-6 text-center text-sm text-slate-400">
		すでにアカウントをお持ちの方は
		<a href="/login" class="text-brand-500 underline underline-offset-2 hover:text-brand-600">
			ログイン
		</a>
	</p>
</main>
