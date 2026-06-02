<script lang="ts">
    import { page } from '$app/state';
    import { 
        LayoutDashboard, 
        Users, 
        MapPin, 
        Tags, 
        Monitor, 
        Ticket, 
        Settings, 
        LogOut, 
        Menu, 
        X,
        ShieldCheck,
        ChevronRight,
        Trash2,
        Package,
        Layers,
        Sliders,
        Terminal,
        BookOpen
    } from 'lucide-svelte';
    import { fade, slide } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import RoleSelector from '$lib/components/shared/RoleSelector.svelte';
    import ToastContainer from '$lib/components/shared/ToastContainer.svelte';
    import ConfirmModal from '$lib/components/shared/ConfirmModal.svelte';

    import logoClaro from '$lib/assets/img/TicketFlow_logo_modo_claro.webp';
    import logoOscuro from '$lib/assets/img/TicketFlow_logo_modo_oscuro.webp';

    let { children, data } = $props();
    
    let isSidebarOpen = $state(false);
    let activePath = $derived(page.url.pathname);

    const navSections = [
        {
            label: 'Operaciones',
            items: [
                { name: 'Panel de Control', icon: LayoutDashboard, path: '/admin/dashboard' },
                { name: 'Tickets / Soporte', icon: Ticket, path: '/admin/tickets' },
                { name: 'Proyectos de Software', icon: Terminal, path: '/admin/proyectos' },
                { name: 'Bitácora', icon: BookOpen, path: '/admin/bitacora' },
            ]
        },
        {
            label: 'Catálogos Maestros',
            items: [
                { name: 'Personal / Usuarios', icon: Users, path: '/admin/usuarios' },
                { name: 'Sucursales / Tiendas', icon: MapPin, path: '/admin/sucursales' },
                { name: 'Categorías de Tickets', icon: Tags, path: '/admin/categorias' },
                { name: 'Tipos de Hardware', icon: Layers, path: '/admin/tipos' },
                { name: 'Modelos de Equipos', icon: Package, path: '/admin/catalogo' },
                { name: 'Inventario de Equipos', icon: Monitor, path: '/admin/activos' },
            ]
        },
        {
            label: 'Sistema',
            items: [
                { name: 'Papelera de Reciclaje', icon: Trash2, path: '/admin/papelera' },
                { name: 'Ajustes del Sistema', icon: Sliders, path: '/admin/settings' },
                { name: 'Mi Perfil / Ajustes', icon: Settings, path: '/admin/perfil' },
            ]
        }
    ];

    const isActive = (path: string) => activePath.startsWith(path);
    const toggleSidebar = () => isSidebarOpen = !isSidebarOpen;
</script>

