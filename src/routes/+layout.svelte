<script lang="ts">
	import './layout.css';
	import Header from '$lib/components/ui/Header.svelte';
	import { Home, BookOpen, Settings } from 'lucide-svelte';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	const pathname = $derived($page.url.pathname);
</script>

<Header user={data.user} />
{@render children()}

{#if data.session && !pathname.startsWith('/record/')}
	<nav class="fixed right-0 bottom-0 left-0 border-t border-slate-100 bg-white">
		<div class="mx-auto flex max-w-md">
			<a
				href="/"
				class={[
					'flex flex-1 flex-col items-center gap-1 py-3 transition-colors',
					pathname === '/' ? 'text-brand-500' : 'text-slate-400 hover:text-slate-600'
				].join(' ')}
			>
				<Home size={22} />
				<span class="text-xs font-medium">ホーム</span>
			</a>
			<a
				href="/history"
				class={[
					'flex flex-1 flex-col items-center gap-1 py-3 transition-colors',
					pathname === '/history' ? 'text-brand-500' : 'text-slate-400 hover:text-slate-600'
				].join(' ')}
			>
				<BookOpen size={22} />
				<span class="text-xs font-medium">これまでの記録</span>
			</a>
			<a
				href="/settings"
				class={[
					'flex flex-1 flex-col items-center gap-1 py-3 transition-colors',
					pathname === '/settings' ? 'text-brand-500' : 'text-slate-400 hover:text-slate-600'
				].join(' ')}
			>
				<Settings size={22} />
				<span class="text-xs font-medium">設定</span>
			</a>
		</div>
	</nav>
{/if}
