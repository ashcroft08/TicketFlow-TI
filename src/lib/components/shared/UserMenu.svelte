<script lang="ts">
    import { LogOut, User, ChevronDown, Settings } from 'lucide-svelte';
    import { fade, scale } from 'svelte/transition';
    import { enhance } from '$app/forms';
    import RoleSelector from './RoleSelector.svelte';

    let { user } = $props();
    let isOpen = $state(false);

    const getProfilePath = () => {
        if (!user) return '/';
        switch (user.cod_rol) {
            case 'ADMIN': return '/admin/perfil';
            case 'TECH': return '/tecnico/perfil';
            case 'STORE_MANAGER': return '/encargado/perfil';
            default: return '/';
        }
    };

    const toggle = (e: MouseEvent) => {
        e.stopPropagation();
        isOpen = !isOpen;
    };

    const close = () => isOpen = false;
</script>

<svelte:window onclick={close} />

<div class="relative">
    <button 
        onclick={toggle}
        class="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all border border-transparent hover:border-slate-200 dark:hover:border-white/10"
    >
        <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center font-black text-primary text-xs border border-primary/30">
            {user?.nombre?.[0]}
        </div>
        <ChevronDown class="w-4 h-4 text-slate-500 transition-transform {isOpen ? 'rotate-180' : ''}" />
    </button>

    {#if isOpen}
        <div 
            transition:scale={{ start: 0.95, duration: 150 }}
            class="absolute top-full right-0 mt-3 w-72 glass-card rounded-2xl shadow-2xl z-[100] overflow-hidden border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900"
            onclick={e => e.stopPropagation()}
        >
            <!-- User Info Header -->
            <div class="p-5 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary text-base">
                        {user?.nombre?.[0]}
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{user?.nombre}</p>
                        <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                    </div>
                </div>
            </div>

            <div class="p-2 space-y-0.5">
                <!-- Role Switching (Only for Admin) -->
                <RoleSelector />

                {#if user?.cod_rol !== 'ADMIN'}
                    <div class="h-px bg-slate-200 dark:bg-white/5 my-2 mx-2"></div>

                    <a 
                        href={getProfilePath()} 
                        class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all group"
                    >
                        <Settings class="w-4 h-4 opacity-50 group-hover:opacity-100" />
                        <span class="text-xs font-bold uppercase tracking-widest">Mi Perfil</span>
                    </a>

                    <form action="/?/logout" method="POST" use:enhance>
                        <button 
                            type="submit"
                            class="w-full flex items-center gap-3 px-3 py-2.5 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all font-bold text-[10px] uppercase tracking-widest"
                        >
                            <LogOut class="w-4 h-4" />
                            Cerrar Sesión
                        </button>
                    </form>
                {/if}
            </div>
        </div>
    {/if}
</div>
