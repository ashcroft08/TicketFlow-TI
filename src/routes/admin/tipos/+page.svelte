<script lang="ts">
	import { offlineEnhance } from '$lib/client/offlineEnhance';
    import { Layers, Plus, Edit2, Trash2, Search, Check, X, ChevronLeft, ChevronRight, Cpu } from 'lucide-svelte';
    import { slide, fade } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import { confirmState } from '$lib/state/confirm.svelte';
    import { toast } from '$lib/state/toast.svelte';

    let { data, form } = $props();

    let lastProcessedForm: any = null;
    $effect(() => {
        if (form && form !== lastProcessedForm) {
            lastProcessedForm = form;
            if (form.success) {
                toast.success((form as any).message || '¡Tipo de hardware guardado correctamente!');
            } else if (form.error) {
                toast.error((form as any).error);
            }
        }
    });
    
    let searchQuery = $state('');
    let isCreating = $state(false);
    let editingId = $state<number | null>(null);
    let editTipo = $state('');
    let editCodigo = $state('');

    // Creación reactiva del código
    let newTipo = $state('');
    let newCodigo = $state('');
    let isCodeManuallyEdited = $state(false);

    // Paginación
    let currentPage = $state(1);
    let itemsPerPage = $state(8);

    const filteredTipos = $derived(
        data.tipos.filter(t => 
            t.tipo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (t.codigo && t.codigo.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    );

    const totalPages = $derived(Math.ceil(filteredTipos.length / itemsPerPage));
    const paginatedTipos = $derived(
        filteredTipos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );

    // Resetear página cuando cambia la búsqueda
    $effect(() => {
        if (searchQuery) currentPage = 1;
    });

    // Lógica para auto-generar código de identificación
    const generateCode = (name: string): string => {
        if (!name) return '';
        const normalized = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
        const words = normalized.trim().split(/\s+/).filter(w => w.length > 0);
        
        if (words.length > 1) {
            return words.map(w => w[0]).join('').slice(0, 5);
        } else {
            const word = words[0];
            if (word.length <= 3) return word;
            return word.slice(0, 3);
        }
    };

    $effect(() => {
        if (!isCodeManuallyEdited) {
            newCodigo = generateCode(newTipo);
        }
    });

    const resetForm = () => {
        newTipo = '';
        newCodigo = '';
        isCodeManuallyEdited = false;
    };

    $effect(() => {
        if (!isCreating) resetForm();
    });

    const startEdit = (tipo: any) => {
        editingId = tipo.id_tipo;
        editTipo = tipo.tipo;
        editCodigo = tipo.codigo || '';
    };

    const cancelEdit = () => {
        editingId = null;
        editTipo = '';
        editCodigo = '';
    };
</script>

<svelte:head>
    <title>Tipos de Artículos - TicketFlow TI</title>
</svelte:head>

<div class="space-y-6 animate-fade-in-up">
    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <Layers class="w-4 h-4 text-primary" />
                <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Catálogos Maestros</span>
            </div>
            <h1 class="text-2xl font-bold text-text-main dark:text-dark-text-main tracking-tight">Tipos de Artículos</h1>
            <p class="text-xs text-text-dim dark:text-dark-text-dim font-medium">Clasificación principal para hardware y periféricos (ej: Laptop, Impresora, Lector).</p>
        </div>

        <button 
            onclick={() => isCreating = !isCreating}
            aria-expanded={isCreating}
            class="btn-primary flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
            <Plus class="w-4 h-4" />
            <span class="uppercase tracking-tighter text-xs">Nuevo Tipo</span>
        </button>
    </header>

    <!-- Buscador y Formulario de Creación -->
    <div class="space-y-4">
        {#if isCreating}
            <div transition:slide class="glass-card p-6 rounded-lg border-primary/20 shadow-2xl shadow-primary/10">
                <form 
                    use:offlineEnhance={() => {
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
                        <label for="tipo" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Nombre del Tipo *</label>
                        <input 
                            type="text" 
                            id="tipo"
                            name="tipo" 
                            bind:value={newTipo}
                            placeholder="Ej: Laptop, Monitor, Impresora, Switch..."
                            class="input-compact w-full"
                            required
                            minlength="2"
                        />
                    </div>
                    <div class="w-full sm:w-48 space-y-1.5">
                        <label for="codigo" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Código de Identificación</label>
                        <input 
                            type="text" 
                            id="codigo"
                            name="codigo" 
                            bind:value={newCodigo}
                            oninput={() => isCodeManuallyEdited = true}
                            placeholder="Ej: LAP, MON, IMP"
                            class="input-compact w-full"
                        />
                    </div>
                    <div class="flex gap-2">
                        <button type="button" onclick={() => isCreating = false} class="px-5 py-2 text-xs font-bold uppercase tracking-widest text-text-dim hover:text-text-main transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-lg">
                            Cancelar
                        </button>
                        <button type="submit" class="btn-primary px-8 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
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
                placeholder="Filtrar por nombre de tipo o código..."
                aria-label="Buscar tipos de artículos"
                class="w-full pl-11 pr-4 py-3 glass-card rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
        </div>
    </div>

    <!-- Tabla -->
    <div class="glass-card rounded-lg overflow-hidden border-none shadow-2xl">
        <div class="overflow-x-auto" tabindex="0" aria-label="Tabla de tipos de artículos">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-primary/5 border-b border-white/5">
                        <th scope="col" class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Tipo de Artículo</th>
                        <th scope="col" class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Código / Prefijo</th>
                        <th scope="col" class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    {#each paginatedTipos as tipo (tipo.id_tipo)}
                        <tr class="group hover:bg-primary/5 transition-colors">
                            <td class="px-6 py-3">
                                {#if editingId === tipo.id_tipo}
                                    <form use:offlineEnhance={() => {
                                        return async ({ result, update }) => {
                                            await update();
                                            if (result.type === 'success') cancelEdit();
                                        };
                                    }} action="?/update" method="POST" class="flex gap-3 max-w-md items-center">
                                        <input type="hidden" name="id" value={tipo.id_tipo} />
                                        <input 
                                            type="text" 
                                            name="tipo"
                                            bind:value={editTipo}
                                            aria-label="Nombre del tipo"
                                            class="input-compact flex-grow !py-1"
                                            required
                                        />
                                        <input 
                                            type="text" 
                                            name="codigo"
                                            bind:value={editCodigo}
                                            placeholder="Código"
                                            aria-label="Código del tipo"
                                            class="input-compact w-28 !py-1"
                                        />
                                        <button type="submit" aria-label="Confirmar edición" class="p-1 text-success hover:bg-success/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-success">
                                            <Check class="w-4 h-4" />
                                        </button>
                                        <button type="button" onclick={cancelEdit} aria-label="Cancelar edición" class="p-1 text-error hover:bg-error/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-error">
                                            <X class="w-4 h-4" />
                                        </button>
                                    </form>
                                {:else}
                                    <div>
                                        <span class="text-sm font-bold text-text-main dark:text-dark-text-main">{tipo.tipo}</span>
                                    </div>
                                {/if}
                            </td>
                            <td class="px-6 py-3">
                                {#if editingId !== tipo.id_tipo}
                                    {#if tipo.codigo}
                                        <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                                            {tipo.codigo}
                                        </span>
                                    {:else}
                                        <span class="text-[10px] text-text-dim italic">Sin código asignado</span>
                                    {/if}
                                {/if}
                            </td>
                            <td class="px-6 py-3 text-right">
                                <div class="flex justify-end gap-1">
                                    <button 
                                        onclick={() => startEdit(tipo)}
                                        aria-label={`Editar tipo ${tipo.tipo}`}
                                        class="p-1.5 text-text-dim hover:text-primary hover:bg-primary/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <Edit2 class="w-4 h-4" />
                                    </button>
                                    <form 
                                        use:offlineEnhance 
                                        action="?/delete" 
                                        method="POST" 
                                    >
                                        <input type="hidden" name="id" value={tipo.id_tipo} />
                                        <button 
                                            type="button"
                                            onclick={(e) => {
                                                const form = e.currentTarget.closest('form');
                                                if (form) {
                                                    confirmState.ask(
                                                        '¿Eliminar Tipo de Equipo?',
                                                        `¿Estás seguro de eliminar permanentemente el tipo "${tipo.tipo}"?`,
                                                        () => form.requestSubmit()
                                                    );
                                                }
                                            }}
                                            aria-label={`Eliminar tipo ${tipo.tipo}`}
                                            class="p-1.5 text-text-dim hover:text-error hover:bg-error/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-error"
                                        >
                                            <Trash2 class="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    {/each}
                    
                    {#if filteredTipos.length === 0}
                        <tr>
                            <td colspan="3" class="px-6 py-12 text-center text-text-dim dark:text-dark-text-dim italic text-sm">
                                No se encontraron tipos de artículos.
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
                    Página {currentPage} de {totalPages} ({filteredTipos.length} tipos en total)
                </span>
                <div class="flex gap-2">
                    <button 
                        disabled={currentPage === 1}
                        onclick={() => currentPage--}
                        aria-label="Página anterior"
                        class="p-1.5 glass-card rounded-md disabled:opacity-30 hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <ChevronLeft class="w-4 h-4" />
                    </button>
                    <button 
                        disabled={currentPage === totalPages}
                        onclick={() => currentPage++}
                        aria-label="Página siguiente"
                        class="p-1.5 glass-card rounded-md disabled:opacity-30 hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary"
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
