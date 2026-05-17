<script lang="ts">
    import { page } from '$app/state';
    import { Home, ArrowLeft, Ghost, Search, AlertCircle } from 'lucide-svelte';
    import { fade, fly } from 'svelte/transition';

    let { data } = $props();

    let status = $derived(page.status);
    let message = $derived(page.error?.message || 'La página que buscas no existe o ha sido movida.');

    const getDashboardPath = () => {
        const user = data?.user;
        if (!user) return '/';
        
        switch (user.cod_rol) {
            case 'ADMIN': return '/admin/dashboard';
            case 'TECH': return '/tecnico/dashboard';
            case 'STORE_MANAGER': return '/encargado/dashboard';
            default: return '/';
        }
    };
</script>

<svelte:head>
    <title>{status} - Error | TicketFlow TI</title>
</svelte:head>

<main id="main-content" tabindex="-1" class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-50 dark:bg-[#020617] focus:outline-none">
    <!-- Ambient Background Effects -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full"></div>
        <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full"></div>
    </div>

    <div class="max-w-md w-full relative z-10 text-center" in:fly={{ y: 20, duration: 800 }}>
        <!-- Illustration Area -->
        <div class="relative mb-8 inline-block">
            <div class="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
            <div class="relative bg-white dark:bg-slate-900 w-24 h-24 rounded-3xl shadow-2xl flex items-center justify-center border border-slate-200 dark:border-white/10 mx-auto">
                {#if status === 404}
                    <Ghost class="w-12 h-12 text-primary" />
                {:else}
                    <AlertCircle class="w-12 h-12 text-error" />
                {/if}
            </div>
        </div>

        <!-- Error Code -->
        <div class="mb-2">
            <span class="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-indigo-600 tracking-tighter">
                {status}
            </span>
        </div>

        <!-- Error Description -->
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            {status === 404 ? '¡Ups! Página perdida' : 'Algo salió mal'}
        </h1>
        <p class="text-slate-500 dark:text-slate-400 mb-10 text-sm leading-relaxed max-w-[280px] mx-auto">
            {message}
        </p>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
                onclick={() => history.back()}
                class="w-full sm:w-auto px-6 py-3 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 font-bold text-[11px] uppercase tracking-widest hover:bg-white dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary"
            >
                <ArrowLeft class="w-4 h-4" />
                Volver Atrás
            </button>
            
            <a 
                href={getDashboardPath()}
                class="w-full sm:w-auto btn-primary px-8 py-3 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
                <Home class="w-4 h-4" />
                Ir al Inicio
            </a>
        </div>


    </div>
</main>

<style>
    @reference "./layout.css";

    :global(body) {
        margin: 0;
        padding: 0;
    }
</style>
