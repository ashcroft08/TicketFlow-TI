<script lang="ts">
	import { offlineEnhance } from '$lib/client/offlineEnhance';
    import { fade, scale } from 'svelte/transition';
    import { Wrench, X, Save } from 'lucide-svelte';
    import { enhance } from '$app/forms';

    let { 
        isOpen = $bindable(false), 
        ticket, 
        tiposMovimiento
    } = $props<{
        isOpen: boolean;
        ticket: any;
        tiposMovimiento: any[];
    }>();

    let isSubmitting = $state(false);
</script>

{#if isOpen}
    <div class="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6" transition:fade={{ duration: 200 }}>
        <!-- svelte-ignore a11y_consider_explicit_label -->
        <button type="button" class="absolute inset-0 bg-slate-950/80 backdrop-blur-xl w-full h-full cursor-default" onclick={() => isOpen = false} aria-label="Cerrar registro"></button>
        <div 
            class="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800" 
            role="dialog"
            aria-modal="true"
            aria-labelledby="movement-modal-title"
            transition:scale={{ duration: 300, start: 0.95, opacity: 0 }}
        >
            <div class="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <Wrench class="w-6 h-6 text-emerald-600 aria-hidden=true" />
                    <h2 id="movement-modal-title" class="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Nuevo Movimiento</h2>
                </div>
                <button onclick={() => isOpen = false} aria-label="Cerrar modal" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600"><X class="w-6 h-6 text-slate-400 aria-hidden=true" /></button>
            </div>
            <form method="POST" action="?/registerAssetMovement" class="p-8 space-y-6" use:offlineEnhance={() => { 
                isSubmitting = true; 
                return async ({ result, update }) => { 
                    await update({ reset: false }); 
                    isSubmitting = false; 
                    if (result.type === 'success') isOpen = false;
                }; 
            }}>
                <input type="hidden" name="id_activo" value={ticket.id_activo} />
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label for="id_tipo_movimiento_mod" class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Acción a realizar *</label>
                        <select id="id_tipo_movimiento_mod" name="id_tipo_movimiento" required aria-label="Acción a realizar" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 focus:ring-emerald-600 transition-all">
                             <option value="">SELECCIONAR ACCIÓN...</option>
                             {#each tiposMovimiento as tipo}
                                 <option value={tipo.id_tipo_movimiento}>{tipo.tipo_movimiento.toUpperCase()}</option>
                             {/each}
                        </select>
                    </div>
                    <div class="space-y-2">
                        <label for="nuevo_estado_mod" class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nuevo Estado *</label>
                        <select id="nuevo_estado_mod" name="nuevo_estado" required aria-label="Nuevo Estado" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-emerald-500/10 focus:ring-emerald-600 transition-all">
                            <option value="activo" selected={ticket.activo_ti?.estado === 'activo'}>ACTIVO (EN USO)</option>
                            <option value="en_reparacion">EN REPARACIÓN (TALLER)</option>
                            <option value="bodega">BODEGA (RESERVA)</option>
                            <option value="baja">BAJA (DESECHO)</option>
                        </select>
                    </div>
                </div>
                <div class="space-y-2">
                    <label for="motivo_mov_mod" class="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Motivo / Observaciones</label>
                    <textarea id="motivo_mov_mod" name="motivo" aria-label="Motivo / Observaciones" placeholder="Describe brevemente el motivo del cambio..." rows="4" class="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-medium outline-none resize-none focus:ring-4 focus:ring-emerald-500/10 focus:ring-emerald-600 transition-all"></textarea>
                </div>
                <div class="flex gap-3">
                    <button type="button" onclick={() => isOpen = false} class="flex-grow py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400">Cancelar</button>
                    <button type="submit" disabled={isSubmitting} class="flex-[2] py-4 bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px] rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-emerald-600">
                        {#if isSubmitting}
                            <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true"></div>
                            GUARDANDO...
                        {:else}
                            <Save class="w-4 h-4 aria-hidden=true" /> GUARDAR MOVIMIENTO
                        {/if}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}
