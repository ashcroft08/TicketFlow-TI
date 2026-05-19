<script lang="ts">
    import { Ticket, Search, Filter, Calendar, User, MapPin, Tag, Trash2, ExternalLink, ChevronRight, AlertCircle, Clock, CheckCircle2, RotateCcw, Trash, X, Monitor, UserCircle, MessageSquare, ArchiveX, Activity, ChevronLeft } from 'lucide-svelte';
    import { fade, slide, scale } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import { goto } from '$app/navigation';
    import { confirmState } from '$lib/state/confirm.svelte';
    import { toast } from '$lib/state/toast.svelte';

    let { data, form } = $props();

    let lastProcessedForm: any = null;
    $effect(() => {
        if (form && form !== lastProcessedForm) {
            lastProcessedForm = form;
            if (form.success) {
                toast.success(form.message || '¡El estado del ticket ha sido actualizado correctamente!');
            } else if (form.error) {
                toast.error(form.error);
            }
        }
    });
    
    let searchQuery = $state('');
    let statusFilter = $state('todos');
    let selectedTicket = $state<any>(null);
    let isModalOpen = $state(false);

    // Paginación
    let currentPage = $state(1);
    let itemsPerPage = $state(10);

    const filteredTickets = $derived(
        data.tickets.filter(t => {
            const matchesSearch = t.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 t.creador?.nombre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                 t.id_ticket.toString().includes(searchQuery);
            
            const matchesStatus = statusFilter === 'todos' || t.estado?.nombre?.toLowerCase() === statusFilter.toLowerCase();
            
            return matchesSearch && matchesStatus;
        })
    );

    const totalPages = $derived(Math.ceil(filteredTickets.length / itemsPerPage));
    const paginatedTickets = $derived(
        filteredTickets.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    );

    // Resetear página cuando cambian los filtros
    $effect(() => {
        if (searchQuery || statusFilter) currentPage = 1;
    });

    function openDetails(ticket: any) {
        selectedTicket = ticket;
        isModalOpen = true;
    }

    function closeModal() {
        isModalOpen = false;
        setTimeout(() => selectedTicket = null, 300);
    }

    const getStatusStyles = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'abierto': return 'bg-error/10 text-error border-error/20';
            case 'en proceso': return 'bg-primary/10 text-primary border-primary/20';
            case 'resuelto': return 'bg-success/10 text-success border-success/20';
            case 'cerrado': return 'bg-text-dim/10 text-text-dim border-white/5';
            default: return 'bg-text-dim/5 text-text-dim border-transparent';
        }
    };

    const formatDate = (date: Date | string) => {
        return new Intl.DateTimeFormat('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    };
</script>

<svelte:head>
    <title>Tickets Globales - TicketFlow TI</title>
</svelte:head>

<div class="space-y-6 animate-fade-in-up">
    <!-- Header -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <div class="flex items-center gap-2 mb-1">
                <Ticket class="w-4 h-4 text-primary" />
                <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim dark:text-dark-text-dim">Mesa de Servicio</span>
            </div>
            <h1 class="text-2xl font-bold text-text-main dark:text-dark-text-main tracking-tight">Centro de Incidencias</h1>
            <p class="text-xs text-text-dim dark:text-dark-text-dim font-medium">Gestión y supervisión de tickets a nivel global.</p>
        </div>

        <div class="flex items-center gap-2">
            <button 
                onclick={() => {
                    const newUrl = new URL(window.location.href);
                    if (data.includeDeleted) newUrl.searchParams.delete('eliminados');
                    else newUrl.searchParams.set('eliminados', 'true');
                    goto(newUrl.toString());
                }}
                class="flex items-center gap-2 px-4 py-2 rounded-md font-bold text-[10px] uppercase tracking-widest transition-all focus:outline-none focus:ring-2 focus:ring-primary {data.includeDeleted ? 'bg-error text-white shadow-lg shadow-error/20' : 'glass-card text-text-dim hover:text-text-main'}"
            >
                {#if data.includeDeleted}
                    <Ticket class="w-3.5 h-3.5" />
                    Ver Activos
                {:else}
                    <Trash class="w-3.5 h-3.5" />
                    Ver Papelera
                {/if}
                <span class="px-1.5 py-0.5 rounded bg-black/10">
                    {data.includeDeleted ? data.counts.active : data.counts.deleted}
                </span>
            </button>
        </div>
    </header>

    <!-- Filtros -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div class="md:col-span-2 relative group">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-primary transition-colors" aria-hidden="true" />
            <input 
                type="text" 
                bind:value={searchQuery}
                placeholder="ID, título o solicitante..."
                aria-label="Buscar tickets por ID, título o solicitante"
                class="w-full pl-11 pr-4 py-3 glass-card rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm focus:ring-primary"
            />
        </div>
        
        <div class="relative">
            <Filter class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" aria-hidden="true" />
            <select 
                bind:value={statusFilter}
                aria-label="Filtrar por estado del ticket"
                class="w-full pl-11 pr-4 py-3 glass-card rounded-lg outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm appearance-none bg-no-repeat bg-[right_1rem_center] focus:ring-primary"
            >
                <option value="todos">Todos los Estados</option>
                <option value="abierto">Abiertos</option>
                <option value="en proceso">En Proceso</option>
                <option value="resuelto">Resueltos</option>
                <option value="cerrado">Cerrados</option>
            </select>
        </div>

        <div class="glass-card px-4 flex items-center justify-between rounded-lg">
            <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim">Mostrando</span>
            <span class="text-sm font-black text-primary">{paginatedTickets.length} / {filteredTickets.length}</span>
        </div>
    </div>

    <!-- Banner Papelera -->
    {#if data.includeDeleted}
        <div 
            transition:slide
            class="flex items-center gap-3 p-4 bg-error/5 border border-error/10 rounded-lg text-error"
        >
            <Trash2 class="w-4 h-4" />
            <p class="text-[11px] font-bold uppercase tracking-tight">Estás en el archivo de tickets eliminados. Puedes restaurar registros si es necesario.</p>
        </div>
    {/if}

    <!-- Grid de Tickets -->
    <div class="space-y-3">
        {#each paginatedTickets as ticket (ticket.id_ticket)}
            <div 
                transition:fade
                class="group glass-card p-4 rounded-lg hover:border-primary/30 transition-all duration-300"
            >
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div class="flex-grow space-y-2">
                        <div class="flex items-center gap-3">
                            <span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase tracking-tighter">
                                ID-{ticket.id_ticket}
                            </span>
                            <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border {getStatusStyles(ticket.estado?.nombre)}">
                                {ticket.estado?.nombre}
                            </span>
                            <div class="flex items-center gap-1.5 text-[10px] text-text-dim font-medium">
                                <Clock class="w-3 h-3" />
                                {formatDate(ticket.created_at)}
                            </div>
                        </div>
                        
                        <h3 class="text-base font-bold text-text-main dark:text-dark-text-main group-hover:text-primary transition-colors leading-tight">
                            {ticket.titulo}
                        </h3>
                        
                        <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] font-medium text-text-dim dark:text-dark-text-dim">
                            <div class="flex items-center gap-1.5">
                                <User class="w-3.5 h-3.5 opacity-50" />
                                <span class="text-text-main dark:text-dark-text-main">{ticket.creador?.nombre}</span>
                            </div>
                            <div class="flex items-center gap-1.5">
                                <MapPin class="w-3.5 h-3.5 opacity-50" />
                                <span>{ticket.activo_ti?.sucursal?.nombre || 'Sede Global'}</span>
                            </div>
                            <div class="flex items-center gap-1.5">
                                <Tag class="w-3.5 h-3.5 opacity-50" />
                                <span class="italic">{ticket.categoria?.nombre_tecnico || 'Sin Categoría'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-white/5">
                        <div class="text-right hidden sm:block">
                            <p class="text-[9px] uppercase tracking-widest text-text-dim font-bold mb-1">Especialista TI</p>
                            <div class="flex items-center justify-end gap-2">
                                <span class="text-xs font-bold text-text-main dark:text-dark-text-main italic">
                                    {ticket.usuario_asignado?.nombre || 'Sin Asignación'}
                                </span>
                                <div class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                    <UserCircle class="w-3.5 h-3.5 text-primary" />
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-2">
                            {#if data.includeDeleted && ticket.deleted_at}
                                <form 
                                    use:enhance 
                                    action="?/restore" 
                                    method="POST"
                                >
                                    <input type="hidden" name="id" value={ticket.id_ticket} />
                                    <button 
                                        type="button"
                                        onclick={(e) => {
                                            const form = e.currentTarget.closest('form');
                                            if (form) {
                                                confirmState.ask(
                                                    '¿Restaurar Ticket?',
                                                    `¿Estás seguro de restaurar el ticket ID-${ticket.id_ticket} al flujo de trabajo activo?`,
                                                    () => form.requestSubmit()
                                                );
                                            }
                                        }}
                                        aria-label={`Restaurar ticket ID-${ticket.id_ticket}`}
                                        class="flex items-center gap-2 px-4 py-2 bg-success text-white text-[10px] font-bold uppercase tracking-widest rounded-md hover:bg-success/90 transition-all focus:outline-none focus:ring-2 focus:ring-success"
                                    >
                                        <RotateCcw class="w-3.5 h-3.5 aria-hidden=true" />
                                        Restaurar
                                    </button>
                                </form>
                            {:else}
                                <button 
                                    onclick={() => openDetails(ticket)}
                                    class="p-2 bg-primary/5 text-primary hover:bg-primary hover:text-white rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                                    title="Ver Detalles"
                                    aria-label={`Ver detalles del ticket ID-${ticket.id_ticket}`}
                                >
                                    <ExternalLink class="w-4 h-4 aria-hidden=true" />
                                </button>
                                
                                <form 
                                    use:enhance 
                                    action="?/delete" 
                                    method="POST" 
                                >
                                    <input type="hidden" name="id" value={ticket.id_ticket} />
                                    <button 
                                        type="button"
                                        onclick={(e) => {
                                            const form = e.currentTarget.closest('form');
                                            if (form) {
                                                confirmState.ask(
                                                    '¿Archivar Ticket?',
                                                    `¿Estás seguro de enviar a la papelera el ticket ID-${ticket.id_ticket}?`,
                                                    () => form.requestSubmit()
                                                );
                                            }
                                        }}
                                        class="p-2 bg-error/5 text-error hover:bg-error hover:text-white rounded-md transition-all focus:outline-none focus:ring-2 focus:ring-error"
                                        title="Eliminar"
                                        aria-label={`Archivar ticket ID-${ticket.id_ticket}`}
                                    >
                                        <Trash2 class="w-4 h-4 aria-hidden=true" />
                                    </button>
                                </form>
                            {/if}
                        </div>
                    </div>
                </div>
            </div>
        {:else}
            <div class="py-16 text-center space-y-4 glass-card border-dashed border-white/10 rounded-xl">
                <div class="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto">
                    {#if data.includeDeleted}
                        <ArchiveX class="w-6 h-6 text-text-dim" />
                    {:else}
                        <Search class="w-6 h-6 text-text-dim" />
                    {/if}
                </div>
                <div class="max-w-xs mx-auto">
                    <p class="text-sm font-bold text-text-main dark:text-dark-text-main uppercase tracking-tight">Sin resultados</p>
                    <p class="text-xs text-text-dim font-medium italic mt-1">No hay incidencias que coincidan con los criterios actuales.</p>
                </div>
            </div>
        {/each}
    </div>

    <!-- Paginación de Tickets -->
    {#if totalPages > 1}
        <div class="flex items-center justify-between px-2 pt-4">
            <span class="text-[10px] font-bold uppercase tracking-widest text-text-dim">
                Página {currentPage} de {totalPages}
            </span>
            <div class="flex gap-2">
                <button 
                    disabled={currentPage === 1}
                    onclick={() => currentPage--}
                    aria-label="Página anterior"
                    class="p-2 glass-card rounded-md disabled:opacity-30 hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <ChevronLeft class="w-5 h-5 aria-hidden=true" />
                </button>
                <button 
                    disabled={currentPage === totalPages}
                    onclick={() => currentPage++}
                    aria-label="Página siguiente"
                    class="p-2 glass-card rounded-md disabled:opacity-30 hover:text-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <ChevronRight class="w-5 h-5 aria-hidden=true" />
                </button>
            </div>
        </div>
    {/if}
</div>

<!-- Modal Premium Detalle -->
{#if isModalOpen && selectedTicket}
    <div 
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        transition:fade={{ duration: 200 }}
    >
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            class="absolute inset-0 bg-dark-bg-main/80 backdrop-blur-md"
            onclick={closeModal}
        ></div>

        <div 
            class="relative w-full max-w-2xl glass-card rounded-xl shadow-2xl overflow-hidden border border-white/10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            transition:scale={{ duration: 300, start: 0.95, opacity: 0 }}
        >
            <div class="px-8 py-5 border-b border-white/5 flex items-center justify-between bg-primary/5">
                <div class="flex items-center gap-3">
                    <div class="p-2 bg-primary/10 rounded-lg text-primary">
                        <AlertCircle class="w-5 h-5 aria-hidden=true" />
                    </div>
                    <div>
                        <h2 id="modal-title" class="text-lg font-bold text-text-main dark:text-dark-text-main uppercase tracking-tight">Ficha de Incidencia</h2>
                        <div class="flex items-center gap-2 mt-0.5">
                            <span class="text-[10px] text-text-dim font-bold uppercase tracking-widest">ID-{selectedTicket.id_ticket} • {formatDate(selectedTicket.created_at)}</span>
                        </div>
                    </div>
                </div>
                <button 
                    onclick={closeModal}
                    aria-label="Cerrar detalles del ticket"
                    class="p-2 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <X class="w-5 h-5 text-text-dim aria-hidden=true" />
                </button>
            </div>

            <div class="p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
                <div class="space-y-2">
                    <span class="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border {getStatusStyles(selectedTicket.estado?.nombre)}">
                        {selectedTicket.estado?.nombre}
                    </span>
                    <h1 class="text-2xl font-bold text-text-main dark:text-dark-text-main leading-tight tracking-tight">
                        {selectedTicket.titulo}
                    </h1>
                </div>

                <div class="bg-primary/5 p-6 rounded-lg border border-primary/10">
                    <p class="text-[10px] font-black text-primary uppercase tracking-widest mb-3 italic">Relato de la Incidencia</p>
                    <p class="text-sm text-text-main dark:text-dark-text-main leading-relaxed whitespace-pre-wrap font-medium">
                        {selectedTicket.descripcion}
                    </p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/5">
                        <UserCircle class="w-5 h-5 text-primary mt-0.5" />
                        <div>
                            <p class="text-[9px] font-black text-text-dim uppercase tracking-widest mb-1">Solicitante</p>
                            <p class="text-sm font-bold text-text-main dark:text-dark-text-main">{selectedTicket.creador?.nombre}</p>
                            <p class="text-[10px] text-text-dim italic">{selectedTicket.creador?.email}</p>
                        </div>
                    </div>
                    <div class="flex items-start gap-4 p-4 rounded-lg bg-white/5 border border-white/5">
                        <Monitor class="w-5 h-5 text-primary mt-0.5" />
                        <div>
                            <p class="text-[9px] font-black text-text-dim uppercase tracking-widest mb-1">Activo TI</p>
                            {#if selectedTicket.activo_ti}
                                <p class="text-sm font-bold text-text-main dark:text-dark-text-main">{selectedTicket.activo_ti.catalogo?.nombre}</p>
                                <p class="text-[10px] text-text-dim italic">S/N: {selectedTicket.activo_ti.numero_serie || 'N/A'}</p>
                            {:else}
                                <p class="text-sm font-bold text-text-dim italic">Uso de Red General</p>
                            {/if}
                        </div>
                    </div>
                </div>

                <div class="flex flex-wrap gap-3">
                    <div class="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-text-main">
                        <MapPin class="w-3.5 h-3.5 text-primary" />
                        {selectedTicket.activo_ti?.sucursal?.nombre || 'Sede Central'}
                    </div>
                    <div class="flex items-center gap-2 px-3 py-1.5 rounded bg-white/5 border border-white/5 text-[10px] font-bold uppercase tracking-widest text-text-main">
                        <Tag class="w-3.5 h-3.5 text-primary" />
                        {selectedTicket.categoria?.nombre_tecnico || 'Sin Clasificar'}
                    </div>
                </div>
            </div>

            <div class="p-6 border-t border-white/5 bg-primary/5 flex flex-col sm:flex-row justify-end gap-3">
                <button 
                    onclick={closeModal}
                    class="px-6 py-2 text-xs font-bold uppercase tracking-widest text-text-dim hover:text-text-main transition-all focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                    Volver
                </button>
                <a 
                    href="/admin/tickets/{selectedTicket.id_ticket}"
                    class="btn-primary flex items-center justify-center gap-2 px-8 focus:outline-none focus:ring-2 focus:ring-primary"
                >
                    <MessageSquare class="w-4 h-4 aria-hidden=true" />
                    <span class="text-xs uppercase tracking-widest">Abrir Gestión Técnica</span>
                </a>
            </div>
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
