<!-- Updated RoleSwitcher v3 -->
<script lang="ts">
    import { ShieldCheck, Activity, Users, ChevronUp, ChevronDown } from 'lucide-svelte';
    import { page } from '$app/state';
    import { fade, scale } from 'svelte/transition';

    let isOpen = $state(false);
    let activePath = $derived(page.url.pathname);

    const roles = [
        { name: 'Administrador', path: '/admin/dashboard', icon: ShieldCheck, match: '/admin', color: 'text-primary' },
        { name: 'Personal Técnico', path: '/tecnico/dashboard', icon: Activity, match: '/tecnico', color: 'text-indigo-400' },
        { name: 'Gestor Operativo', path: '/encargado/dashboard', icon: Users, match: '/encargado', color: 'text-emerald-400' }
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

    // Cerrar al hacer click fuera
    const closeMenu = () => isOpen = false;
</script>

<svelte:window onclick={closeMenu} />

<div class="relative w-full px-2 mt-auto mb-4">
    <p class="text-[9px] font-black uppercase tracking-[0.2em] text-text-dim px-1 mb-2 opacity-50">Entorno de Trabajo</p>
    
    <div class="relative">
        <button 
            onclick={toggle}
            class="w-full flex items-center justify-between p-2.5 rounded-xl glass-card border-white/10 hover:border-primary/30 transition-all group overflow-hidden {isOpen ? 'ring-2 ring-primary/20 bg-primary/5' : ''}"
        >
            <div class="flex items-center gap-2.5 relative z-10">
                <div class="p-1.5 rounded-lg bg-primary/10 {currentRole.color} group-hover:scale-110 transition-transform">
                    <currentRole.icon class="w-3.5 h-3.5" />
                </div>
                <div class="text-left">
                    <span class="block text-[10px] font-bold text-text-main dark:text-dark-text-main uppercase tracking-tight leading-none mb-0.5">{currentRole.name}</span>
                    <span class="block text-[8px] font-medium text-text-dim uppercase tracking-widest opacity-70 italic">Sesión Activa</span>
                </div>
            </div>
            
            <div class="text-text-dim group-hover:text-primary transition-colors">
                {#if isOpen}
                    <ChevronDown class="w-3.5 h-3.5" />
                {:else}
                    <ChevronUp class="w-3.5 h-3.5" />
                {/if}
            </div>

            <!-- Subtle Glow -->
            <div class="absolute -right-4 -top-4 w-12 h-12 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all duration-700"></div>
        </button>

        {#if isOpen}
            <div 
                transition:scale={{ start: 0.95, duration: 150 }}
                class="absolute bottom-full left-0 w-full mb-2 p-1.5 glass-card border-white/10 shadow-2xl z-[100] backdrop-blur-xl"
            >
                <div class="space-y-1">
                    {#each otherRoles as role}
                        <a 
                            href={role.path}
                            class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-primary/10 text-text-dim hover:text-text-main transition-all group"
                            onclick={() => isOpen = false}
                        >
                            <div class="p-1.5 rounded-md bg-white/5 group-hover:bg-primary/20 transition-colors {role.color}">
                                <role.icon class="w-3.5 h-3.5" />
                            </div>
                            <span class="text-[10px] font-bold uppercase tracking-tight">{role.name}</span>
                        </a>
                    {/each}
                </div>
                
                <!-- Separador decorativo -->
                <div class="mt-1.5 pt-1.5 border-t border-white/5 text-center">
                    <span class="text-[7px] font-black uppercase tracking-widest text-text-dim opacity-30">Cambiar Contexto Operativo</span>
                </div>
            </div>
        {/if}
    </div>
</div>

<style>
    @reference "../../../routes/layout.css";
</style>
