<script lang="ts">
    import { enhance } from '$app/forms';
    import { Ticket, Calendar, Monitor, AlertCircle, Clock, CheckCircle2, HelpCircle, ArrowRight, UserPlus, LogOut } from 'lucide-svelte';
    import type { ActionData, PageData } from './$types';

    let { data, form } = $props<{ data: PageData; form: ActionData }>();

    let activeTab = $state<'mis_tickets' | 'nuevos'>('mis_tickets');
    let isSubmitting = $state<number | null>(null);

    // Helper para estados
    const getStatusStyles = (nombre: string) => {
        switch (nombre) {
            case 'Abierto': return { icon: AlertCircle, bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-300', border: 'border-blue-500/20 dark:border-blue-500/30' };
            case 'En Progreso': return { icon: Clock, bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-300', border: 'border-amber-500/20 dark:border-amber-500/30' };
            case 'Resuelto': return { icon: CheckCircle2, bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-300', border: 'border-emerald-500/20 dark:border-emerald-500/30' };
            case 'Cerrado': return { icon: CheckCircle2, bg: 'bg-slate-500/10 dark:bg-slate-500/20', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-500/20 dark:border-slate-500/30' };
            default: return { icon: HelpCircle, bg: 'bg-gray-500/10 dark:bg-gray-500/20', text: 'text-gray-600 dark:text-gray-300', border: 'border-gray-500/20 dark:border-gray-500/30' };
        }
    };

    const formatDate = (date: Date | string | null) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString('es-ES', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
    };
</script>

<svelte:head>
    <title>Panel Técnico - TicketFlow TI</title>
</svelte:head>

<div class="relative min-h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-body-md text-slate-800 dark:text-slate-200 transition-colors duration-300">
    <!-- Fondos decorativos -->
    <div class="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none"></div>
    <div class="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full mix-blend-multiply filter blur-[100px] opacity-70 pointer-events-none"></div>

    <main class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        <!-- Header -->
        <header class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-10">
            <div>
                <div class="flex items-center gap-3 mb-2">
                    <div class="p-2 bg-blue-500/10 dark:bg-blue-500/20 rounded-xl">
                        <Monitor class="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span class="text-sm font-semibold tracking-wider uppercase text-blue-600 dark:text-blue-400">Área Técnica</span>
                </div>
                <h1 class="text-3xl sm:text-4xl font-bold">
                    Panel de Control
                </h1>
                <p class="text-slate-500 dark:text-slate-400 mt-2">
                    Hola, <span class="font-semibold">{data.user?.nombre}</span>. Gestiona tus asignaciones y nuevos incidentes.
                </p>
            </div>
            
            <form action="/?/logout" method="POST">
                <button type="submit" class="h-12 w-12 bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/60 text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl flex items-center justify-center transition-all duration-200 shadow-sm" title="Cerrar Sesión">
                    <LogOut class="w-5 h-5" />
                </button>
            </form>
        </header>

        {#if form?.success}
            <div class="mb-8 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 animate-fade-in-up">
                <CheckCircle2 class="w-5 h-5 shrink-0" />
                <p class="text-sm font-medium">{form.message}</p>
            </div>
        {/if}

        {#if form?.error}
            <div class="mb-8 bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3 animate-fade-in-up">
                <AlertCircle class="w-5 h-5 shrink-0" />
                <p class="text-sm font-medium">{form.error}</p>
            </div>
        {/if}

        <!-- Pestañas -->
        <div class="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-700/60 pb-px overflow-x-auto custom-scrollbar">
            <button 
                onclick={() => activeTab = 'mis_tickets'}
                class="flex items-center gap-2 pb-4 px-2 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap {activeTab === 'mis_tickets' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
            >
                <Ticket class="w-4 h-4" />
                Mis Tickets Asignados
                <span class="ml-1.5 py-0.5 px-2 rounded-full text-[10px] {activeTab === 'mis_tickets' ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}">
                    {data.misTickets.length}
                </span>
            </button>
            
            <button 
                onclick={() => activeTab = 'nuevos'}
                class="flex items-center gap-2 pb-4 px-2 font-semibold text-sm transition-colors border-b-2 whitespace-nowrap {activeTab === 'nuevos' ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
            >
                <AlertCircle class="w-4 h-4" />
                Nuevos Incidentes
                {#if data.nuevosTickets.length > 0}
                    <span class="ml-1.5 py-0.5 px-2 rounded-full text-[10px] bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 animate-pulse">
                        {data.nuevosTickets.length}
                    </span>
                {/if}
            </button>
        </div>

        <!-- Contenido de las Pestañas -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <!-- LISTADO: MIS TICKETS ASIGNADOS -->
            {#if activeTab === 'mis_tickets'}
                {#if data.misTickets.length === 0}
                    <div class="col-span-full py-16 text-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-slate-200/50 dark:border-slate-700/50 border-dashed">
                        <CheckCircle2 class="w-12 h-12 text-emerald-500 mx-auto mb-4 opacity-80" />
                        <h3 class="text-lg font-bold mb-2">¡Todo al día!</h3>
                        <p class="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                            No tienes tickets pendientes asignados en este momento. Revisa la pestaña de "Nuevos Incidentes".
                        </p>
                    </div>
                {/if}

                {#each data.misTickets as ticket}
                    {@const status = getStatusStyles(ticket.estado?.nombre || '')}
                    <a href="/tecnico/ticket/{ticket.id_ticket}" class="group relative flex flex-col bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-slate-200 dark:border-slate-700/60 rounded-[24px] p-6 hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                        
                        <div class="flex items-start justify-between gap-4 mb-4">
                            <span class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                #{ticket.id_ticket}
                            </span>
                            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border {status.bg} {status.text} {status.border}">
                                <status.icon class="w-3 h-3" />
                                {ticket.estado?.nombre || 'Abierto'}
                            </div>
                        </div>

                        <h3 class="text-base font-bold mb-3 line-clamp-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {ticket.titulo}
                        </h3>

                        <div class="mt-auto pt-6 border-t border-slate-100 dark:border-slate-700/60 flex flex-col gap-2.5">
                            <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                <Calendar class="w-3.5 h-3.5" />
                                <span>{formatDate(ticket.created_at)}</span>
                            </div>
                            <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <div class="flex items-center gap-2">
                                    <Monitor class="w-3.5 h-3.5" />
                                    <span class="truncate max-w-[150px]">{ticket.activo_ti?.catalogo?.nombre || 'General'}</span>
                                </div>
                                <ArrowRight class="w-4 h-4 text-blue-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                            </div>
                        </div>
                    </a>
                {/each}
            {/if}

            <!-- LISTADO: TICKETS NUEVOS SIN ASIGNAR -->
            {#if activeTab === 'nuevos'}
                {#if data.nuevosTickets.length === 0}
                    <div class="col-span-full py-16 text-center bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-slate-200/50 dark:border-slate-700/50 border-dashed">
                        <CheckCircle2 class="w-12 h-12 text-slate-400 mx-auto mb-4 opacity-50" />
                        <h3 class="text-lg font-bold mb-2">Bandeja Vacía</h3>
                        <p class="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                            No hay incidentes nuevos reportados en este momento.
                        </p>
                    </div>
                {/if}

                {#each data.nuevosTickets as ticket}
                    <div class="group relative flex flex-col bg-white/70 dark:bg-slate-800/60 backdrop-blur-xl border border-red-500/20 dark:border-red-500/30 rounded-[24px] p-6 hover:shadow-xl hover:shadow-red-500/5 transition-all duration-300 overflow-hidden">
                        
                        <div class="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-red-500/20 to-transparent -z-10 rounded-tr-[24px]"></div>

                        <div class="flex items-start justify-between gap-4 mb-4">
                            <span class="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                                #{ticket.id_ticket}
                            </span>
                            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
                                Sin Asignar
                            </div>
                        </div>

                        <h3 class="text-base font-bold mb-3 line-clamp-2 leading-snug">
                            {ticket.titulo}
                        </h3>

                        <div class="mt-auto pt-6 flex flex-col gap-4">
                            <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <div class="flex items-center gap-2">
                                    <Monitor class="w-3.5 h-3.5" />
                                    <span class="truncate max-w-[120px]">{ticket.activo_ti?.catalogo?.nombre || 'General'}</span>
                                </div>
                                <div class="flex items-center gap-2">
                                    <Calendar class="w-3.5 h-3.5" />
                                    <span>{formatDate(ticket.created_at)}</span>
                                </div>
                            </div>
                            
                            <form 
                                method="POST" 
                                action="?/claim" 
                                use:enhance={() => {
                                    isSubmitting = ticket.id_ticket;
                                    return async ({ update }) => {
                                        await update();
                                        isSubmitting = null;
                                        // Auto-cambiar a pestaña de asignados al tomar uno
                                        activeTab = 'mis_tickets';
                                    };
                                }}
                            >
                                <input type="hidden" name="id_ticket" value={ticket.id_ticket} />
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting === ticket.id_ticket}
                                    class="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {#if isSubmitting === ticket.id_ticket}
                                        <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        Asignando...
                                    {:else}
                                        <UserPlus class="w-4 h-4" />
                                        Tomar este Ticket
                                    {/if}
                                </button>
                            </form>
                        </div>
                    </div>
                {/each}
            {/if}

        </div>
    </main>
</div>

<style>
    .custom-scrollbar::-webkit-scrollbar { height: 4px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(156, 163, 175, 0.3); border-radius: 10px; }
    :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(71, 85, 105, 0.5); }
</style>
