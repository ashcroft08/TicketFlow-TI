<script lang="ts">
    import { LayoutDashboard, Users, Ticket, MapPin, Monitor, Clock, ChevronRight, CheckCircle2, AlertCircle, Search, Settings, Activity, ArrowUpRight } from 'lucide-svelte';
    import { fade, slide } from 'svelte/transition';
    let { data } = $props();

    const stats = $derived(data.stats);
    const recentTickets = $derived(data.recentTickets);

    const formatDate = (date: string | Date) => {
        if (!date) return 'N/A';
        return new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
</script>

<svelte:head>
    <title>Dashboard Admin - TicketFlow TI</title>
</svelte:head>

<div class="space-y-6 animate-fade-in-up relative">
    <!-- Orbes decorativos flotantes de fondo para un look ultra premium -->
    <div class="absolute -top-12 -right-12 w-64 h-64 bg-primary/5 dark:bg-primary/10 rounded-full blur-[80px] pointer-events-none animate-blob"></div>
    <div class="absolute top-1/2 left-1/3 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-blob animation-delay-4000"></div>
    <!-- Header del Dashboard -->
    <header class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl font-bold tracking-tight text-text-main dark:text-dark-text-main">Panel Maestro</h1>
            <p class="text-sm text-text-dim dark:text-dark-text-dim font-medium">
                Hola, <span class="text-primary font-bold">{data.user?.nombre}</span>. Tienes <span class="text-text-main dark:text-dark-text-main font-bold">{stats.abiertos} tickets</span> críticos.
            </p>
        </div>
        <div class="flex items-center gap-2 px-3 py-1 bg-success/10 border border-success/20 rounded-full w-fit">
            <div class="w-2 h-2 bg-success rounded-full animate-pulse"></div>
            <span class="text-[10px] font-bold text-success uppercase tracking-wider">Sistema Operativo</span>
        </div>
    </header>

    <!-- Stats Grid Principal -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <!-- Card 1: Tickets Abiertos -->
        <div class="glass-card-premium p-5 group hover:-translate-y-1 hover:border-error/30">
            <div class="flex justify-between items-start mb-3">
                <div class="p-2 bg-error/10 rounded-md text-error group-hover:bg-error group-hover:text-white transition-all duration-300">
                    <AlertCircle class="w-5 h-5" />
                </div>
                <div class="text-[10px] font-bold text-error bg-error/10 px-2 py-0.5 rounded-full uppercase">Crítico</div>
            </div>
            <h3 class="text-xs font-bold text-text-dim dark:text-dark-text-dim uppercase tracking-wider">Tickets Abiertos</h3>
            <div class="flex items-baseline gap-2 mt-1">
                <span class="text-3xl font-bold tracking-tighter text-text-main dark:text-dark-text-main">{stats.abiertos}</span>
                <span class="text-[10px] font-medium text-error flex items-center gap-0.5">
                    <ArrowUpRight class="w-3 h-3" /> 12%
                </span>
            </div>
        </div>

        <!-- Card 2: En Proceso -->
        <div class="glass-card-premium p-5 group hover:-translate-y-1 hover:border-primary/30">
            <div class="flex justify-between items-start mb-3">
                <div class="p-2 bg-primary/10 rounded-md text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Clock class="w-5 h-5" />
                </div>
            </div>
            <h3 class="text-xs font-bold text-text-dim dark:text-dark-text-dim uppercase tracking-wider">En Diagnóstico</h3>
            <div class="flex items-baseline gap-2 mt-1">
                <span class="text-3xl font-bold tracking-tighter text-text-main dark:text-dark-text-main">{stats.enProceso}</span>
                <span class="text-[10px] font-medium text-primary">En curso</span>
            </div>
        </div>

        <!-- Card 3: Activos TI -->
        <div class="glass-card-premium p-5 group hover:-translate-y-1 hover:border-success/30">
            <div class="flex justify-between items-start mb-3">
                <div class="p-2 bg-success/10 rounded-md text-success group-hover:bg-success group-hover:text-white transition-all duration-300">
                    <Monitor class="w-5 h-5" />
                </div>
            </div>
            <h3 class="text-xs font-bold text-text-dim dark:text-dark-text-dim uppercase tracking-wider">Activos de Red</h3>
            <div class="flex items-baseline gap-2 mt-1">
                <span class="text-3xl font-bold tracking-tighter text-text-main dark:text-dark-text-main">{stats.totalAssets}</span>
                <span class="text-[10px] font-medium text-text-dim dark:text-dark-text-dim">Equipos</span>
            </div>
        </div>

        <!-- Card 4: Técnicos -->
        <div class="glass-card-premium p-5 group hover:-translate-y-1 hover:border-primary/30">
            <div class="flex justify-between items-start mb-3">
                <div class="p-2 bg-primary/10 rounded-md text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <Users class="w-5 h-5" />
                </div>
            </div>
            <h3 class="text-xs font-bold text-text-dim dark:text-dark-text-dim uppercase tracking-wider">Técnicos</h3>
            <div class="flex items-baseline gap-2 mt-1">
                <span class="text-3xl font-bold tracking-tighter text-text-main dark:text-dark-text-main">{stats.techStaff}</span>
                <span class="text-[10px] font-medium text-text-dim dark:text-dark-text-dim">Activos</span>
            </div>
        </div>
    </div>

    <div class="grid lg:grid-cols-3 gap-6">
        <!-- Tabla de Tickets Recientes -->
        <div class="lg:col-span-2 space-y-4">
            <div class="flex items-center justify-between px-1">
                <div class="flex items-center gap-2">
                    <Activity class="w-4 h-4 text-primary" />
                    <h2 class="text-sm font-bold uppercase tracking-widest text-text-main dark:text-dark-text-main">Actividad Reciente</h2>
                </div>
                <a href="/admin/tickets" class="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary rounded px-1">Ver Historial</a>
            </div>

            <div class="glass-card-premium overflow-hidden border-none">
                <div class="overflow-x-auto" tabindex="0" aria-label="Tabla de tickets recientes">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-primary/5 border-b border-border-main dark:border-dark-border-main">
                                <th scope="col" class="px-4 py-3 text-[10px] font-bold text-text-dim dark:text-dark-text-dim uppercase tracking-widest">Ticket / Fecha</th>
                                <th scope="col" class="px-4 py-3 text-[10px] font-bold text-text-dim dark:text-dark-text-dim uppercase tracking-widest">Estado</th>
                                <th scope="col" class="px-4 py-3 text-[10px] font-bold text-text-dim dark:text-dark-text-dim uppercase tracking-widest">Asignación</th>
                                <th scope="col" class="px-4 py-3 text-[10px] font-bold text-text-dim dark:text-dark-text-dim uppercase tracking-widest text-right"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-border-main dark:divide-dark-border-main">
                            {#each recentTickets as ticket}
                                <tr class="hover:bg-primary/5 transition-colors group">
                                    <td class="px-4 py-3">
                                        <div class="flex flex-col">
                                            <span class="text-sm font-bold truncate max-w-[200px] text-text-main dark:text-dark-text-main">{ticket.titulo}</span>
                                            <span class="text-[10px] text-text-dim dark:text-dark-text-dim font-medium">{formatDate(ticket.created_at)}</span>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3">
                                        <span class="text-[10px] font-bold px-2 py-0.5 rounded-full {ticket.estado?.nombre === 'Abierto' ? 'bg-error/10 text-error' : ticket.estado?.nombre === 'En Proceso' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'}">
                                            {ticket.estado?.nombre || 'Pendiente'}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3">
                                        <div class="flex items-center gap-2">
                                            <div class="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary">
                                                {ticket.usuario_asignado?.nombre?.[0] || '?'}
                                            </div>
                                            <span class="text-[10px] font-medium italic text-text-dim dark:text-dark-text-dim truncate max-w-[100px]">
                                                {ticket.usuario_asignado?.nombre || 'Sin asignar'}
                                            </span>
                                        </div>
                                    </td>
                                    <td class="px-4 py-3 text-right">
                                        <a href="/admin/tickets/{ticket.id_ticket}" class="p-1.5 inline-flex bg-primary/10 text-primary rounded-md opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:opacity-100" aria-label={`Ver detalles del ticket ${ticket.titulo}`}>
                                            <ChevronRight class="w-4 h-4" aria-hidden="true" />
                                        </a>
                                    </td>
                                </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- Columna Lateral: Control Maestro -->
        <div class="space-y-4">
            <div class="flex items-center gap-2 px-1">
                <Settings class="w-4 h-4 text-primary" />
                <h2 class="text-sm font-bold uppercase tracking-widest text-text-main dark:text-dark-text-main">Acceso Rápido</h2>
            </div>

            <div class="grid gap-2">
                <a href="/admin/sucursales" class="glass-card-premium p-4 flex items-center gap-4 group hover:-translate-y-0.5 hover:border-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary">
                    <div class="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <MapPin class="w-4 h-4" />
                    </div>
                    <div>
                        <p class="text-xs font-bold uppercase tracking-tight text-text-main dark:text-dark-text-main">Sucursales</p>
                        <p class="text-[10px] text-text-dim dark:text-dark-text-dim font-medium italic">Gestión de sedes</p>
                    </div>
                </a>

                <a href="/admin/usuarios" class="glass-card-premium p-4 flex items-center gap-4 group hover:-translate-y-0.5 hover:border-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary">
                    <div class="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Users class="w-4 h-4" />
                    </div>
                    <div>
                        <p class="text-xs font-bold uppercase tracking-tight text-text-main dark:text-dark-text-main">Personal</p>
                        <p class="text-[10px] text-text-dim dark:text-dark-text-dim font-medium italic">Usuarios y Roles</p>
                    </div>
                </a>

                <a href="/admin/activos" class="glass-card-premium p-4 flex items-center gap-4 group hover:-translate-y-0.5 hover:border-primary/50 transition-all focus:outline-none focus:ring-2 focus:ring-primary">
                    <div class="p-2 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <Monitor class="w-4 h-4" />
                    </div>
                    <div>
                        <p class="text-xs font-bold uppercase tracking-tight text-text-main dark:text-dark-text-main">Activos TI</p>
                        <p class="text-[10px] text-text-dim dark:text-dark-text-dim font-medium italic">Inventario de Red</p>
                    </div>
                </a>

            </div>
        </div>
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


