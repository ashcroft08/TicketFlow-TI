<script lang="ts">
	import { offlineEnhance } from '$lib/client/offlineEnhance';
    import { Terminal, Plus, Edit2, Trash2, Search, X, ChevronLeft, ChevronRight, AlertCircle, Settings2, ExternalLink, Code, User } from 'lucide-svelte';
    import { fade, scale, slide } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import { confirmState } from '$lib/state/confirm.svelte';
    import { toast } from '$lib/state/toast.svelte';

    let { data, form } = $props();

    // Estado del Formulario / Modales
    let showModal = $state(false);
    let editingProject = $state<any>(null);
    let searchQuery = $state('');

    // Campos del Formulario Reactivos
    let nombre = $state('');
    let descripcion = $state('');
    let version = $state('');
    let estado = $state('Desarrollo');
    let id_encargado = $state('');
    let url_repositorio = $state('');

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

    // Paginación
    let currentPage = $state(1);
    let itemsPerPage = $state(10);

    const filteredProyectos = $derived(
        data.proyectos.filter(p => 
            p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (p.encargado?.nombre && p.encargado.nombre.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    );

    const totalPages = $derived(Math.ceil(filteredProyectos.length / itemsPerPage));
    const paginatedProyectos = $derived(
        filteredProyectos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );

    // Resetear página al filtrar
    $effect(() => {
        if (searchQuery) currentPage = 1;
    });

    const openCreate = () => {
        editingProject = null;
        nombre = '';
        descripcion = '';
        version = '1.0.0';
        estado = 'Desarrollo';
        id_encargado = '';
        url_repositorio = '';
        showModal = true;
    };

    const openEdit = (project: any) => {
        editingProject = project;
        nombre = project.nombre;
        descripcion = project.descripcion || '';
        version = project.version || '1.0.0';
        estado = project.estado || 'Desarrollo';
        id_encargado = project.id_encargado?.toString() || '';
        url_repositorio = project.url_repositorio || '';
        showModal = true;
    };

    const closeModal = () => {
        showModal = false;
        editingProject = null;
    };

    const getStatusStyle = (status: string | null) => {
        if (!status) return 'bg-text-dim/10 text-text-dim border-text-dim/20';
        switch (status.toLowerCase()) {
            case 'producción':
            case 'produccion':
            case 'activo':
                return 'bg-success/10 text-success border-success/20';
            case 'mantenimiento':
                return 'bg-warning/10 text-warning border-warning/20';
            case 'desarrollo':
            case 'planeación':
            case 'planeacion':
                return 'bg-primary/10 text-primary border-primary/20';
            case 'pausado':
            case 'inactivo':
                return 'bg-error/10 text-error border-error/20';
            default:
                return 'bg-text-dim/10 text-text-dim border-text-dim/20';
        }
    };
</script>

<svelte:head>
    <title>Proyectos de Software - TicketFlow TI</title>
</svelte:head>

<div class="space-y-6 animate-fade-in-up relative">
    <!-- Orbes decorativos flotantes -->
    <div class="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-[80px] pointer-events-none animate-blob"></div>

    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <Terminal class="w-4 h-4 text-primary" />
                <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Operaciones</span>
            </div>
            <h1 class="text-2xl font-bold text-text-main dark:text-dark-text-main tracking-tight">Proyectos de Software</h1>
            <p class="text-xs text-text-dim dark:text-dark-text-dim font-medium">Administra y monitorea el catálogo de sistemas y desarrollos de software de la organización.</p>
        </div>

        <button 
            onclick={openCreate}
            class="btn-primary flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
            <Plus class="w-4 h-4" />
            <span class="uppercase tracking-tighter text-xs">Nuevo Proyecto</span>
        </button>
    </header>

    <!-- Buscador -->
    <div class="relative group">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-primary transition-colors" />
        <input 
            type="text" 
            bind:value={searchQuery}
            placeholder="Filtrar por nombre, descripción o responsable..."
            aria-label="Buscar proyectos"
            class="w-full pl-11 pr-4 py-3 glass-card rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
        />
    </div>

    <!-- Tabla de Proyectos Premium -->
    <div class="glass-card rounded-lg overflow-hidden border-none shadow-2xl">
        <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
        <div class="overflow-x-auto" role="region" tabindex="0" aria-label="Tabla de proyectos de software">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-primary/5 border-b border-white/5">
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Proyecto / Sistema</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Encargado Responsable</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Versión</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Estado</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Repositorio</th>
                        <th scope="col" class="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-white/5">
                    {#each paginatedProyectos as proyecto (proyecto.id_proyecto)}
                        <tr class="group hover:bg-primary/5 transition-colors">
                            <td class="px-5 py-3">
                                <div>
                                    <p class="text-sm font-bold text-text-main dark:text-dark-text-main leading-none mb-1">{proyecto.nombre}</p>
                                    {#if proyecto.descripcion}
                                        <p class="text-[10px] text-text-dim max-w-xs truncate">{proyecto.descripcion}</p>
                                    {:else}
                                        <p class="text-[10px] text-text-dim italic">Sin descripción</p>
                                    {/if}
                                </div>
                            </td>
                            <td class="px-5 py-3">
                                {#if proyecto.encargado}
                                    <span class="text-xs font-semibold text-text-main dark:text-dark-text-main">
                                        {proyecto.encargado.nombre}
                                    </span>
                                {:else}
                                    <span class="text-xs text-text-dim italic">Sin asignar</span>
                                {/if}
                            </td>
                            <td class="px-5 py-3">
                                <span class="text-xs text-text-main font-mono">{proyecto.version || '1.0.0'}</span>
                            </td>
                            <td class="px-5 py-3">
                                <span class="px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border {getStatusStyle(proyecto.estado)}">
                                    {proyecto.estado || 'Desarrollo'}
                                </span>
                            </td>
                            <td class="px-5 py-3">
                                {#if proyecto.url_repositorio}
                                    <a 
                                        href={proyecto.url_repositorio} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        class="inline-flex items-center gap-1 text-xs font-bold text-primary hover:text-indigo-400 transition-colors"
                                    >
                                        <Code class="w-3.5 h-3.5" />
                                        <span>Git Repo</span>
                                        <ExternalLink class="w-3 h-3" />
                                    </a>
                                {:else}
                                    <span class="text-xs text-text-dim italic">No registrado</span>
                                {/if}
                            </td>
                            <td class="px-5 py-3 text-right">
                                <div class="flex justify-end gap-1">
                                    <button 
                                        onclick={() => openEdit(proyecto)}
                                        aria-label={`Editar proyecto ${proyecto.nombre}`}
                                        class="p-1.5 text-text-dim hover:text-primary hover:bg-primary/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <Edit2 class="w-4 h-4 aria-hidden=true" />
                                    </button>
                                    <form 
                                        use:offlineEnhance 
                                        action="?/delete" 
                                        method="POST" 
                                        class="inline-block"
                                    >
                                        <input type="hidden" name="id" value={proyecto.id_proyecto} />
                                        <button 
                                            type="button"
                                            onclick={(e) => {
                                                const form = e.currentTarget.closest('form');
                                                if (form) {
                                                    confirmState.ask(
                                                        '¿Eliminar Proyecto de Software?',
                                                        `¿Estás seguro de eliminar el proyecto "${proyecto.nombre}"? Esto no eliminará datos históricos pero ocultará el proyecto del catálogo.`,
                                                        () => form.requestSubmit()
                                                    );
                                                }
                                            }}
                                            aria-label={`Eliminar proyecto ${proyecto.nombre}`}
                                            class="p-1.5 text-text-dim hover:text-error hover:bg-error/10 rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-error"
                                        >
                                            <Trash2 class="w-4 h-4 aria-hidden=true" />
                                        </button>
                                    </form>
                                </div>
                            </td>
                        </tr>
                    {/each}

                    {#if filteredProyectos.length === 0}
                        <tr>
                            <td colspan="6" class="px-6 py-12 text-center text-text-dim dark:text-dark-text-dim italic text-sm">
                                No se encontraron proyectos de software registrados.
                            </td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>

        <!-- Paginación -->
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

<!-- Modal Premium de Creación/Edición -->
{#if showModal}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_interactive_supports_focus -->
    <div 
        role="dialog"
        aria-modal="true"
        tabindex="-1"
        aria-labelledby="modal-title"
        class="fixed inset-0 bg-dark-bg-main/80 backdrop-blur-md z-[60] flex items-center justify-center p-4"
        transition:fade
        onclick={(e) => e.target === e.currentTarget && closeModal()}
    >
        <div 
            class="glass-card-premium w-full max-w-lg overflow-hidden p-6 sm:p-8"
            transition:scale={{ start: 0.95, duration: 200 }}
        >
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary/10 rounded-xl text-primary">
                        <Settings2 class="w-5 h-5" />
                    </div>
                    <h2 id="modal-title" class="text-lg font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                        {editingProject ? 'Editar Proyecto' : 'Registrar Nuevo Proyecto'}
                    </h2>
                </div>
                <button onclick={closeModal} aria-label="Cerrar modal" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary">
                     <X class="w-5 h-5 text-text-dim" />
                </button>
            </div>

            <form 
                use:offlineEnhance
                action={editingProject ? '?/update' : '?/create'}
                method="POST" 
                class="space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2"
            >
                {#if formError}
                    <div class="bg-error/10 text-error border border-error/20 p-3 rounded-xl flex items-center gap-2 text-xs font-bold" transition:slide>
                        <AlertCircle class="w-4 h-4 shrink-0" />
                        {formError}
                    </div>
                {/if}

                {#if editingProject}
                    <input type="hidden" name="id" value={editingProject.id_proyecto} />
                {/if}

                <div class="space-y-1.5">
                    <label for="nombre" class="text-[10px] font-bold uppercase tracking-widest text-text-dim px-1">Nombre del Proyecto *</label>
                    <input id="nombre" type="text" name="nombre" bind:value={nombre} required placeholder="Ej: TicketFlow Mobile, ERP Finanzas..." class="input-compact h-11 w-full" />
                </div>

                <div class="space-y-1.5">
                    <label for="descripcion" class="text-[10px] font-bold uppercase tracking-widest text-text-dim px-1">Descripción del Sistema</label>
                    <textarea id="descripcion" name="descripcion" bind:value={descripcion} rows="3" placeholder="Describe brevemente el propósito de este software..." class="input-compact w-full pt-2.5 resize-none"></textarea>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-1.5">
                        <label for="version" class="text-[10px] font-bold uppercase tracking-widest text-text-dim px-1">Versión Actual</label>
                        <input id="version" type="text" name="version" bind:value={version} placeholder="Ej: 1.0.0" class="input-compact h-11 w-full" />
                    </div>

                    <div class="space-y-1.5">
                        <label for="estado" class="text-[10px] font-bold uppercase tracking-widest text-text-dim px-1">Estado de Despliegue</label>
                        <select id="estado" name="estado" bind:value={estado} class="input-compact h-11 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm text-slate-800 dark:text-white focus:outline-none">
                            <option value="Planeación">Planeación</option>
                            <option value="Desarrollo">Desarrollo</option>
                            <option value="Mantenimiento">Mantenimiento</option>
                            <option value="Producción">Producción</option>
                            <option value="Pausado">Pausado</option>
                        </select>
                    </div>
                </div>

                <div class="space-y-1.5">
                    <label for="id_encargado" class="text-[10px] font-bold uppercase tracking-widest text-text-dim px-1">Líder / Encargado de Desarrollo</label>
                    <select id="id_encargado" name="id_encargado" bind:value={id_encargado} class="input-compact h-11 w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 text-sm text-slate-800 dark:text-white focus:outline-none">
                        <option value="">Sin asignar (Disponible)</option>
                        {#each data.usuarios as user}
                            <option value={user.id_usuario.toString()}>{user.nombre}</option>
                        {/each}
                    </select>
                </div>

                <div class="space-y-1.5">
                    <label for="url_repositorio" class="text-[10px] font-bold uppercase tracking-widest text-text-dim px-1">URL de Repositorio (Git)</label>
                    <div class="relative">
                        <Code class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim opacity-50" />
                        <input id="url_repositorio" type="url" name="url_repositorio" bind:value={url_repositorio} placeholder="https://github.com/usuario/repo" class="input-compact h-11 w-full pl-10" />
                    </div>
                </div>

                <div class="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800/50">
                    <button type="button" onclick={closeModal} class="px-6 py-2 text-xs font-bold uppercase tracking-widest text-text-dim hover:text-text-main transition-colors focus:outline-none">
                        Cancelar
                    </button>
                    <button type="submit" class="btn-primary px-8">
                        {editingProject ? 'Guardar Cambios' : 'Registrar'}
                    </button>
                </div>
            </form>
        </div>
    </div>
{/if}

<style>
    @reference "../../layout.css";

    @keyframes blob {
        0% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
        100% { transform: translate(0px, 0px) scale(1); }
    }
    .animate-blob { animation: blob 10s infinite alternate ease-in-out; }

    .animate-fade-in-up {
        animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
    @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }

    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background-color: color-mix(in srgb, var(--color-primary, #4f46e5) 20%, transparent);
        border-radius: 9999px;
    }
</style>
