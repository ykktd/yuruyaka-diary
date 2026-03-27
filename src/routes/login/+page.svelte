<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { signIn } from '$lib/services/auth';

	const registered = $derived($page.url.searchParams.get('registered') === '1');

	let email = $state('');
	let password = $state('');
	let errorMessage = $state('');
	let loading = $state(false);

	function toJapaneseError(message: string): string {
		if (message.includes('Invalid login credentials')) {
			return 'メールアドレスまたはパスワードが正しくありません';
		}
		if (message.includes('Email not confirmed')) {
			return 'メールアドレスの確認が完了していません';
		}
		return 'ログインに失敗しました。もう一度お試しください';
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errorMessage = '';
		loading = true;
		try {
			await signIn(email, password);
			goto('/');
		} catch (err) {
			errorMessage = toJapaneseError(err instanceof Error ? err.message : '');
		} finally {
			loading = false;
		}
	}
</script>

<main class="mx-auto max-w-md px-4 py-16">
	<div class="mb-8 text-center">
		<h2 class="text-2xl font-bold text-slate-800">ログイン</h2>
	</div>

	{#if registered}
		<div class="mb-6 rounded-xl bg-brand-50 px-4 py-3 text-sm text-brand-700">
			確認メールを送信しました。メールをご確認ください。
		</div>
	{/if}

	<div class="rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
		<form onsubmit={handleSubmit} class="space-y-5">
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
					placeholder="••••••••"
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
				{loading ? 'ログイン中...' : 'ログイン'}
			</button>
		</form>
	</div>

	<p class="mt-6 text-center text-sm text-slate-400">
		アカウントをお持ちでない方は
		<a href="/signup" class="text-brand-500 underline underline-offset-2 hover:text-brand-600">
			新規登録
		</a>
	</p>
</main>
