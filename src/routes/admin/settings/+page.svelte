<script lang="ts">
    import { Sliders, Plus, Edit2, Trash2, Shield, Settings2, X, AlertCircle, Palette, Hash, Tag, Activity } from 'lucide-svelte';
    import { fade, scale } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import { confirmState } from '$lib/state/confirm.svelte';
    import { toast } from '$lib/state/toast.svelte';

    let { data, form } = $props();

    // Pestañas
    let activeTab = $state<'estados' | 'movimientos'>('estados');

    // Estado del Formulario / Modales
    let showModal = $state(false);
    let modalType = $state<'estado' | 'movimiento'>('estado');
    let editingItem = $state<any>(null);

    let formError = $derived(form?.error);

    // Toast de resultado de acciones
    let lastProcessedForm: any = null;
    $effect(() => {
        if (form && form !== lastProcessedForm) {
            lastProcessedForm = form;
            if (form.success) {
                toast.success(form.message || '¡Cambios aplicados con éxito!');
                closeModal();
            } else if (form.error) {
                toast.error(form.error);
            }
        }
    });

    const openCreate = (type: 'estado' | 'movimiento') => {
        modalType = type;
        editingItem = null;
        showModal = true;
    };

    const openEdit = (type: 'estado' | 'movimiento', item: any) => {
        modalType = type;
        editingItem = item;
        showModal = true;
    };

    const closeModal = () => {
        showModal = false;
        editingItem = null;
    };
</script>

<svelte:head>
    <title>Ajustes del Sistema - TicketFlow TI</title>
</svelte:head>

