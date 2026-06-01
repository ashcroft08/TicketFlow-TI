<script lang="ts">
    import { Package, Plus, Edit2, Trash2, Search, Check, X, ChevronLeft, ChevronRight, Layers, Tag, Cpu, Monitor } from 'lucide-svelte';
    import { slide, fade, scale } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import { confirmState } from '$lib/state/confirm.svelte';
    import { toast } from '$lib/state/toast.svelte';

    let { data, form } = $props();

    let lastProcessedForm: any = null;
    $effect(() => {
        if (form && form !== lastProcessedForm) {
            lastProcessedForm = form;
            if (form.success) {
                toast.success((form as any).message || '¡Modelo del catálogo guardado correctamente!');
            } else if (form.error) {
                toast.error((form as any).error);
            }
        }
    });
    
    // --- Estado del Catálogo ---
    let searchQuery = $state('');
    let showModal = $state(false);
    let editingItem = $state<any>(null);
    let currentPage = $state(1);
    let itemsPerPage = $state(10);



    // Filtrado y paginación del catálogo
    const filteredCatalogos = $derived(
        data.catalogos.filter(c =>
            c.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.marca?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.modelo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.tipo?.tipo?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const totalPages = $derived(Math.ceil(filteredCatalogos.length / itemsPerPage));
    const paginatedCatalogos = $derived(
        filteredCatalogos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );

    $effect(() => {
        if (searchQuery) currentPage = 1;
    });

    // Funciones del catálogo
    const openCreate = () => {
        editingItem = null;
        showModal = true;
    };

    const openEdit = (item: any) => {
        editingItem = item;
        showModal = true;
    };

    const closeModal = () => {
        showModal = false;
        editingItem = null;
    };


</script>

<svelte:head>
    <title>Catálogo de Equipos - TicketFlow TI</title>
</svelte:head>

<div class="space-y-6 animate-fade-in-up">
    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <Package class="w-4 h-4 text-primary" />
                <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Inventario Maestro</span>
            </div>
            <h1 class="text-2xl font-bold text-text-main dark:text-dark-text-main tracking-tight">Catálogo de Equipos</h1>
            <p class="text-xs text-text-dim dark:text-dark-text-dim font-medium">Modelos y tipos de artículos disponibles para registrar activos.</p>
        </div>

        <div class="flex gap-2">

            <button 
                onclick={openCreate}
                class="btn-primary flex items-center gap-2"
            >
                <Plus class="w-4 h-4" />
                <span class="uppercase tracking-tighter text-xs">Nuevo Modelo</span>
            </button>
        </div>
    </header>



    <!-- Buscador -->
    <div class="relative group">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-primary transition-colors" />
        <input 
            type="text" 
            bind:value={searchQuery}
            placeholder="Buscar por nombre, marca, modelo o tipo..."
            aria-label="Buscar en el catálogo"
            class="w-full pl-11 pr-4 py-3 glass-card rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
        />
    </div>

    <!-- Tabla del Catálogo -->
    <div class="glass-card rounded-lg overflow-hidden border-none shadow-2xl">
        <div class="overflow-x-auto" tabindex="0" aria-label="Tabla de catálogo de equipos">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-primary/5 border-b border-white/5">
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Equipo / Modelo</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Marca</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Tipo</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    {#each paginatedCatalogos as item (item.id_catalogo)}
                        <tr class="group hover:bg-primary/5 transition-colors">
                            <td class="px-5 py-3">
                                <div class="flex items-center gap-3">
                                    <div class="p-2 bg-primary/5 rounded-lg text-primary/50 group-hover:text-primary transition-colors">
                                        <Monitor class="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p class="text-sm font-bold text-text-main dark:text-dark-text-main leading-none mb-1">{item.nombre}</p>
                                        {#if item.modelo}
                                            <p class="text-[9px] uppercase tracking-widest text-text-dim font-medium">{item.modelo}</p>
                                        {/if}
                                    </div>
                                </div>
                            </td>
                            <td class="px-5 py-3">
                                {#if item.marca}
                                    <div class="flex items-center gap-1.5">
                                        <Tag class="w-3 h-3 text-text-dim opacity-50" />
                                        <span class="text-xs font-medium text-text-main dark:text-dark-text-main">{item.marca}</span>
                                    </div>
                                {:else}
                                    <span class="text-[10px] text-text-dim italic">Sin marca</span>
                                {/if}
                            </td>
                            <td class="px-5 py-3">
                                {#if item.tipo}
                                    <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                                        {item.tipo.tipo}
                                    </span>
                                {:else}
                                    <span class="text-[10px] text-text-dim italic">Sin tipo</span>
                                {/if}
                            </td>
                            <td class="px-5 py-3 text-right">
                                <div class="flex justify-end gap-1">
                                    <button onclick={() => openEdit(item)} aria-label={`Editar ${item.nombre}`} class="p-1.5 text-text-dim hover:text-primary hover:bg-primary/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary">
                                        <Edit2 class="w-4 h-4" />
                                    </button>
                                    <form
                                        use:enhance
                                        action="?/deleteItem"
                                        method="POST"
                                    >
                                        <input type="hidden" name="id" value={item.id_catalogo} />
                                        <button 
                                            type="button" 
                                            onclick={(e) => {
                                                const form = e.currentTarget.closest('form');
                                                if (form) {
                                                    confirmState.ask(
                                                        '¿Eliminar Modelo de Catálogo?',
                                                        `¿Estás seguro de eliminar "${item.nombre}" del catálogo permanentemente?`,
                                                        () => form.requestSubmit()
                                                    );
                                                }
                                            }}
                                            aria-label={`Eliminar ${item.nombre}`} 
                                            class="p-1.5 text-text-dim hover:text-error hover:bg-error/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-error"
                                        >
                                            <Trash2 class="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    {/each}

                    {#if filteredCatalogos.length === 0}
                        <tr>
                            <td colspan="4" class="px-6 py-12 text-center text-text-dim italic text-sm">
                                No hay modelos en el catálogo. Crea uno para poder registrar activos.
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>

        <!-- Footer con Paginación -->
        {#if totalPages > 1}
            <div class="px-6 py-4 bg-primary/5 border-t border-white/5 flex items-center justify-between">
                <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim">
                    Página {currentPage} de {totalPages} ({filteredCatalogos.length} modelos en total)
                </span>
                <div class="flex gap-2">
                    <button 
                        disabled={currentPage === 1}
                        onclick={() => currentPage--}
                        aria-label="Página anterior"
                        class="p-1.5 glass-card rounded-md disabled:opacity-30 hover:text-primary transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <ChevronLeft class="w-4 h-4" />
                    </button>
                    <button 
                        disabled={currentPage === totalPages}
                        onclick={() => currentPage++}
                        aria-label="Página siguiente"
                        class="p-1.5 glass-card rounded-md disabled:opacity-30 hover:text-primary transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <ChevronRight class="w-4 h-4" />
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>

<!-- Modal Crear/Editar Artículo del Catálogo -->
{#if showModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-catalogo-title"
        class="fixed inset-0 bg-dark-bg-main/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
        transition:fade
        onclick={(e) => e.target === e.currentTarget && closeModal()}
    >
        <div 
            class="glass-card w-full max-w-lg rounded-xl shadow-2xl overflow-hidden border border-white/10"
            transition:scale={{ start: 0.95, duration: 200 }}
        >
            <div class="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-primary/5">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary/10 rounded-lg text-primary">
                        <Package class="w-5 h-5" />
                    </div>
                    <h2 id="modal-catalogo-title" class="text-lg font-bold text-text-main dark:text-dark-text-main uppercase tracking-tight">
                        {editingItem ? 'Editar Modelo' : 'Nuevo Modelo de Equipo'}
                    </h2>
                </div>
                <button onclick={closeModal} aria-label="Cerrar modal" class="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
                    <X class="w-5 h-5 text-text-dim" />
                </button>
            </div>

            <form 
                use:enhance={() => {
                    return async ({ result, update }) => {
                        await update();
                        if (result.type === 'success') closeModal();
                    };
                }} 
                action={editingItem ? '?/updateItem' : '?/createItem'} 
                method="POST" 
                class="p-8 space-y-5"
            >
                {#if editingItem}
                    <input type="hidden" name="id" value={editingItem.id_catalogo} />
                {/if}

                <div class="space-y-1.5">
                    <label for="cat_nombre" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Nombre del Equipo *</label>
                    <input 
                        id="cat_nombre" 
                        type="text" 
                        name="nombre" 
                        value={editingItem?.nombre || ''} 
                        placeholder="Ej: HP LaserJet Pro M404n" 
                        class="input-compact w-full" 
                        required 
                        minlength="2"
                    />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                        <label for="cat_marca" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Marca</label>
                        <input 
                            id="cat_marca" 
                            type="text" 
                            name="marca" 
                            value={editingItem?.marca || ''} 
                            placeholder="Ej: HP, Dell, Lenovo" 
                            class="input-compact w-full"
                        />
                    </div>

                    <div class="space-y-1.5">
                        <label for="cat_modelo" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Modelo</label>
                        <input 
                            id="cat_modelo" 
                            type="text" 
                            name="modelo" 
                            value={editingItem?.modelo || ''} 
                            placeholder="Ej: M404n, Latitude 5530" 
                            class="input-compact w-full"
                        />
                    </div>
                </div>

                <div class="space-y-1.5">
                    <label for="cat_tipo" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Tipo de Artículo</label>
                    <select id="cat_tipo" name="id_tipo" class="input-compact w-full">
                        <option value="">Sin clasificar</option>
                        {#each data.tipos as tipo}
                            <option value={tipo.id_tipo} selected={editingItem?.id_tipo === tipo.id_tipo}>
                                {tipo.tipo} {tipo.codigo ? `(${tipo.codigo})` : ''}
                            </option>
                        {/each}
                    </select>
                </div>

                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" onclick={closeModal} class="px-6 py-2 text-xs font-bold uppercase tracking-widest text-text-dim hover:text-text-main transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-lg">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-primary px-8 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        {editingItem ? 'Actualizar' : 'Crear Modelo'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    @reference "../../layout.css";

    .animate-fade-in-up {
        animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
</style>
