<!-- RoleSelector v6 - Always Dark Background -->
<script lang="ts">
    import { ShieldCheck, Activity, Users, ChevronUp, ChevronDown } from 'lucide-svelte';
    import { page } from '$app/state';
    import { scale } from 'svelte/transition';

    let { variant = 'compact' } = $props<{ variant?: 'compact' | 'full' }>();

    let isOpen = $state(false);
    let activePath = $derived(page.url.pathname);

    const user = $derived(page.data.user);
    const isAdmin = $derived(user?.cod_rol === 'ADMIN');

    const roles = [
        { name: 'Administrador', path: '/admin/dashboard', icon: ShieldCheck, match: '/admin', color: 'text-indigo-400' },
        { name: 'Encargado', path: '/encargado/dashboard', icon: Users, match: '/encargado', color: 'text-emerald-400' },
        { name: 'Técnico', path: '/tecnico/dashboard', icon: Activity, match: '/tecnico', color: 'text-sky-400' }
    ];

    const currentRole = $derived(
        roles.find(r => activePath.startsWith(r.match)) || roles[0]
    );

    const otherRoles = $derived(
        roles.filter(r => !activePath.startsWith(r.match))
    );

    const toggle = (e: MouseEvent) => {
        e.stopPropagation();
        isOpen = !isOpen;
    };

    const closeMenu = () => isOpen = false;
</script>

<svelte:window onclick={closeMenu} />

{#if isAdmin}
    {#if variant === 'full'}
        <div class="relative w-full px-2 mt-auto mb-4">
            <p class="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 px-1 mb-2 italic">Entorno de Trabajo</p>
            
            <div class="relative">
                <!-- Main Button -->
                <button 
                    onclick={toggle}
                    class="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 transition-all group overflow-hidden {isOpen ? 'ring-2 ring-indigo-500/40 bg-slate-50 dark:bg-slate-800' : 'bg-slate-50/60 dark:bg-slate-800/60'}"
                >
                    <div class="flex items-center gap-2.5 relative z-10">
                        <div class="p-1.5 rounded-lg bg-indigo-500/20 {currentRole.color} group-hover:scale-110 transition-transform">
                            <currentRole.icon class="w-4 h-4" />
                        </div>
                        <div class="text-left">
                            <span class="block text-[11px] font-black text-slate-700 dark:text-slate-100 uppercase tracking-tight leading-none mb-1">{currentRole.name}</span>
                            <span class="block text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest italic">Sesión Activa</span>
                        </div>
                    </div>
                    
                    <div class="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
                        {#if isOpen}
                            <ChevronDown class="w-4 h-4" />
                        {:else}
                            <ChevronUp class="w-4 h-4" />
                        {/if}
                    </div>
                </button>

                {#if isOpen}
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <!-- svelte-ignore a11y_no_static_element_interactions -->
                    <div 
                        transition:scale={{ start: 0.95, duration: 150 }}
                        class="absolute bottom-full left-0 w-full mb-3 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] backdrop-blur-2xl bg-white dark:bg-slate-800"
                        onclick={e => e.stopPropagation()}
                    >
                        <div class="space-y-1">
                            {#each otherRoles as role}
                                <a 
                                    href={role.path}
                                    class="flex items-center gap-3 p-3 rounded-lg hover:bg-indigo-600 text-slate-700 dark:text-slate-200 hover:text-white transition-all group"
                                    onclick={() => isOpen = false}
                                >
                                    <div class="p-2 rounded-md bg-slate-100 dark:bg-slate-700 group-hover:bg-white/20 transition-colors {role.color} group-hover:text-white">
                                        <role.icon class="w-4 h-4" />
                                    </div>
                                    <span class="text-[10px] font-black uppercase tracking-widest group-hover:translate-x-1 transition-transform">{role.name}</span>
                                </a>
                            {/each}
                        </div>
                        
                        <!-- Separator -->
                        <div class="mt-1.5 pt-2 border-t border-slate-200 dark:border-slate-700 text-center pb-1">
                            <span class="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500">Cambiar Vista</span>
                        </div>
                    </div>
                {/if}
            </div>
        </div>
    {:else}
        <div class="w-full space-y-2 py-2 px-1">
            <div class="flex items-center gap-2 px-2 mb-1">
                <div class="h-px flex-1 bg-slate-200 dark:bg-white/5"></div>
                <span class="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 whitespace-nowrap">Cambiar Entorno</span>
                <div class="h-px flex-1 bg-slate-200 dark:bg-white/5"></div>
            </div>
            
            <div class="grid grid-cols-1 gap-1">
                {#each roles as role}
                    {@const isCurrent = activePath.startsWith(role.match)}
                    <a 
                        href={role.path}
                        class="flex items-center justify-between p-2 rounded-xl border transition-all group {isCurrent ? 'bg-indigo-500/10 border-indigo-500/30 ring-1 ring-indigo-500/20' : 'border-transparent hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/10'}"
                    >
                        <div class="flex items-center gap-2.5">
                            <div class="p-1.5 rounded-lg {isCurrent ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800 ' + role.color} group-hover:scale-105 transition-transform">
                                <role.icon class="w-3.5 h-3.5" />
                            </div>
                            <div class="text-left">
                                <span class="block text-[10px] font-black uppercase tracking-tight {isCurrent ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300'}">{role.name}</span>
                                {#if isCurrent}
                                    <span class="block text-[7px] font-bold text-indigo-500/60 uppercase tracking-widest italic">Activo ahora</span>
                                {/if}
                            </div>
                        </div>
                        {#if isCurrent}
                            <div class="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                        {/if}
                    </a>
                {/each}
            </div>
        </div>
    {/if}
{/if}


