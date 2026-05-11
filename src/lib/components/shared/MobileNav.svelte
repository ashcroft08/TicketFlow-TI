<script lang="ts">
  import { page } from '$app/state';
  import { LayoutDashboard, Ticket, User, PlusCircle, MessageSquare, Settings2, AlertCircle, CheckCircle2, History } from 'lucide-svelte';
  import { fade } from 'svelte/transition';
  import { dashboardState, ticketViewState } from '$lib/states/ui.svelte';

  let activePath = $derived(page.url.pathname);
  let user = $derived(page.data.user);

  // Determinar el contexto actual
  let isDashboard = $derived(activePath.includes('/dashboard'));
  let isTicketView = $derived(activePath.includes('/ticket/'));

  // Items dinámicos basados en el contexto
  const navItems = $derived(() => {
    if (isDashboard && user?.cod_rol === 'TECH') {
      return [
        { name: 'Míos', icon: Ticket, id: 'mis_tickets', count: page.data.misTickets?.length },
        { name: 'Nuevos', icon: AlertCircle, id: 'nuevos', count: page.data.nuevosTickets?.length },
        { name: 'Finalizados', icon: History, id: 'finalizados', count: page.data.finalizados?.length }
      ];
    }
    if (isTicketView) {
      return [
        { name: 'Detalles', icon: Settings2, id: 'details' },
        { name: 'Chat', icon: MessageSquare, id: 'chat', count: page.data.ticket?.comentarios?.length }
      ];
    }
    // Default nav if not in specific context
    return [
      { name: 'Inicio', icon: LayoutDashboard, path: user?.cod_rol === 'ADMIN' ? '/admin/dashboard' : (user?.cod_rol === 'TECH' ? '/tecnico/dashboard' : '/encargado/dashboard') },
      { name: 'Perfil', icon: User, path: activePath.includes('/tecnico') ? '/tecnico/perfil' : '/encargado/perfil' }
    ];
  });

  const handleTabClick = (id: string) => {
    if (isDashboard) dashboardState.activeTab = id as any;
    if (isTicketView) ticketViewState.activeTab = id as any;
  };

  const isTabActive = (id: string) => {
    if (isDashboard) return dashboardState.activeTab === id;
    if (isTicketView) return ticketViewState.activeTab === id;
    return false;
  };
</script>

<nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-t border-slate-200/30 dark:border-slate-800/30 px-4 pb-safe pt-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
  <div class="flex items-center justify-around max-w-lg mx-auto relative">
    
    {#each navItems() as item}
      {#if item.id}
        <!-- Pestañas Contextuales -->
        <button 
          onclick={() => handleTabClick(item.id)}
          class="flex flex-col items-center gap-1.5 px-3 py-1 transition-all duration-300 relative {isTabActive(item.id) ? 'text-blue-600 dark:text-blue-400 scale-110' : 'text-slate-400 dark:text-slate-500'}"
        >
          <div class="relative">
            <item.icon class="w-5 h-5 {isTabActive(item.id) ? 'fill-blue-600/10' : ''}" />
            {#if item.count > 0}
              <div class="absolute -top-2 -right-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[8px] font-black px-1 rounded-full border border-white dark:border-slate-900">
                {item.count}
              </div>
            {/if}
            {#if isTabActive(item.id)}
              <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full" transition:fade></div>
            {/if}
          </div>
          <span class="text-[9px] font-black uppercase tracking-widest">{item.name}</span>
        </button>
      {:else}
        <!-- Links de Navegación Estándar -->
        <a 
          href={item.path} 
          class="flex flex-col items-center gap-1.5 px-3 py-1 transition-all duration-300 {activePath.startsWith(item.path) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}"
        >
          <item.icon class="w-5 h-5" />
          <span class="text-[9px] font-black uppercase tracking-widest">{item.name}</span>
        </a>
      {/if}
    {/each}
    
    <!-- Botón de Acción Rápida (Solo en Dashboard de Encargado o si es necesario) -->
    {#if user?.cod_rol === 'STORE_MANAGER' && isDashboard}
        <div class="absolute -top-10 left-1/2 -translate-x-1/2">
            <button class="bg-blue-600 text-white p-4 rounded-2xl shadow-2xl shadow-blue-600/40 active:scale-90 transition-all border-4 border-slate-50 dark:border-slate-950 group">
                <PlusCircle class="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
        </div>
    {/if}
  </div>
</nav>

<style>
  .pb-safe {
    padding-bottom: calc(env(safe-area-inset-bottom) + 0.75rem);
  }
</style>


