<script lang="ts">
	import { Cloud } from 'lucide-svelte';
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

		<div class="flex -space-x-2">
			<div
				class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-50"
			>
				<span class="text-[10px] font-bold text-brand-400">Y</span>
			</div>
		</div>
	</div>
</header>
