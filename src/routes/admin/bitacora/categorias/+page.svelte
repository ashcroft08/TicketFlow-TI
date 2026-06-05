<script lang="ts">
	import { offlineEnhance } from '$lib/client/offlineEnhance';
    import { ChevronLeft, Plus, Edit2, Trash2, Tag, ArrowRight, X, AlertCircle } from 'lucide-svelte';
    import { fade, scale, slide } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import { confirmState } from '$lib/state/confirm.svelte';
    import { toast } from '$lib/state/toast.svelte';

    let { data, form } = $props();

    // Estado del CRUD
    let editingCategory = $state<any>(null);
    let nombre = $state('');
    let estado = $state(true);

    // Toast de resultado de acciones
    let lastProcessedForm: any = null;
    $effect(() => {
        if (form && form !== lastProcessedForm) {
            lastProcessedForm = form;
            if (form.success) {
                toast.success(form.message || '¡Cambios aplicados con éxito!');
                resetForm();
            } else if (form.error) {
                toast.error(form.error);
            }
        }
    });

    const resetForm = () => {
        editingCategory = null;
        nombre = '';
        estado = true;
    };

    const startEdit = (cat: any) => {
        editingCategory = cat;
        nombre = cat.nombre;
        estado = cat.estado ?? true;
    };

    const confirmDelete = (e: MouseEvent, id: number, nombreCat: string) => {
        e.preventDefault();
        confirmState.ask(
            '¿Eliminar Categoría?',
            `¿Estás seguro de que deseas eliminar la categoría "${nombreCat}"? Esto no afectará los registros históricos de bitácora, pero ya no estará disponible para nuevas actividades.`,
            async () => {
                const formData = new FormData();
                formData.append('id', id.toString());

                try {
                    const response = await fetch('?/delete', {
                        method: 'POST',
                        body: formData
                    });
                    
                    toast.success('Categoría eliminada con éxito');
                    window.location.reload();
                } catch (err) {
                    toast.error('Ocurrió un error al eliminar la categoría');
                }
            }
        );
    };
</script>

<svelte:head>
    <title>Categorías de Bitácora - TicketFlow TI</title>
</svelte:head>

