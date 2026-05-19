<script lang="ts">
    import { Monitor, Plus, Edit2, Trash2, Search, X, Check, MapPin, User as UserIcon, Tag, Hash, Calendar, Info, Activity, ChevronLeft, ChevronRight } from 'lucide-svelte';
    import { fade, slide, scale } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import { confirmState } from '$lib/state/confirm.svelte';
    import { toast } from '$lib/state/toast.svelte';

    let { data, form } = $props();

    let lastProcessedForm: any = null;
    $effect(() => {
        if (form && form !== lastProcessedForm) {
            lastProcessedForm = form;
            if (form.success) {
                toast.success(form.message || '¡Activo de inventario guardado correctamente!');
            } else if (form.error) {
                toast.error(form.error);
            }
        }
    });
    
    let searchQuery = $state('');
    let showModal = $state(false);
    let editingAsset = $state<any>(null);

    // Paginación
    let currentPage = $state(1);
    let itemsPerPage = $state(10);

    const filteredActivos = $derived(
        data.activos.filter(a => 
            a.catalogo?.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.numero_serie?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.codigo_inventario?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.sucursal?.nombre?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const totalPages = $derived(Math.ceil(filteredActivos.length / itemsPerPage));
    const paginatedActivos = $derived(
        filteredActivos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );

    // Resetear página cuando cambia la búsqueda
    $effect(() => {
        if (searchQuery) currentPage = 1;
    });

    // --- Estado reactivo del formulario de activos ---
    let selectedCatalogoId = $state('');
    let selectedSucursalId = $state('');
    let selectedUsuarioId = $state('');
    let numeroSerie = $state('');
    let codigoInventario = $state('');
    let isCodigoManuallyEdited = $state(false);

    // Filtrar usuarios pertenecientes a la sucursal seleccionada
    const filteredUsers = $derived(
        data.users.filter(u => {
            if (!selectedSucursalId) return true;
            return u.id_sucursal?.toString() === selectedSucursalId ||
                   (editingAsset && editingAsset.id_usuario_asignado === u.id_usuario);
        })
    );

    // Resetear el usuario asignado si ya no pertenece a la sucursal seleccionada
    $effect(() => {
        if (selectedUsuarioId && selectedSucursalId) {
            const isUserValid = filteredUsers.some(u => u.id_usuario.toString() === selectedUsuarioId);
            if (!isUserValid) {
                selectedUsuarioId = '';
            }
        }
    });

    // Auto-generación inteligente de código de inventario
    $effect(() => {
        if (!isCodigoManuallyEdited && !editingAsset) {
            const cat = data.catalogos.find(c => c.id_catalogo.toString() === selectedCatalogoId);
            const branch = data.branches.find(b => b.id_sucursal.toString() === selectedSucursalId);
            
            if (cat && branch) {
                // Código del tipo o primeras 3 letras del tipo en mayúsculas
                const tipoCode = cat.tipo?.codigo || cat.tipo?.tipo?.slice(0, 3).toUpperCase() || 'ACT';
                
                // Prefijo limpio de la sucursal (ej: La Concordia -> LAC, Matriz -> MAT)
                const branchName = branch.nombre.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
                const branchWords = branchName.split(/\s+/).filter(w => w.length > 0);
                let branchCode = 'SUC';
                if (branchWords.length > 1) {
                    branchCode = branchWords.map(w => w[0]).join('').slice(0, 3);
                } else if (branchWords[0]) {
                    branchCode = branchWords[0].slice(0, 3);
                }

                // Suffix basado en número de serie o PEND si está vacío
                let suffix = '';
                if (numeroSerie.trim()) {
                    const cleanSerie = numeroSerie.replace(/[^A-Za-z0-9]/g, '');
                    suffix = cleanSerie.slice(-6).toUpperCase();
                } else {
                    suffix = 'PEND';
                }

                codigoInventario = `${tipoCode}-${branchCode}-${suffix}`;
            } else {
                codigoInventario = '';
            }
        }
    });

    const openCreate = () => {
        editingAsset = null;
        selectedCatalogoId = '';
        selectedSucursalId = '';
        selectedUsuarioId = '';
        numeroSerie = '';
        codigoInventario = '';
        isCodigoManuallyEdited = false;
        showModal = true;
    };

    const openEdit = (asset: any) => {
        editingAsset = asset;
        selectedCatalogoId = asset.id_catalogo?.toString() || '';
        selectedSucursalId = asset.id_sucursal?.toString() || '';
        selectedUsuarioId = asset.id_usuario_asignado?.toString() || '';
        numeroSerie = asset.numero_serie || '';
        codigoInventario = asset.codigo_inventario || '';
        isCodigoManuallyEdited = true; // No sobreescribir al editar existentes
        showModal = true;
    };

    const closeModal = () => {
        showModal = false;
        editingAsset = null;
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'activo': return 'bg-success/10 text-success';
            case 'en_reparacion': return 'bg-warning/10 text-warning';
            case 'baja': return 'bg-error/10 text-error';
            case 'bodega': return 'bg-primary/10 text-primary';
            default: return 'bg-text-dim/10 text-text-dim';
        }
    };
</script>

<svelte:head>
    <title>Activos TI - TicketFlow TI</title>
</svelte:head>

<div class="space-y-6 animate-fade-in-up">
    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <Monitor class="w-4 h-4 text-primary" />
                <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Inventario Operativo</span>
            </div>
            <h1 class="text-2xl font-bold text-text-main dark:text-dark-text-main tracking-tight">Activos Tecnológicos</h1>
            <p class="text-xs text-text-dim dark:text-dark-text-dim font-medium">Control de hardware y periféricos de la red.</p>
        </div>

        <button 
            onclick={openCreate}
            class="btn-primary flex items-center gap-2"
        >
            <Plus class="w-4 h-4" />
            <span class="uppercase tracking-tighter text-xs">Registrar Activo</span>
        </button>
    </header>

    <!-- Buscador -->
    <div class="relative group">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-primary transition-colors" />
        <input 
            type="text" 
            bind:value={searchQuery}
            placeholder="Buscar por serie, código, modelo o sede..."
            aria-label="Buscar activos"
            class="w-full pl-11 pr-4 py-3 glass-card rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
        />
    </div>

    <!-- Tabla -->
    <div class="glass-card rounded-lg overflow-hidden border-none shadow-2xl">
        <div class="overflow-x-auto" tabindex="0" aria-label="Tabla de activos tecnológicos">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-primary/5 border-b border-white/5">
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Equipo / Tipo</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Identificación</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Ubicación / Usuario</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Estado</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    {#each paginatedActivos as asset (asset.id_activo)}
                        <tr class="group hover:bg-primary/5 transition-colors">
                            <td class="px-5 py-3">
                                <div class="flex items-center gap-3">
                                    <div class="p-2 bg-primary/5 rounded-lg text-primary/50 group-hover:text-primary transition-colors">
                                        <Monitor class="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p class="text-sm font-bold text-text-main dark:text-dark-text-main leading-none mb-1">{asset.catalogo?.nombre}</p>
                                        <p class="text-[9px] uppercase tracking-widest text-primary font-bold">{asset.catalogo?.tipo?.tipo}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-5 py-3 space-y-1">
                                <div class="flex items-center gap-1.5 text-[10px] font-medium text-text-main dark:text-dark-text-main">
                                    <Hash class="w-3 h-3 text-text-dim" />
                                    {asset.numero_serie || 'S/N'}
                                </div>
                                <div class="flex items-center gap-1.5 text-[9px] text-text-dim font-bold uppercase">
                                    <Tag class="w-3 h-3 opacity-50" />
                                    {asset.codigo_inventario || 'No Cod.'}
                                </div>
                            </td>
                            <td class="px-5 py-3">
                                <div class="space-y-1">
                                    <div class="flex items-center gap-1.5 text-[10px] font-medium text-text-main dark:text-dark-text-main">
                                        <MapPin class="w-3 h-3 text-text-dim" />
                                        {asset.sucursal?.nombre}
                                    </div>
                                    <div class="flex items-center gap-1.5 text-[10px] italic text-text-dim">
                                        <UserIcon class="w-3 h-3 opacity-50" />
                                        {asset.usuario_asignado?.nombre || 'Stock Disponible'}
                                    </div>
                                </div>
                            </td>
                            <td class="px-5 py-3">
                                <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest {getStatusStyles(asset.estado)} border border-current/10">
                                    {asset.estado.replace('_', ' ')}
                                </span>
                            </td>
                            <td class="px-5 py-3 text-right">
                                <div class="flex justify-end gap-1">
                                    <button onclick={() => openEdit(asset)} aria-label={`Editar activo ${asset.catalogo?.nombre}`} class="p-1.5 text-text-dim hover:text-primary hover:bg-primary/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary">
                                        <Edit2 class="w-4 h-4 aria-hidden=true" />
                                    </button>
                                    <form 
                                        use:enhance 
                                        action="?/delete" 
                                        method="POST" 
                                    >
                                        <input type="hidden" name="id" value={asset.id_activo} />
                                        <button 
                                            type="button" 
                                            onclick={(e) => {
                                                const form = e.currentTarget.closest('form');
                                                if (form) {
                                                    confirmState.ask(
                                                        '¿Eliminar Activo de Inventario?',
                                                        `¿Estás seguro de eliminar permanentemente el activo "${asset.codigo_inventario || 'este activo'}" del inventario?`,
                                                        () => form.requestSubmit()
                                                    );
                                                }
                                            }}
                                            aria-label={`Eliminar activo ${asset.catalogo?.nombre}`} 
                                            class="p-1.5 text-text-dim hover:text-error hover:bg-error/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-error"
                                        >
                                            <Trash2 class="w-4 h-4 aria-hidden=true" />
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    {/each}

                    {#if filteredActivos.length === 0}
                        <tr>
                            <td colspan="5" class="px-6 py-12 text-center text-text-dim italic text-sm">
                                No se encontraron activos en el inventario maestro.
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
                    Página {currentPage} de {totalPages} ({filteredActivos.length} activos en total)
                </span>
                <div class="flex gap-2">
                    <button 
                        disabled={currentPage === 1}
                        onclick={() => currentPage--}
                        aria-label="Página anterior"
                        class="p-1.5 glass-card rounded-md disabled:opacity-30 hover:text-primary transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <ChevronLeft class="w-4 h-4 aria-hidden=true" />
                    </button>
                    <button 
                        disabled={currentPage === totalPages}
                        onclick={() => currentPage++}
                        aria-label="Página siguiente"
                        class="p-1.5 glass-card rounded-md disabled:opacity-30 hover:text-primary transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <ChevronRight class="w-4 h-4 aria-hidden=true" />
                    </button>
                </div>
            </div>
        {/if}
    </div>
</div>

<!-- Modal Premium -->
{#if showModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        class="fixed inset-0 bg-dark-bg-main/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
        transition:fade
        onclick={(e) => e.target === e.currentTarget && closeModal()}
    >
        <div 
            class="glass-card w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden border border-white/10"
            transition:scale={{ start: 0.95, duration: 200 }}
        >
            <div class="px-8 py-5 border-b border-white/5 flex justify-between items-center bg-primary/5">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary/10 rounded-lg text-primary">
                        <Monitor class="w-5 h-5" />
                    </div>
                    <h2 id="modal-title" class="text-lg font-bold text-text-main dark:text-dark-text-main uppercase tracking-tight">
                        {editingAsset ? 'Actualizar Activo TI' : 'Registro de Nuevo Activo'}
                    </h2>
                </div>
                <button onclick={closeModal} aria-label="Cerrar modal" class="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
                    <X class="w-5 h-5 text-text-dim aria-hidden=true" />
                </button>
            </div>

            <form 
                use:enhance={() => {
                    return async ({ result, update }) => {
                        await update();
                        if (result.type === 'success') closeModal();
                    };
                }} 
                action={editingAsset ? '?/update' : '?/create'} 
                method="POST" 
                class="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar"
            >
                {#if editingAsset}
                    <input type="hidden" name="id" value={editingAsset.id_activo} />
                {/if}

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div class="space-y-1.5">
                        <label for="id_catalogo" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Modelo de Equipo</label>
                        <select id="id_catalogo" name="id_catalogo" bind:value={selectedCatalogoId} required class="input-compact w-full">
                            <option value="">Seleccionar del catálogo...</option>
                            {#each data.catalogos as cat}
                                <option value={cat.id_catalogo.toString()}>
                                    {cat.nombre} ({cat.tipo?.tipo})
                                </option>
                            {/each}
                        </select>
                    </div>

                    <div class="space-y-1.5">
                        <label for="id_sucursal" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Ubicación / Sede</label>
                        <select id="id_sucursal" name="id_sucursal" bind:value={selectedSucursalId} required class="input-compact w-full">
                            <option value="">Asignar a sucursal...</option>
                            {#each data.branches as branch}
                                <option value={branch.id_sucursal.toString()}>{branch.nombre}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="space-y-1.5">
                        <label for="numero_serie" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Número de Serie</label>
                        <div class="relative">
                            <Hash class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim opacity-50" />
                            <input id="numero_serie" type="text" name="numero_serie" bind:value={numeroSerie} placeholder="Ej: S/N 123456" class="input-compact w-full pl-10" />
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label for="codigo_inventario" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Código de Inventario</label>
                        <div class="relative">
                            <Tag class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim opacity-50" />
                            <input 
                                id="codigo_inventario" 
                                type="text" 
                                name="codigo_inventario" 
                                bind:value={codigoInventario} 
                                oninput={() => isCodigoManuallyEdited = true}
                                placeholder="Ej: ACT-001" 
                                class="input-compact w-full pl-10" 
                            />
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label for="estado" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Estado de Operación</label>
                        <select id="estado" name="estado" class="input-compact w-full">
                            <option value="activo" selected={editingAsset?.estado === 'activo'}>Activo / Operacional</option>
                            <option value="bodega" selected={editingAsset?.estado === 'bodega'}>En Bodega / Stock</option>
                            <option value="en_reparacion" selected={editingAsset?.estado === 'en_reparacion'}>En Servicio Técnico</option>
                            <option value="baja" selected={editingAsset?.estado === 'baja'}>Fuera de Servicio (Baja)</option>
                        </select>
                    </div>

                    <div class="space-y-1.5">
                        <label for="id_usuario_asignado" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Usuario Responsable</label>
                        <select id="id_usuario_asignado" name="id_usuario_asignado" bind:value={selectedUsuarioId} class="input-compact w-full">
                            <option value="">Sin asignar (Disponible)</option>
                            {#each filteredUsers as user}
                                <option value={user.id_usuario.toString()}>{user.nombre}</option>
                            {/each}
                        </select>
                    </div>

                    <div class="space-y-1.5">
                        <label for="fecha_adquisicion" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Fecha de Ingreso</label>
                        <div class="relative">
                            <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim opacity-50" />
                            <input id="fecha_adquisicion" type="date" name="fecha_adquisicion" value={editingAsset?.fecha_adquisicion || ''} class="input-compact w-full pl-10" />
                        </div>
                    </div>
                </div>

                <div class="space-y-1.5">
                    <label for="observaciones" class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim px-1">Especificaciones / Notas Técnicas</label>
                    <div class="relative">
                        <Info class="absolute left-3 top-3 w-4 h-4 text-text-dim opacity-50" />
                        <textarea id="observaciones" name="observaciones" value={editingAsset?.observaciones || ''} rows="3" class="input-compact w-full pl-10 pt-2.5"></textarea>
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4">
                    <button type="button" onclick={closeModal} class="px-6 py-2 text-xs font-bold uppercase tracking-widest text-text-dim hover:text-text-main transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 rounded-lg">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-primary px-8 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                        {editingAsset ? 'Actualizar Ficha' : 'Completar Registro'}
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

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { @apply bg-primary/20 rounded-full; }
</style>
