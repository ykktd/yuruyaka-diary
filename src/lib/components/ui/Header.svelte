<script lang="ts">
	import { Cloud } from 'lucide-svelte';
	import { signOut } from '$lib/services/auth';
	import type { User } from '@supabase/supabase-js';

	let { user = null }: { user: User | null } = $props();

	let dropdownOpen = $state(false);
	let dropdownEl = $state<HTMLDivElement | null>(null);

	const avatarChar = $derived(() => {
		if (!user) return '';
		const displayName = user.user_metadata?.display_name as string | undefined;
		if (displayName) return displayName.charAt(0).toUpperCase();
		if (user.email) return user.email.charAt(0).toUpperCase();
		return '?';
	});

	const displayName = $derived(() => {
		return (user?.user_metadata?.display_name as string | undefined) ?? user?.email ?? '';
	});

	$effect(() => {
		function handleClick(e: MouseEvent) {
			if (dropdownEl && !dropdownEl.contains(e.target as Node)) {
				dropdownOpen = false;
			}
		}
		window.addEventListener('click', handleClick);
		return () => window.removeEventListener('click', handleClick);
	});

	async function handleSignOut() {
		await signOut();
		window.location.href = '/login';
	}
</script>

<header class="sticky top-0 z-40 border-b border-slate-100 bg-white/80 px-6 py-4 backdrop-blur-md">
	<div class="mx-auto flex max-w-md items-center justify-between">
		<div class="flex items-center gap-3">
			<div
				class="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-100 text-brand-500 shadow-sm shadow-brand-200/50"
			>
				<Cloud size={24} strokeWidth={2.5} />
			</div>
			<div>
				<h1 class="flex items-center gap-1 text-xl font-bold tracking-tight text-slate-800">
					ゆるやかダイアリー
				</h1>
			</div>
		</div>

		{#if user}
			<div class="relative" bind:this={dropdownEl}>
				<button
					onclick={() => (dropdownOpen = !dropdownOpen)}
					class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-50 transition-colors hover:bg-brand-100"
				>
					<span class="text-[10px] font-bold text-brand-400">{avatarChar()}</span>
				</button>

				{#if dropdownOpen}
					<div
						class="absolute top-10 right-0 z-50 w-56 rounded-2xl border border-slate-100 bg-white p-3 shadow-lg"
					>
						<div class="mb-2 px-2 py-1">
							<p class="text-sm font-medium text-slate-800">{displayName()}</p>
							<p class="text-xs text-slate-400">{user.email}</p>
						</div>
						<div class="h-px bg-slate-100"></div>
						<a
							href="/settings"
							onclick={() => (dropdownOpen = false)}
							class="mt-1 flex w-full items-center rounded-xl px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
						>
							設定
						</a>
						<button
							onclick={handleSignOut}
							class="flex w-full items-center rounded-xl px-2 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50"
						>
							ログアウト
						</button>
					</div>
				{/if}
			</div>
		{/if}
	</div>
</header>