<div class="space-y-6 animate-fade-in-up relative">
    <!-- Orbes decorativos flotantes de fondo -->
    <div class="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-[80px] pointer-events-none animate-blob"></div>
    <div class="absolute bottom-12 left-12 w-72 h-72 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none animate-blob animation-delay-4000"></div>

    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <Sliders class="w-4 h-4 text-primary" />
                <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Configuración</span>
            </div>
            <h1 class="text-2xl font-bold text-text-main dark:text-dark-text-main tracking-tight">Ajustes del Sistema</h1>
            <p class="text-xs text-text-dim dark:text-dark-text-dim font-medium">Administra los catálogos globales de estados y flujos de inventario.</p>
        </div>

        <button 
            onclick={() => openCreate(activeTab === 'estados' ? 'estado' : 'movimiento')}
            class="btn-primary flex items-center gap-2"
        >
            <Plus class="w-4 h-4" />
            <span class="uppercase tracking-tighter text-xs">
                {activeTab === 'estados' ? 'Nuevo Estado' : 'Nuevo Movimiento'}
            </span>
        </button>
    </header>

    <!-- Selector de Pestañas Premium (Tab Selector) -->
    <div class="flex border-b border-slate-200 dark:border-slate-800">
        <button 
            onclick={() => activeTab = 'estados'}
            class="px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 outline-none {activeTab === 'estados' ? 'border-primary text-primary dark:border-blue-500 dark:text-blue-400' : 'border-transparent text-text-dim hover:text-text-main'}"
        >
            Estados de Tickets
        </button>
        <button 
            onclick={() => activeTab = 'movimientos'}
            class="px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 outline-none {activeTab === 'movimientos' ? 'border-primary text-primary dark:border-blue-500 dark:text-blue-400' : 'border-transparent text-text-dim hover:text-text-main'}"
        >
            Movimientos de Inventario
        </button>
    </div>

    <!-- PESTAÑA 1: ESTADOS DE TICKETS -->
    {#if activeTab === 'estados'}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" transition:fade>
            {#each data.estados as est}
                <div class="glass-card-premium p-5 flex flex-col justify-between group hover:-translate-y-1">
                    <div class="flex justify-between items-start gap-4">
                        <div>
                            <div class="flex items-center gap-2">
                                <div class="w-3.5 h-3.5 rounded-full border border-black/10 dark:border-white/10" style="background-color: {est.color || '#3b82f6'}"></div>
                                <h3 class="text-sm font-bold text-text-main dark:text-dark-text-main">{est.nombre}</h3>
                            </div>
                            <p class="text-[10px] text-text-dim font-bold uppercase tracking-wider mt-1 flex items-center gap-1.5">
                                <Palette class="w-3 h-3" /> Color: {est.color || '#3b82f6'}
                            </p>
                        </div>

                        <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border {est.estado ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'}">
                            {est.estado ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>

                    <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-end gap-1.5">
                        <button 
                            onclick={() => openEdit('estado', est)}
                            class="p-2 text-text-dim hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Editar Estado"
                        >
                            <Edit2 class="w-4 h-4" />
                        </button>
                        {#if est.estado}
                            <form use:enhance action="?/deleteEstado" method="POST">
                                <input type="hidden" name="id" value={est.id_estado} />
                                <button 
                                    type="button" 
                                    onclick={(e) => {
                                        const form = e.currentTarget.closest('form');
                                        if (form) {
                                            confirmState.ask(
                                                '¿Desactivar Estado?',
                                                `¿Estás seguro de desactivar el estado "${est.nombre}"? No aparecerá en nuevos tickets, pero se conservará en los históricos.`,
                                                () => form.requestSubmit()
                                            );
                                        }
                                    }}
                                    class="p-2 text-text-dim hover:text-error hover:bg-error/10 rounded-lg transition-all"
                                    title="Desactivar Estado"
                                >
                                    <Trash2 class="w-4 h-4" />
                                </button>
                            </form>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>

    <!-- PESTAÑA 2: TIPOS DE MOVIMIENTOS -->
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" transition:fade>
            {#each data.movimientos as mov}
                <div class="glass-card-premium p-5 flex flex-col justify-between group hover:-translate-y-1">
                    <div class="flex justify-between items-start gap-4">
                        <div>
                            <h3 class="text-sm font-bold text-text-main dark:text-dark-text-main">{mov.tipo_movimiento}</h3>
                            <div class="flex flex-wrap gap-2 mt-2">
                                <span class="px-2 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                                    <Hash class="w-3 h-3" /> Código: {mov.codigo || 'N/A'}
                                </span>
                            </div>
                        </div>

                        <span class="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border {mov.estado ? 'bg-success/10 text-success border-success/20' : 'bg-error/10 text-error border-error/20'}">
                            {mov.estado ? 'Activo' : 'Inactivo'}
                        </span>
                    </div>

                    <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex justify-end gap-1.5">
                        <button 
                            onclick={() => openEdit('movimiento', mov)}
                            class="p-2 text-text-dim hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                            title="Editar Movimiento"
                        >
                            <Edit2 class="w-4 h-4" />
                        </button>
                        {#if mov.estado}
                            <form use:enhance action="?/deleteMovementType" method="POST">
                                <input type="hidden" name="id" value={mov.id_tipo_movimiento} />
                                <button 
                                    type="button" 
                                    onclick={(e) => {
                                        const form = e.currentTarget.closest('form');
                                        if (form) {
                                            confirmState.ask(
                                                '¿Desactivar Movimiento?',
                                                `¿Estás seguro de desactivar el tipo de movimiento "${mov.tipo_movimiento}"? No aparecerá para nuevos registros técnicos.`,
                                                () => form.requestSubmit()
                                            );
                                        }
                                    }}
                                    class="p-2 text-text-dim hover:text-error hover:bg-error/10 rounded-lg transition-all"
                                    title="Desactivar Movimiento"
                                >
                                    <Trash2 class="w-4 h-4" />
                                </button>
                            </form>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}
</div>

<!-- Modal Premium de Creación/Edición -->
{#if showModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        role="dialog"
        aria-modal="true"
        class="fixed inset-0 bg-dark-bg-main/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
        transition:fade
        onclick={(e) => e.target === e.currentTarget && closeModal()}
    >
        <div 
            class="glass-card-premium w-full max-w-md overflow-hidden p-6 sm:p-8"
            transition:scale={{ start: 0.95, duration: 200 }}
        >
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary/10 rounded-xl text-primary">
                        <Settings2 class="w-5 h-5" />
                    </div>
                    <h2 class="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                        {#if editingItem}
                            Editar {modalType === 'estado' ? 'Estado' : 'Movimiento'}
                        {:else}
                            Nuevo {modalType === 'estado' ? 'Estado' : 'Movimiento'}
                        {/if}
                    </h2>
                </div>
                <button onclick={closeModal} aria-label="Cerrar modal" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                    <X class="w-5 h-5 text-text-dim" />
                </button>
            </div>

            <form 
                use:enhance
                action={modalType === 'estado' 
                    ? (editingItem ? '?/updateEstado' : '?/createEstado') 
                    : (editingItem ? '?/updateMovementType' : '?/createMovementType')}
                method="POST" 
                class="space-y-5"
            >
                {#if formError}
                    <div class="bg-error/10 text-error border border-error/20 p-3 rounded-xl flex items-center gap-2 text-xs font-bold">
                        <AlertCircle class="w-4 h-4 shrink-0" />
                        {formError}
                    </div>
                {/if}

                {#if editingItem}
                    <input type="hidden" name="id" value={modalType === 'estado' ? editingItem.id_estado : editingItem.id_tipo_movimiento} />
                {/if}

                <!-- CAMPOS PARA ESTADO DE TICKETS -->
                {#if modalType === 'estado'}
                    <div class="space-y-2">
                        <label for="nombre" class="text-[10px] font-bold uppercase tracking-widest text-text-dim px-1">Nombre del Estado</label>
                        <input id="nombre" type="text" name="nombre" value={editingItem?.nombre || ''} required placeholder="Ej: En Tránsito, Pausado..." class="input-compact h-12 w-full" />
                    </div>
                    <div class="space-y-2">
                        <label for="color" class="text-[10px] font-bold uppercase tracking-widest text-text-dim px-1">Color Identificador</label>
                        <div class="flex gap-3 items-center">
                            <input id="color" type="color" name="color" value={editingItem?.color || '#3b82f6'} class="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent cursor-pointer" />
                            <span class="text-xs text-text-dim font-mono">{editingItem?.color || '#3b82f6'}</span>
                        </div>
                    </div>

                <!-- CAMPOS PARA TIPOS DE MOVIMIENTOS -->
                {:else}
                    <div class="space-y-2">
                        <label for="tipo_movimiento" class="text-[10px] font-bold uppercase tracking-widest text-text-dim px-1">Nombre del Movimiento</label>
                        <input id="tipo_movimiento" type="text" name="tipo_movimiento" value={editingItem?.tipo_movimiento || ''} required placeholder="Ej: Envío a Taller, Retorno..." class="input-compact h-12 w-full" />
                    </div>
                    <div class="space-y-2">
                        <label for="codigo" class="text-[10px] font-bold uppercase tracking-widest text-text-dim px-1">Código del Movimiento (Opcional)</label>
                        <input id="codigo" type="text" name="codigo" value={editingItem?.codigo || ''} placeholder="Ej: TALLER_OUT, RET_IN" class="input-compact h-12 w-full" />
                    </div>
                {/if}

                <!-- Campo de Activación Lógica en edición -->
                {#if editingItem}
                    <div class="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                        <label class="flex items-center gap-3 cursor-pointer group">
                            <input type="checkbox" name="estado" value="true" checked={editingItem.estado} class="w-4 h-4 rounded border-primary/20 text-primary focus:ring-primary transition-all" />
                            <span class="text-xs font-bold text-text-main dark:text-dark-text-main uppercase tracking-tight group-hover:text-primary transition-colors">Registro Operativo / Activo</span>
                        </label>
                    </div>
                {/if}

                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" onclick={closeModal} class="px-6 py-2 text-xs font-bold uppercase tracking-widest text-text-dim hover:text-text-main transition-colors focus:outline-none">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-primary px-8">
                        {editingItem ? 'Guardar Ajustes' : 'Registrar'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob { animation: blob 10s infinite alternate ease-in-out; }
    .animation-delay-4000 { animation-delay: 4s; }

    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in-up { animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
</style>
