<script lang="ts">
    import { fade, slide, scale } from 'svelte/transition';
    import { History, X, Clock, Package } from 'lucide-svelte';

    let { 
        isOpen = $bindable(false), 
        movimientosActivo, 
        ticketId
    } = $props<{
        isOpen: boolean;
        movimientosActivo: any[];
        ticketId: number;
    }>();

    const formatDate = (date: Date | string | null) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };
</script>

{#if isOpen}
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" transition:fade={{ duration: 200 }}>
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button type="button" class="absolute inset-0 bg-slate-950/80 backdrop-blur-xl w-full h-full cursor-default" onclick={() => isOpen = false} aria-label="Cerrar historial"></button>
        <div class="relative w-full max-w-2xl h-[70vh] bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col" transition:scale={{ duration: 300, start: 0.95, opacity: 0 }}>
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/20">
                <div class="flex items-center gap-3">
                    <History class="w-6 h-6 text-indigo-600" />
                    <h2 class="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Trazabilidad del Activo</h2>
                </div>
                <button onclick={() => isOpen = false} class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"><X class="w-6 h-6 text-slate-400" /></button>
            </div>
            <div class="flex-grow overflow-y-auto p-8 space-y-6 custom-scrollbar">
                {#if movimientosActivo && movimientosActivo.length > 0}
                    {#each movimientosActivo as mov}
                        <div transition:slide class="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-700/50 relative overflow-hidden group">
                            <div class="absolute top-0 left-0 w-1.5 h-full bg-indigo-600"></div>
                            <div class="flex items-center justify-between mb-2">
                                <span class="px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/40 text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{mov.tipo?.tipo_movimiento || 'MOVIMIENTO'}</span>
                                <span class="text-[10px] font-bold text-slate-400 flex items-center gap-1.5"><Clock class="w-3 h-3" /> {formatDate(mov.created_at)}</span>
                            </div>
                            <p class="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed italic">"{mov.motivo || 'Sin observaciones registradas'}"</p>
                            <div class="mt-4 flex items-center gap-2 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                                <div class="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] text-slate-500 font-bold">R</div>
                                <span class="text-[10px] font-bold text-slate-500">Ref: Registro de Operación #{ticketId}</span>
                            </div>
                        </div>
                    {/each}
                {:else}
                    <div class="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
                        <Package class="w-12 h-12 opacity-20" />
                        <p class="text-sm font-medium">No existen movimientos registrados para este activo.</p>
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.2); border-radius: 10px; }
</style>
