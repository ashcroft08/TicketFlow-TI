<script lang="ts">
	import { pwa } from '$lib/pwa.svelte';
	import { fly } from 'svelte/transition';
	import { Download, X, Smartphone } from 'lucide-svelte';
	import { onMount } from 'svelte';

	let dismissed = $state<boolean>(true); // Por defecto oculto para evitar parpadeo pre-hidratación

	onMount(() => {
		// Validar si el usuario ya descartó la sugerencia de instalación en esta sesión
		const wasDismissed = sessionStorage.getItem('pwa-prompt-dismissed') === 'true';
		dismissed = wasDismissed;
	});

	function handleDismiss() {
		dismissed = true;
		sessionStorage.setItem('pwa-prompt-dismissed', 'true');
	}

	async function handleInstall() {
		await pwa.install();
		dismissed = true;
	}
</script>

{#if pwa.installPrompt && !dismissed}
	<div
		in:fly={{ y: 50, duration: 500 }}
		out:fly={{ y: 20, duration: 200 }}
		class="fixed bottom-6 left-6 right-6 md:left-6 md:right-auto md:w-[360px] z-[9998] p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-xl dark:shadow-slate-950/40 pointer-events-auto flex flex-col gap-4 transition-all duration-300"
		role="dialog"
		aria-labelledby="pwa-title"
		aria-describedby="pwa-desc"
	>
		<div class="flex items-start gap-4">
			<div class="shrink-0 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
				<Smartphone class="w-6 h-6" aria-hidden="true" />
			</div>
			
			<div class="flex-grow min-w-0">
				<h3 id="pwa-title" class="text-sm font-bold text-slate-800 dark:text-slate-100">
					TicketFlow en tu Celular
				</h3>
				<p id="pwa-desc" class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
					Instala la aplicación para acceder de inmediato, recibir notificaciones y trabajar sin conexión.
				</p>
			</div>

			<button
				type="button"
				onclick={handleDismiss}
				aria-label="Cerrar sugerencia de instalación"
				class="shrink-0 -mt-1 -mr-1 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
			>
				<X class="w-4 h-4" aria-hidden="true" />
			</button>
		</div>

		<div class="flex gap-2.5">
			<button
				type="button"
				onclick={handleDismiss}
				class="flex-1 h-9 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
			>
				Quizás luego
			</button>
			<button
				type="button"
				onclick={handleInstall}
				class="flex-1 h-9 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/10 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
			>
				<Download class="w-3.5 h-3.5" aria-hidden="true" />
				Instalar App
			</button>
		</div>
	</div>
{/if}
