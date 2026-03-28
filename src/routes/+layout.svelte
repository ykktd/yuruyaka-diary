<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import Header from '$lib/components/ui/Header.svelte';
	import { Home, BookOpen, Settings } from 'lucide-svelte';
	import { page } from '$app/stores';
	import type { LayoutData } from './$types';
	import type { Snippet } from 'svelte';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();

	onMount(() => {
		const viewport = document.querySelector<HTMLMetaElement>('meta[name="viewport"]');
		if (!viewport) return;

		// On iOS Safari, focusing an input with font-size < 16px triggers a zoom that
		// does not automatically restore after blur. Temporarily constraining
		// maximum-scale=1 then restoring it snaps the browser back to scale 1.
		function resetZoom() {
			const original = viewport!.content;
			// Replace an existing maximum-scale value, or append one if absent.
			const patched = /maximum-scale/.test(original)
				? original.replace(/maximum-scale=[^,]+/, 'maximum-scale=1')
				: original + ', maximum-scale=1';
			viewport!.content = patched;
			requestAnimationFrame(() => {
				viewport!.content = original;
			});
		}

		function onBlur(e: Event) {
			const tag = (e.target as HTMLElement)?.tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
				resetZoom();
			}
		}

		document.addEventListener('blur', onBlur, true);
		return () => document.removeEventListener('blur', onBlur, true);
	});

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
