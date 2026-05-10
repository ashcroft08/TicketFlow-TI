<script lang="ts">
    import { LayoutDashboard, Users, LogOut, Menu, X } from 'lucide-svelte';
    import { fade } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import RoleSelector from '$lib/components/shared/RoleSelector.svelte';
    import { page } from '$app/state';

    import logoClaro from '$lib/assets/img/TicketFlow_logo_modo_claro.webp';
    import logoOscuro from '$lib/assets/img/TicketFlow_logo_modo_oscuro.webp';

    let { children, data } = $props();
    let isSidebarOpen = $state(false);
    let activePath = $derived(page.url.pathname);

    const toggleSidebar = () => isSidebarOpen = !isSidebarOpen;
</script>

<div class="flex min-h-screen bg-bg-main dark:bg-dark-bg-main text-text-main dark:text-dark-text-main transition-colors duration-500 overflow-x-hidden">
    
    <!-- Sidebar - Siempre fondo oscuro (Obsidian) -->
    <aside class="fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-slate-800 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 {isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} overflow-hidden">
        <div class="h-full flex flex-col">
            <!-- Logo Area -->
            <div class="flex items-center justify-center py-8 shrink-0">
                <img src={logoOscuro} alt="TicketFlow" class="h-8 w-auto" />
            </div>

            <!-- Navigation Area -->
            <nav class="flex-grow px-4 space-y-1 overflow-y-auto custom-scrollbar">
                <p class="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 px-2 mb-2">Gestión</p>
                <a 
                    href="/encargado/dashboard"
                    class="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all {activePath.includes('/dashboard') ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-300 hover:bg-white/10 hover:text-white'}"
                >
                    <Users class="w-4 h-4" />
                    <span class="text-[11px] font-black uppercase tracking-tight">Panel Gestor</span>
                </a>
            </nav>

            <!-- Bottom Area (Fixed) -->
            <div class="p-4 border-t border-slate-800 space-y-4 shrink-0">
                <RoleSelector />
                
                <form action="/?/logout" method="POST" use:enhance>
                    <button type="submit" class="w-full flex items-center gap-3 px-3 py-2.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest border border-transparent hover:border-red-500/20">
                        <LogOut class="w-4 h-4" />
                        Cerrar Sesión
                    </button>
                </form>
            </div>
        </div>
    </aside>

    <!-- Main -->
    <div class="flex-1 flex flex-col min-w-0">
        <header class="lg:hidden p-4 glass-card !rounded-none flex justify-between items-center z-40">
            <img src={logoClaro} alt="TicketFlow" class="h-7 w-auto dark:hidden" />
            <img src={logoOscuro} alt="TicketFlow" class="h-7 w-auto hidden dark:block" />
            <button onclick={toggleSidebar} class="p-2 bg-primary/10 rounded-lg text-primary">
                {#if isSidebarOpen}
                    <X class="w-5 h-5" />
                {:else}
                    <Menu class="w-5 h-5" />
                {/if}
            </button>
        </header>

        <main class="flex-1 overflow-y-auto">
            {@render children()}
        </main>
    </div>
</div>

<style>
    @reference "../layout.css";

    .custom-scrollbar::-webkit-scrollbar { width: 0px; } /* Hide scrollbar but keep functionality */
</style>
