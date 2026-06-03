<script lang="ts">
    import { MapPin, Plus, Edit2, Trash2, Search, Check, X, ChevronLeft, ChevronRight } from 'lucide-svelte';
    import { fade, slide } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import { confirmState } from '$lib/state/confirm.svelte';
    import { toast } from '$lib/state/toast.svelte';

    let { data, form } = $props();

    let lastProcessedForm: any = null;
    $effect(() => {
        if (form && form !== lastProcessedForm) {
            lastProcessedForm = form;
            if (form.success) {
                toast.success(form.message || '¡Sucursal guardada correctamente!');
            } else if (form.error) {
                toast.error(form.error);
            }
        }
    });
    
    let searchQuery = $state('');
    let isCreating = $state(false);
    let editingId = $state<number | null>(null);
    let editNombre = $state('');

    // Paginación
    let currentPage = $state(1);
    let itemsPerPage = $state(5);

    const filteredSucursales = $derived(
        data.sucursales.filter(s => 
            s.nombre.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const totalPages = $derived(Math.ceil(filteredSucursales.length / itemsPerPage));
    const paginatedSucursales = $derived(
        filteredSucursales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );

    // Resetear página cuando cambia la búsqueda
    $effect(() => {
        if (searchQuery) currentPage = 1;
    });

    const startEdit = (sucursal: any) => {
        editingId = sucursal.id_sucursal;
        editNombre = sucursal.nombre;
    };

    const cancelEdit = () => {
        editingId = null;
        editNombre = '';
    };
</script>

<svelte:head>
    <title>Sucursales - TicketFlow TI</title>
</svelte:head>

<div class="space-y-6 animate-fade-in-up">
    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <MapPin class="w-4 h-4 text-primary" />
                <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Catálogos</span>
            </div>
            <h1 class="text-2xl font-bold text-text-main dark:text-dark-text-main tracking-tight">Sedes y Sucursales</h1>
            <p class="text-xs text-text-dim dark:text-dark-text-dim font-medium">Gestión de ubicaciones físicas del sistema.</p>
        </div>

        <button 
            onclick={() => isCreating = !isCreating}
            aria-expanded={isCreating}
            class="btn-primary flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
            <Plus class="w-4 h-4" />
            <span class="uppercase tracking-tighter text-xs">Nueva Sucursal</span>
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
                            if (result.type === 'success') {
                                isCreating = false;
                            }
                        };
                    }} 
                    action="?/create" 
                    method="POST" 
                    class="flex flex-col sm:flex-row gap-4 items-end"
                >
                    <div class="flex-grow space-y-1.5">
                        <label for="nombre" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Nombre Identificador</label>
                        <input 
                            type="text" 
                            id="nombre"
                            name="nombre" 
                            placeholder="Ej: Planta Industrial, Oficinas Centro..."
                            class="input-compact w-full"
                            required
                            minlength="3"
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
                placeholder="Filtrar por nombre de sede..."
                aria-label="Buscar sucursales"
                class="w-full pl-11 pr-4 py-3 glass-card rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
            />
        </div>
    </div>

    <!-- Tabla -->
    <div class="glass-card rounded-lg overflow-hidden border-none shadow-2xl">
        <div class="overflow-x-auto" tabindex="0" aria-label="Tabla de sucursales">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-primary/5 border-b border-white/5">
                        <th scope="col" class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Identificador de Sede</th>
                        <th scope="col" class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Estado Operativo</th>
                        <th scope="col" class="px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    {#each paginatedSucursales as sucursal (sucursal.id_sucursal)}
                        <tr class="group hover:bg-primary/5 transition-colors">
                            <td class="px-6 py-3">
                                {#if editingId === sucursal.id_sucursal}
                                    <form use:enhance={() => {
                                        return async ({ result, update }) => {
                                            await update();
                                            if (result.type === 'success') cancelEdit();
                                        };
                                    }} action="?/update" method="POST" class="flex gap-2 max-w-sm">
                                        <input type="hidden" name="id" value={sucursal.id_sucursal} />
                                        <input type="hidden" name="estado" value={sucursal.estado} />
                                        <input 
                                            type="text" 
                                            name="nombre"
                                            bind:value={editNombre}
                                            aria-label="Nombre de la sucursal"
                                            class="input-compact flex-grow !py-1"
                                        />
                                        <button type="submit" aria-label="Confirmar edición" class="p-1 text-success hover:bg-success/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-success">
                                            <Check class="w-4 h-4 aria-hidden=true" />
                                        </button>
                                        <button type="button" onclick={cancelEdit} aria-label="Cancelar edición" class="p-1 text-error hover:bg-error/10 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-error">
                                            <X class="w-4 h-4 aria-hidden=true" />
                                        </button>
                                    </form>
                                {:else}
                                    <div>
                                        <span class="text-sm font-bold text-text-main dark:text-dark-text-main">{sucursal.nombre}</span>
                                    </div>
                                {/if}
                            </td>
                            <td class="px-6 py-3">
                                <form use:enhance action="?/update" method="POST">
                                    <input type="hidden" name="id" value={sucursal.id_sucursal} />
                                    <input type="hidden" name="nombre" value={sucursal.nombre} />
                                    <input type="hidden" name="estado" value={!sucursal.estado} />
                                    <button 
                                        type="submit"
                                        aria-label={sucursal.estado ? 'Desactivar sucursal' : 'Activar sucursal'}
                                        class="flex items-center gap-2 group/btn focus:outline-none focus:ring-2 focus:ring-primary rounded p-1"
                                    >
                                        <div class="w-2 h-2 rounded-full {sucursal.estado ? 'bg-success' : 'bg-text-dim'} transition-all group-hover/btn:scale-125"></div>
                                        <span class="text-[10px] font-bold uppercase tracking-widest {sucursal.estado ? 'text-success' : 'text-text-dim'}">
                                            {sucursal.estado ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </button>
                                </form>
                            </td>
                            <td class="px-6 py-3 text-right">
                                <div class="flex justify-end gap-1">
                                    <button 
                                        onclick={() => startEdit(sucursal)}
                                        aria-label={`Editar sucursal ${sucursal.nombre}`}
                                        class="p-1.5 text-text-dim hover:text-primary hover:bg-primary/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <Edit2 class="w-4 h-4 aria-hidden=true" />
                                    </button>
                                    <form 
                                        use:enhance 
                                        action="?/delete" 
                                        method="POST" 
                                    >
                                        <input type="hidden" name="id" value={sucursal.id_sucursal} />
                                        <button 
                                            type="button"
                                            onclick={(e) => {
                                                const form = e.currentTarget.closest('form');
                                                if (form) {
                                                    confirmState.ask(
                                                        '¿Eliminar Sucursal?',
                                                        `¿Estás seguro de eliminar permanentemente la sucursal "${sucursal.nombre}"?`,
                                                        () => form.requestSubmit()
                                                    );
                                                }
                                            }}
                                            aria-label={`Eliminar sucursal ${sucursal.nombre}`}
                                            class="p-1.5 text-text-dim hover:text-error hover:bg-error/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-error"
                                        >
                                            <Trash2 class="w-4 h-4 aria-hidden=true" />
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    {/each}
                    
                    {#if filteredSucursales.length === 0}
                        <tr>
                            <td colspan="3" class="px-6 py-12 text-center text-text-dim dark:text-dark-text-dim italic text-sm">
                                No se encontraron registros maestros para esta búsqueda.
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
                        aria-label="Página anterior"
                        class="p-1.5 glass-card rounded-md disabled:opacity-30 hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <ChevronLeft class="w-4 h-4 aria-hidden=true" />
                    </button>
                    <button 
                        disabled={currentPage === totalPages}
                        onclick={() => currentPage++}
                        aria-label="Página siguiente"
                        class="p-1.5 glass-card rounded-md disabled:opacity-30 hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <ChevronRight class="w-4 h-4 aria-hidden=true" />
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