<div class="space-y-6 animate-fade-in-up relative">
    <!-- Orbes decorativos flotantes -->
    <div class="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-[80px] pointer-events-none animate-blob"></div>

    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <a href="/admin/bitacora" class="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-primary hover:underline transition-all">
                    <ChevronLeft class="w-3.5 h-3.5" /> Volver a Bitácora
                </a>
            </div>
            <h1 class="text-2xl font-bold text-text-main dark:text-dark-text-main tracking-tight">Categorías de Actividades</h1>
            <p class="text-xs text-text-dim dark:text-dark-text-dim font-medium">Administra el catálogo de clasificaciones de tareas para el equipo de TI.</p>
        </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        <!-- Panel Izquierdo: Formulario de Creación / Edición -->
        <div class="lg:col-span-1 glass-card p-6 rounded-xl border border-white/5 shadow-xl relative overflow-hidden">
            <div class="flex items-center justify-between mb-4 pb-3 border-b border-white/5">
                <div class="flex items-center gap-2">
                    <Tag class="w-4 h-4 text-primary" />
                    <h2 class="text-sm font-bold text-text-main dark:text-dark-text-main">
                        {editingCategory ? 'Modificar Categoría' : 'Nueva Categoría'}
                    </h2>
                </div>
                {#if editingCategory}
                    <button 
                        type="button" 
                        onclick={resetForm}
                        class="text-text-dim hover:text-text-main dark:hover:text-dark-text-main transition-colors p-1"
                        title="Cancelar edición"
                    >
                        <X class="w-4 h-4" />
                    </button>
                {/if}
            </div>

            <form 
                action={editingCategory ? '?/update' : '?/create'} 
                method="POST" 
                use:offlineEnhance
                class="space-y-4"
            >
                {#if editingCategory}
                    <input type="hidden" name="id" value={editingCategory.id_categoria_bitacora} />
                {/if}

                <div class="space-y-1.5">
                    <label for="nombre" class="text-xs font-bold text-text-main dark:text-dark-text-main uppercase tracking-wider">Nombre de Categoría</label>
                    <input 
                        id="nombre"
                        name="nombre"
                        type="text"
                        placeholder="Ej. Soporte Red, Mantenimiento..."
                        bind:value={nombre}
                        required
                        class="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-text-main dark:text-dark-text-main placeholder-text-dim focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {#if editingCategory}
                    <div class="space-y-1.5">
                        <label for="estado" class="text-xs font-bold text-text-main dark:text-dark-text-main uppercase tracking-wider block">Estado</label>
                        <select 
                            id="estado"
                            name="estado"
                            bind:value={estado}
                            class="w-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-text-main dark:text-dark-text-main focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value={true}>Activo</option>
                            <option value={false}>Inactivo</option>
                        </select>
                    </div>
                {/if}

                {#if form?.error}
                    <div class="p-3 bg-error/10 border border-error/20 rounded-lg flex items-start gap-2 text-xs text-error">
                        <AlertCircle class="w-4 h-4 flex-shrink-0" />
                        <span>{form.error}</span>
                    </div>
                {/if}

                <div class="pt-2 flex gap-2">
                    <button 
                        type="submit" 
                        class="btn-primary w-full flex items-center justify-center gap-2 focus:outline-none uppercase tracking-tighter text-xs"
                    >
                        {#if editingCategory}
                            <span>Guardar Cambios</span>
                        {:else}
                            <Plus class="w-4 h-4" />
                            <span>Crear Categoría</span>
                        {/if}
                    </button>
                    {#if editingCategory}
                        <button 
                            type="button" 
                            onclick={resetForm}
                            class="btn-secondary w-full uppercase tracking-tighter text-xs"
                        >
                            Cancelar
                        </button>
                    {/if}
                </div>
            </form>
        </div>

        <!-- Panel Derecho: Listado de Categorías -->
        <div class="lg:col-span-2 glass-card p-6 rounded-xl border border-white/5 shadow-xl">
            <h2 class="text-sm font-bold text-text-main dark:text-dark-text-main mb-4 pb-3 border-b border-white/5">Catálogo Activo</h2>

            {#if data.categorias.length === 0}
                <div class="flex flex-col items-center justify-center py-12 text-center" in:fade>
                    <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-text-dim mb-3">
                        <Tag class="w-6 h-6" />
                    </div>
                    <h3 class="text-sm font-semibold text-text-main dark:text-dark-text-main">No hay categorías</h3>
                    <p class="text-xs text-text-dim mt-1">Crea tu primera categoría usando el formulario de la izquierda.</p>
                </div>
            {:else}
                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="border-b border-white/5">
                                <th class="pb-3 text-xs font-bold uppercase tracking-wider text-text-dim dark:text-dark-text-dim">Categoría</th>
                                <th class="pb-3 text-xs font-bold uppercase tracking-wider text-text-dim dark:text-dark-text-dim">Estado</th>
                                <th class="pb-3 text-xs font-bold uppercase tracking-wider text-text-dim dark:text-dark-text-dim text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/5">
                            {#each data.categorias as cat (cat.id_categoria_bitacora)}
                                <tr class="hover:bg-white/5 dark:hover:bg-slate-900/50 transition-colors" in:slide>
                                    <td class="py-3.5 pr-3">
                                        <div class="flex items-center gap-2">
                                            <span class="w-2 h-2 rounded-full bg-primary shadow-sm shadow-primary/40"></span>
                                            <span class="text-sm font-semibold text-text-main dark:text-dark-text-main">{cat.nombre}</span>
                                        </div>
                                    </td>
                                    <td class="py-3.5 pr-3">
                                        {#if cat.estado}
                                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success/10 text-success border border-success/20">
                                                Activo
                                            </span>
                                        {:else}
                                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-500/10 text-text-dim border border-slate-500/20">
                                                Inactivo
                                            </span>
                                        {/if}
                                    </td>
                                    <td class="py-3.5 text-right">
                                        <div class="flex items-center justify-end gap-1.5">
                                            <button 
                                                onclick={() => startEdit(cat)}
                                                class="p-1.5 text-text-dim hover:text-primary dark:hover:text-primary transition-all rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                                                title="Editar"
                                            >
                                                <Edit2 class="w-3.5 h-3.5" />
                                            </button>
                                            <button 
                                                onclick={(e) => confirmDelete(e, cat.id_categoria_bitacora, cat.nombre)}
                                                class="p-1.5 text-text-dim hover:text-error dark:hover:text-error transition-all rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                                                title="Eliminar"
                                            >
                                                <Trash2 class="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            {/if}
        </div>

    </div>
</div>
