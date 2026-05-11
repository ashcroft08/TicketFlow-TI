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
<header class="fixed top-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 z-40 px-4">
    <div class="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
        <!-- Logo -->
        <a href={role === 'TECH' ? '/tecnico/dashboard' : '/encargado/dashboard'} class="flex items-center gap-4 shrink-0 hover:opacity-90 transition-opacity">
            <img src={logoClaro} alt="TicketFlow" class="h-10 w-auto dark:hidden" />
            <img src={logoOscuro} alt="TicketFlow" class="h-10 w-auto hidden dark:block" />
        </a>
        <!-- Desktop Navigation (Centered) -->
        <nav class="hidden md:flex flex-1 items-center justify-center px-4">
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
                <div class="flex items-center gap-6" in:fade>
                    <div class="flex flex-col items-center">
                        <span class="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-0.5">Resolución Ticket #{ticket.id_ticket}</span>
                        <h2 class="text-sm font-bold text-slate-900 dark:text-white max-w-md truncate tracking-tight">{ticket.titulo}</h2>
                    </div>
                    <div class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border {status.bg} {status.text} {status.border}">
                        <status.icon class="w-3 h-3" />
                        <span>{ticket.estado?.nombre || 'Pendiente'}</span>
                    </div>
                </div>
            {:else if isProfilePage}
                <div class="flex flex-col items-center" in:fade>
                    <span class="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em] mb-0.5">Gestión de Cuenta</span>
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
            <UserMenu {user} />
        </div>
    </div>
</header>

<!-- BOTTOM NAVIGATION (Mobile Only) -->
<nav class="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border-t border-slate-200 dark:border-slate-800 px-4 pb-safe-offset-2 pt-2 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
    <div class="flex items-center justify-around max-w-lg mx-auto">
        <a 
            href={role === 'TECH' ? '/tecnico/dashboard' : '/encargado/dashboard'} 
            class="flex flex-col items-center gap-1 p-2 transition-all duration-300 relative {isActive('/tecnico/dashboard') || isActive('/encargado/dashboard') ? 'text-primary scale-110' : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white'}"
        >
            <div class="relative">
                <LayoutDashboard class="w-5 h-5" />
                {#if isActive('/tecnico/dashboard') || isActive('/encargado/dashboard')}
                    <div class="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(79,70,229,0.5)]"></div>
                {/if}
            </div>
            <span class="text-[9px] font-black uppercase tracking-tighter">Panel</span>
        </a>
        
        <!-- Center Action Button -->
        <button class="flex flex-col items-center -mt-8 relative z-50 group">
            <div class="bg-primary text-white p-3.5 rounded-2xl shadow-xl shadow-primary/40 group-active:scale-90 transition-all border-4 border-white dark:border-slate-900">
                <PlusCircle class="w-6 h-6" />
            </div>
            <span class="text-[9px] font-black uppercase tracking-tighter mt-1 text-primary">Nuevo</span>
        </button>

        <div class="flex flex-col items-center gap-1 p-2 text-slate-400">
            <User class="w-5 h-5" />
            <span class="text-[9px] font-black uppercase tracking-tighter">Perfil</span>
        </div>
    </div>
</nav>v>

<style>
    @reference "../../../routes/layout.css";

    .pb-safe-offset-2 {
        padding-bottom: calc(env(safe-area-inset-bottom) + 0.5rem);
    }
</style>
