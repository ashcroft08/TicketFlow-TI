<script lang="ts">
	let { 
		type = 'card', 
		count = 1,
		className = '' 
	} = $props<{
		type?: 'card' | 'table' | 'text' | 'circle';
		count?: number;
		className?: string;
	}>();
</script>

<div class="space-y-4 {className}">
	{#each Array(count) as _}
		{#if type === 'card'}
			<div class="glass-card p-6 rounded-[24px] space-y-4 border border-white/20 dark:border-white/5">
				<div class="flex justify-between items-center">
					<div class="h-6 w-1/3 shimmer-effect"></div>
					<div class="h-5 w-16 rounded-full shimmer-effect"></div>
				</div>
				<div class="space-y-2">
					<div class="h-4 w-full shimmer-effect"></div>
					<div class="h-4 w-5/6 shimmer-effect"></div>
				</div>
				<div class="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-between">
					<div class="h-4 w-24 shimmer-effect"></div>
					<div class="h-4 w-16 shimmer-effect"></div>
				</div>
			</div>
		{:else if type === 'table'}
			<div class="glass-card rounded-[24px] overflow-hidden border-none p-4 space-y-3">
				<div class="h-10 w-full shimmer-effect rounded-lg"></div>
				<div class="space-y-2">
					{#each Array(4) as _}
						<div class="flex items-center gap-4 py-2 border-b border-slate-100 dark:border-slate-800/20">
							<div class="h-5 w-1/4 shimmer-effect"></div>
							<div class="h-5 w-1/6 shimmer-effect"></div>
							<div class="h-5 w-1/3 shimmer-effect"></div>
							<div class="h-8 w-8 rounded-md shimmer-effect ml-auto"></div>
						</div>
					{/each}
				</div>
			</div>
		{:else if type === 'text'}
			<div class="space-y-2">
				<div class="h-4 w-full shimmer-effect"></div>
				<div class="h-4 w-5/6 shimmer-effect"></div>
				<div class="h-4 w-4/5 shimmer-effect"></div>
			</div>
		{:else if type === 'circle'}
			<div class="h-12 w-12 rounded-full shimmer-effect"></div>
		{/if}
	{/each}
</div>