<div class="flex min-h-screen bg-bg-main dark:bg-dark-bg-main text-text-main dark:text-dark-text-main transition-colors duration-500 overflow-x-hidden">
    
    <!-- Efectos de fondo 'Obsidian' -->
    <div class="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div class="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px] opacity-60"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/5 rounded-full blur-[120px] opacity-60"></div>
    </div>

    <!-- SIDEBAR MÓVIL (Overlay) -->
    {#if isSidebarOpen}
        <button 
            class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden w-full cursor-default border-none"
            aria-label="Cerrar menú lateral"
            onclick={toggleSidebar}
            transition:fade
        ></button>
    {/if}

    <!-- Sidebar Lateral -->
    <aside 
        aria-label="Menú principal de administración"
        class="fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 transform transition-transform duration-300 lg:translate-x-0 {isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}"
    >
        <div class="h-full flex flex-col p-5 overflow-hidden">
            <!-- Branding Area -->
            <div class="flex items-center justify-center py-6 mb-4">
                <img src={logoClaro} alt="TicketFlow" class="h-9 w-auto dark:hidden" />
                <img src={logoOscuro} alt="TicketFlow" class="h-9 w-auto hidden dark:block" />
            </div>

            <!-- Navegación Inteligente -->
            <nav class="flex-grow space-y-6 overflow-y-auto custom-scrollbar pr-2">
                {#each navSections as section}
                    <div class="space-y-1">
                        <h3 class="px-3 mb-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                            {section.label}
                        </h3>
                        <div class="space-y-1">
                            {#each section.items as item}
                                <a 
                                    href={item.path}
                                    class="flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-300 group {isActive(item.path) ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'}"
                                    onclick={() => isSidebarOpen = false}
                                >
                                    <div class="flex items-center gap-3">
                                        <item.icon class="w-4 h-4 {isActive(item.path) ? 'text-white' : 'group-hover:text-slate-900 dark:group-hover:text-white transition-colors'}" />
                                        <span class="text-xs font-bold tracking-tight">{item.name}</span>
                                    </div>
                                    {#if isActive(item.path)}
                                        <div class="w-1 h-1 rounded-full bg-white animate-pulse"></div>
                                    {/if}
                                </a>
                            {/each}
                        </div>
                    </div>
                {/each}
            </nav>

            <!-- User Context & Logout -->
            <div class="mt-auto pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4">
                <div class="flex items-center gap-3 px-2">
                    <div class="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center font-black text-indigo-600 dark:text-indigo-300 border border-primary/30 shadow-inner">
                        {data.user?.nombre?.[0]}
                    </div>
                    <div class="overflow-hidden">
                        <p class="text-xs font-bold text-slate-700 dark:text-slate-200 truncate leading-none mb-1">{data.user?.nombre}</p>
                        <div class="flex items-center gap-1">
                            <div class="w-1 h-1 rounded-full bg-success"></div>
                            <p class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Panel Admin</p>
                        </div>
                    </div>
                </div>
                
                <!-- Centro de Conmutación de Vistas -->
                <RoleSelector variant="full" />

                <form action="/?/logout" method="POST" use:enhance>
                    <button 
                        type="submit"
                        class="w-full flex items-center gap-3 px-3 py-2.5 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all font-bold text-[10px] uppercase tracking-widest border border-transparent hover:border-red-500/20"
                    >
                        <LogOut class="w-4 h-4" />
                        Finalizar Sesión
                    </button>
                </form>
            </div>
        </div>
    </aside>

    <!-- ÁREA DE CONTENIDO -->
    <div class="flex-1 flex flex-col min-w-0 relative z-10 lg:pl-64">
        <!-- Mobile Topbar -->
        <header class="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 glass-card !rounded-none !border-t-0 !border-x-0">
            <div class="flex items-center gap-2">
                <img src={logoClaro} alt="TicketFlow" class="h-7 w-auto block dark:hidden" />
                <img src={logoOscuro} alt="TicketFlow" class="h-7 w-auto hidden dark:block" />
            </div>
            <button 
                class="p-2 rounded-lg bg-primary/10 text-primary border border-primary/20"
                onclick={toggleSidebar}
            >
                {#if isSidebarOpen}
                    <X class="w-5 h-5" />
                {:else}
                    <Menu class="w-5 h-5" />
                {/if}
            </button>
        </header>

        <!-- Main Content Viewport -->
        <main id="main-content" class="flex-1 p-4 sm:p-6 lg:p-8 w-full mx-auto max-w-7xl pb-8 focus:outline-none" tabindex="-1">
            {@render children()}
        </main>
    </div>

    <!-- Modales y Notificaciones Premium Globales -->
    <ConfirmModal />
    <ToastContainer />
</div>

<style>
    @reference "../layout.css";

    :global(body) {
        @apply antialiased select-none;
        -webkit-tap-highlight-color: transparent;
    }

    @media (min-width: 1024px) {
        :global(body) {
            user-select: auto;
        }
    }

    .custom-scrollbar::-webkit-scrollbar { width: 3px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { 
        @apply bg-primary/10 rounded-full hover:bg-primary/20 transition-colors;
    }
</style>
