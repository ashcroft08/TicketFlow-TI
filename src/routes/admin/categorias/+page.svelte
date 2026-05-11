<script lang="ts">
    import { Tags, Plus, Edit2, Trash2, Search, Check, X, Activity, ChevronLeft, ChevronRight } from 'lucide-svelte';
    import { slide, fade } from 'svelte/transition';
    import { enhance } from '$app/forms';

    let { data } = $props();
    
    let searchQuery = $state('');
    let isCreating = $state(false);
    let editingId = $state<number | null>(null);
    let editNombre = $state('');

    // Paginación
    let currentPage = $state(1);
    let itemsPerPage = $state(5);

    const filteredCategorias = $derived(
        data.categorias.filter(c => 
            c.nombre_tecnico.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const totalPages = $derived(Math.ceil(filteredCategorias.length / itemsPerPage));
    const paginatedCategorias = $derived(
        filteredCategorias.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );

    // Resetear página cuando cambia la búsqueda
    $effect(() => {
        if (searchQuery) currentPage = 1;
    });

    const startEdit = (cat: any) => {
        editingId = cat.id_categoria;
        editNombre = cat.nombre_tecnico;
    };

    const cancelEdit = () => {
        editingId = null;
        editNombre = '';
    };
</script>

<svelte:head>
    <title>Categorías - TicketFlow TI</title>
</svelte:head>

<div class="space-y-6 animate-fade-in-up">
    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <Tags class="w-4 h-4 text-primary" />
                <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Catálogos Técnicos</span>
            </div>
            <h1 class="text-2xl font-bold text-text-main dark:text-dark-text-main tracking-tight">Categorías de Incidencias</h1>
            <p class="text-xs text-text-dim dark:text-dark-text-dim font-medium">Clasificación para el enrutamiento inteligente de tickets.</p>
        </div>

        <button 
            onclick={() => isCreating = !isCreating}
            class="btn-primary flex items-center gap-2"
        >
            <Plus class="w-4 h-4" />
            <span class="uppercase tracking-tighter text-xs">Nueva Clasificación</span>
        </button>
    </header>

    <!-- Buscador y Formulario de Creación -->
    <div class="space-y-4">
        {#if isCreating}
            <div transition:slide class="glass-card p-6 rounded-lg border-primary/20 shadow-2xl shadow-primary/10">
                <form 
                    use:enhance={() => {
                        return async ({ result, update }) => {
                            await update();
                            if (result.type === 'success') isCreating = false;
                        };
                    }} 
                    action="?/create" 
                    method="POST" 
                    class="flex flex-col sm:flex-row gap-4 items-end"
                >
                    <div class="flex-grow space-y-1.5">
                        <label for="nombre" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Nombre de la Categoría</label>
                        <input 
                            type="text" 
                            id="nombre"
                            name="nombre" 
                            placeholder="Ej: Fallo de Red, Software ERP, Hardware..."
                            class="input-compact w-full"
                            required
                            minlength="3"
                        />
                    </div>
                    <div class="flex gap-2">
                        <button type="button" onclick={() => isCreating = false} class="px-5 py-2 text-xs font-bold uppercase tracking-widest text-text-dim hover:text-text-main transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" class="btn-primary px-8">
                            Confirmar
                        </button>
                    </div>
                </form>
            </div>
        {/if}

        <div class="relative group">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-primary transition-colors" />
            <input 
                type="text" 
                bind:value={searchQuery}
                placeholder="Filtrar por nombre técnico..."
                class="w-full pl-11 pr-4 py-3 glass-card rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
        </div>
    </div>

    <!-- Tabla -->
    <div class="glass-card rounded-lg overflow-hidden border-none shadow-2xl">
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-primary/5 border-b border-white/5">
                        <th class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Nombre Técnico</th>
                        <th class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Estado del Filtro</th>
                        <th class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    {#each paginatedCategorias as cat (cat.id_categoria)}
                        <tr class="group hover:bg-primary/5 transition-colors">
                            <td class="px-6 py-3">
                                {#if editingId === cat.id_categoria}
                                    <form use:enhance={() => {
                                        return async ({ result, update }) => {
                                            await update();
                                            if (result.type === 'success') cancelEdit();
                                        };
                                    }} action="?/update" method="POST" class="flex gap-2 max-w-sm">
                                        <input type="hidden" name="id" value={cat.id_categoria} />
                                        <input type="hidden" name="estado" value={cat.estado} />
                                        <input 
                                            type="text" 
                                            name="nombre"
                                            bind:value={editNombre}
                                            class="input-compact flex-grow !py-1"
                                        />
                                        <button type="submit" class="p-1 text-success hover:bg-success/10 rounded transition-colors">
                                            <Check class="w-4 h-4" />
                                        </button>
                                        <button type="button" onclick={cancelEdit} class="p-1 text-error hover:bg-error/10 rounded transition-colors">
                                            <X class="w-4 h-4" />
                                        </button>
                                    </form>
                                {:else}
                                    <div class="flex items-center gap-3">
                                        <div class="p-2 bg-primary/5 rounded-lg text-primary/50 group-hover:text-primary transition-colors">
                                            <Activity class="w-4 h-4" />
                                        </div>
                                        <span class="text-sm font-bold text-text-main dark:text-dark-text-main">{cat.nombre_tecnico}</span>
                                    </div>
                                {/if}
                            </td>
                            <td class="px-6 py-3">
                                <form use:enhance action="?/update" method="POST">
                                    <input type="hidden" name="id" value={cat.id_categoria} />
                                    <input type="hidden" name="nombre" value={cat.nombre_tecnico} />
                                    <input type="hidden" name="estado" value={!cat.estado} />
                                    <button 
                                        type="submit"
                                        class="flex items-center gap-2 group/btn"
                                    >
                                        <div class="w-2 h-2 rounded-full {cat.estado ? 'bg-success' : 'bg-text-dim'} transition-all group-hover/btn:scale-125"></div>
                                        <span class="text-[10px] font-bold uppercase tracking-widest {cat.estado ? 'text-success' : 'text-text-dim'}">
                                            {cat.estado ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </button>
                                </form>
                            </td>
                            <td class="px-6 py-3 text-right">
                                <div class="flex justify-end gap-1">
                                    <button 
                                        onclick={() => startEdit(cat)}
                                        class="p-1.5 text-text-dim hover:text-primary hover:bg-primary/10 rounded-md transition-all"
                                    >
                                        <Edit2 class="w-4 h-4" />
                                    </button>
                                    <form 
                                        use:enhance={({ cancel }) => {
                                            if (!confirm('¿Eliminar esta categoría permanentemente?')) return cancel();
                                        }} 
                                        action="?/delete" 
                                        method="POST" 
                                    >
                                        <input type="hidden" name="id" value={cat.id_categoria} />
                                        <button 
                                            type="submit"
                                            class="p-1.5 text-text-dim hover:text-error hover:bg-error/10 rounded-md transition-all"
                                        >
                                            <Trash2 class="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    {/each}
                    
                    {#if filteredCategorias.length === 0}
                        <tr>
                            <td colspan="3" class="px-6 py-12 text-center text-text-dim dark:text-dark-text-dim italic text-sm">
                                No se encontraron categorías que coincidan con la búsqueda.
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
                    Página {currentPage} de {totalPages}
                </span>
                <div class="flex gap-2">
                    <button 
                        disabled={currentPage === 1}
                        onclick={() => currentPage--}
                        class="p-1.5 glass-card rounded-md disabled:opacity-30 hover:text-primary transition-all shadow-sm"
                    >
                        <ChevronLeft class="w-4 h-4" />
                    </button>
                    <button 
                        disabled={currentPage === totalPages}
                        onclick={() => currentPage++}
                        class="p-1.5 glass-card rounded-md disabled:opacity-30 hover:text-primary transition-all shadow-sm"
                    >
                        <ChevronRight class="w-4 h-4" />
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>

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
