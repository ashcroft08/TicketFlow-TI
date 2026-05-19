<script lang="ts">
    import { confirmState } from '$lib/state/confirm.svelte';
    import { AlertTriangle, X } from 'lucide-svelte';
    import { fade, scale } from 'svelte/transition';

    // Cerrar con la tecla Escape por accesibilidad
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && confirmState.show) {
            confirmState.cancel();
        }
    };
</script>

<svelte:window onkeydown={handleKeyDown} />

{#if confirmState.show}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        class="fixed inset-0 bg-dark-bg-main/80 backdrop-blur-md z-[90] flex items-center justify-center p-4"
        transition:fade={{ duration: 150 }}
        onclick={(e) => e.target === e.currentTarget && confirmState.cancel()}
    >
        <div 
            class="glass-card w-full max-w-md rounded-xl shadow-2xl overflow-hidden border border-white/10"
            transition:scale={{ start: 0.95, duration: 150 }}
        >
            <!-- Cabecera de Advertencia -->
            <div class="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-error/5">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-error/10 rounded-lg text-error">
                        <AlertTriangle class="w-5 h-5 animate-pulse" />
                    </div>
                    <h2 id="confirm-title" class="text-sm font-black text-text-main dark:text-dark-text-main uppercase tracking-wider">
                        {confirmState.title}
                    </h2>
                </div>
                <button 
                    onclick={() => confirmState.cancel()} 
                    aria-label="Cerrar modal" 
                    class="p-1.5 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <X class="w-4 h-4 text-text-dim" />
                </button>
            </div>

            <!-- Contenido / Mensaje -->
            <div class="p-6">
                <p id="confirm-desc" class="text-xs text-text-dim dark:text-dark-text-dim font-bold leading-relaxed">
                    {confirmState.message}
                </p>
            </div>

            <!-- Botones de Acción -->
            <div class="px-6 py-4 bg-primary/5 border-t border-white/5 flex justify-end gap-3">
                <button 
                    type="button" 
                    onclick={() => confirmState.cancel()} 
                    class="px-5 py-2 text-xs font-bold uppercase tracking-widest text-text-dim hover:text-text-main transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-lg"
                >
                    Cancelar
                </button>
                <button 
                    type="button" 
                    onclick={() => confirmState.confirm()} 
                    class="px-6 py-2 bg-error hover:bg-error/90 text-white font-bold text-xs uppercase tracking-widest transition-colors focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 focus:ring-offset-dark-bg-main rounded-lg shadow-lg shadow-error/20"
                >
                    Confirmar
                </button>
            </div>
        </div>
    </div>
{/if}
