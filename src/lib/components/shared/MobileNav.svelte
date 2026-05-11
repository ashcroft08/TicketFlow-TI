<script lang="ts">
  import { page } from '$app/state';
  import { LayoutDashboard, Ticket, User, PlusCircle } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  let activePath = $derived(page.url.pathname);
  const isActive = (path: string) => activePath.startsWith(path);

  let user = $derived(page.data.user);

  const getProfilePath = () => {
    if (!user) return '/';
    switch (user.cod_rol) {
      case 'ADMIN': return '/admin/perfil';
      case 'TECH': return '/tecnico/perfil';
      case 'STORE_MANAGER': return '/encargado/perfil';
      default: return '/';
    }
  };

  const navItems = $derived([
    { name: 'Inicio', icon: LayoutDashboard, path: user?.cod_rol === 'ADMIN' ? '/admin/dashboard' : (user?.cod_rol === 'TECH' ? '/tecnico/dashboard' : '/encargado/dashboard') },
    { name: 'Tickets', icon: Ticket, path: user?.cod_rol === 'ADMIN' ? '/admin/tickets' : (user?.cod_rol === 'TECH' ? '/tecnico/ticket' : '/encargado/ticket') },
    { name: 'Perfil', icon: User, path: getProfilePath() }
  ]);
</script>

<nav class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-glass-bg dark:bg-dark-glass-bg backdrop-blur-xl border-t border-border dark:border-dark-border px-4 pb-safe-offset-2 pt-2 shadow-2xl">
  <div class="flex items-center justify-around max-w-md mx-auto">
    {#each navItems as item}
      <a 
        href={item.path} 
        class="flex flex-col items-center gap-1 p-2 transition-all duration-200 {isActive(item.path) ? 'text-primary' : 'text-text-muted dark:text-dark-text-muted'}"
      >
        <div class="relative">
          <item.icon class="w-5 h-5" />
          {#if isActive(item.path)}
            <div 
              class="absolute -top-1 -right-1 w-1.5 h-1.5 bg-primary rounded-full"
              transition:fade
            ></div>
          {/if}
        </div>
        <span class="text-[10px] font-bold uppercase tracking-tighter">{item.name}</span>
      </a>
    {/each}
    
    <!-- Botón de Acción Rápida (Ej: Nuevo Ticket) -->
    <button class="flex flex-col items-center gap-1 p-2 text-primary">
      <div class="bg-primary text-white p-2 rounded-full shadow-lg shadow-primary/30 active:scale-90 transition-transform">
        <PlusCircle class="w-6 h-6" />
      </div>
    </button>
  </div>
</nav>

<style>
  .pb-safe-offset-2 {
    padding-bottom: calc(env(safe-area-inset-bottom) + 0.5rem);
  }
</style>
