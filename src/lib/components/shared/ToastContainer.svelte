<script lang="ts">
    import { toast } from '$lib/state/toast.svelte';
    import { CheckCircle, AlertCircle, Info, X } from 'lucide-svelte';
    import { flip } from 'svelte/animate';
    import { fly } from 'svelte/transition';

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return CheckCircle;
            case 'error': return AlertCircle;
            case 'warning': return AlertCircle;
            default: return Info;
        }
    };

    const getStyles = (type: string) => {
        switch (type) {
            case 'success': 
                return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
            case 'error': 
                return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
            case 'warning': 
                return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
            default: 
                return 'bg-sky-500/10 border-sky-500/20 text-sky-400';
        }
    };
</script>

<div 
    class="fixed top-5 right-5 z-[100] flex flex-col gap-3 w-full max-w-sm pointer-events-none"
    role="region"
    aria-live="polite"
    aria-label="Notificaciones del sistema"
>
    {#each toast.toasts as t (t.id)}
        {@const Icon = getIcon(t.type)}
        <div 
            transition:fly={{ x: 100, duration: 250 }}
            class="glass-card flex gap-3 p-4 rounded-xl border pointer-events-auto items-start shadow-2xl backdrop-blur-md transition-all {getStyles(t.type)}"
        >
            <div class="flex-shrink-0 mt-0.5">
                <Icon class="w-5 h-5" />
            </div>
            
            <div class="flex-grow">
                <p class="text-xs font-bold leading-normal text-text-main dark:text-dark-text-main">
                    {t.message}
                </p>
            </div>

            <button 
                onclick={() => toast.dismiss(t.id)} 
                aria-label="Cerrar notificación" 
                class="flex-shrink-0 text-text-dim hover:text-text-main dark:hover:text-dark-text-main p-0.5 rounded transition-colors focus:outline-none focus:ring-1 focus:ring-current/30"
            >
                <X class="w-3.5 h-3.5" />
            </button>
        </div>
    {/each}
</div>
