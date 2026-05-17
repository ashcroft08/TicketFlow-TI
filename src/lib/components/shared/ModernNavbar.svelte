<script lang="ts">
    import { page } from '$app/state';
    import { LayoutDashboard, Ticket, Users, Bell, Search, PlusCircle, User, Home, Clock, CheckCircle2, HelpCircle, AlertCircle } from 'lucide-svelte';
    import { fade } from 'svelte/transition';
    import UserMenu from './UserMenu.svelte';
    
    import logoClaro from '$lib/assets/img/TicketFlow_logo_modo_claro.webp';
    import logoOscuro from '$lib/assets/img/TicketFlow_logo_modo_oscuro.webp';

    let { user, role = 'TECH' } = $props();

    let activePath = $derived(page.url.pathname);
    const isActive = (path: string) => activePath.startsWith(path);

    // Get ticket info from page data if we are in a ticket view
    let ticket = $derived(page.data.ticket);
    let isProfilePage = $derived(activePath.endsWith('/perfil'));

    const navItems = $derived(
        role === 'TECH' 
        ? [
            { name: 'Inicio', icon: LayoutDashboard, path: '/tecnico/dashboard' },
            { name: 'Incidencias', icon: Ticket, path: '/tecnico/ticket' },
        ]
        : [
            { name: 'Gestión', icon: LayoutDashboard, path: '/encargado/dashboard' },
            { name: 'Tickets', icon: Users, path: '/encargado/ticket' },
        ]
    );
</script>

<!-- TOP NAVBAR -->
<header class="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/30 dark:border-slate-800/30 z-40 px-4">
    <div class="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
        <!-- Logo -->
        <a href={role === 'TECH' ? '/tecnico/dashboard' : '/encargado/dashboard'} class="flex items-center gap-4 shrink-0 hover:opacity-90 transition-opacity">
            <img src={logoClaro} alt="TicketFlow" class="h-10 w-auto dark:hidden" />
            <img src={logoOscuro} alt="TicketFlow" class="h-10 w-auto hidden dark:block" />
        </a>
        <!-- Desktop/Tablet Navigation (Centered) -->
        <nav class="hidden sm:flex flex-1 items-center justify-center px-4">
            {#if ticket}
                {@const status = (() => {
                    switch (ticket.estado?.nombre) {
                        case 'Abierto': return { icon: AlertCircle, bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-600 dark:text-blue-300', border: 'border-blue-500/20 dark:border-blue-500/30' };
                        case 'En Progreso': return { icon: Clock, bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-600 dark:text-amber-300', border: 'border-amber-500/20 dark:border-amber-500/30' };
                        case 'Resuelto': return { icon: CheckCircle2, bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-300', border: 'border-emerald-500/20 dark:border-emerald-500/30' };
                        case 'Cerrado': return { icon: CheckCircle2, bg: 'bg-slate-500/10 dark:bg-slate-500/20', text: 'text-slate-600 dark:text-slate-300', border: 'border-slate-500/20 dark:border-slate-500/30' };
                        default: return { icon: HelpCircle, bg: 'bg-gray-500/10 dark:bg-gray-500/20', text: 'text-gray-600 dark:text-gray-300', border: 'border-gray-500/20 dark:border-gray-500/30' };
                    }
                })()}
                <div class="flex items-center gap-3 md:gap-8" in:fade>
                    <div class="flex flex-col items-start border-l-2 border-slate-200 dark:border-slate-800 pl-3 md:pl-4">
                        <span class="text-[7px] md:text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-0.5 whitespace-nowrap">Ticket #{ticket.id_ticket}</span>
                        <h2 class="text-xs md:text-base font-bold text-slate-900 dark:text-white max-w-[120px] md:max-w-md truncate tracking-tight leading-none">{ticket.titulo}</h2>
                    </div>
                    <div class="flex items-center gap-1.5 px-2.5 py-1 md:px-4 md:py-1.5 rounded-xl text-[9px] md:text-[11px] font-black uppercase tracking-widest border shadow-sm {status.bg} {status.text} {status.border}">
                        <status.icon class="w-3 h-3 md:w-3.5 md:h-3.5" />
                        <span class="inline-block">{ticket.estado?.nombre || 'Pendiente'}</span>
                    </div>
                </div>

            {:else if isProfilePage}
                <div class="flex flex-col items-center" in:fade>
                    <span class="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-0.5">Gestión</span>
                    <h2 class="text-sm font-bold text-slate-900 dark:text-white tracking-tight">Mi Perfil</h2>
                </div>
            {/if}
        </nav>


        <!-- Right Actions -->
        <div class="flex items-center gap-2 sm:gap-4">
            <!-- Home Button -->
            <a 
                href={role === 'TECH' ? '/tecnico/dashboard' : '/encargado/dashboard'}
                class="p-2 text-slate-500 hover:text-primary transition-colors hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg"
                title="Ir al Inicio"
            >
                <Home class="w-5 h-5" />
            </a>

            <div class="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>

            <!-- User Profile Dropdown -->
            <div class={role === 'STORE_MANAGER' ? 'hidden sm:block' : ''}>
                <UserMenu {user} />
            </div>
        </div>
    </div>
</header>


