<script lang="ts">
	import { toast } from '$lib/toast.svelte';
	import { fly, fade } from 'svelte/transition';
	import { CheckCircle2, AlertCircle, Info, X } from 'lucide-svelte';

	// Asignación de iconos y clases según el tipo de Toast
	const config = {
		success: {
			icon: CheckCircle2,
			bg: 'bg-white/80 dark:bg-slate-900/90 border-emerald-500/30 dark:border-emerald-500/20',
			iconColor: 'text-emerald-500 dark:text-emerald-400',
			ring: 'focus:ring-emerald-500'
		},
		error: {
			icon: AlertCircle,
			bg: 'bg-white/80 dark:bg-slate-900/90 border-red-500/30 dark:border-red-500/20',
			iconColor: 'text-red-500 dark:text-red-400',
			ring: 'focus:ring-red-500'
		},
		info: {
			icon: Info,
			bg: 'bg-white/80 dark:bg-slate-900/90 border-blue-500/30 dark:border-blue-500/20',
			iconColor: 'text-blue-500 dark:text-blue-400',
			ring: 'focus:ring-blue-500'
		}
	};
</script>

<div 
	role="status" 
	aria-live="polite" 
	class="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 z-[9999] flex flex-col gap-3 max-w-full md:w-[380px] pointer-events-none"
>
	{#each toast.list as item (item.id)}
		{@const cfg = config[item.type]}
		{@const Icon = cfg.icon}
		
		<div
			in:fly={{ y: 50, duration: 400 }}
			out:fade={{ duration: 250 }}
			class="pointer-events-auto w-full flex items-start gap-3.5 p-4 rounded-2xl border backdrop-blur-xl shadow-lg dark:shadow-slate-950/30 {cfg.bg} transition-all duration-300 transform"
		>
			<div class="shrink-0 mt-0.5 {cfg.iconColor}">
				<Icon class="w-5 h-5" aria-hidden="true" />
			</div>
			
			<div class="flex-grow min-w-0">
				<p class="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug break-words">
					{item.message}
				</p>
			</div>

			<button
				type="button"
				onclick={() => toast.remove(item.id)}
				aria-label="Cerrar notificación"
				class="shrink-0 -mt-1 -mr-1 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 {cfg.ring}"
			>
				<X class="w-4 h-4" aria-hidden="true" />
			</button>
		</div>
	{/each}
</div>
