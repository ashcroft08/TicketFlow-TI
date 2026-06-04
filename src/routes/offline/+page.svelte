<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { WifiOff, Loader2 } from 'lucide-svelte';

    onMount(() => {
        const savedRole = localStorage.getItem('ticketflow_offline_role');
        if (savedRole) {
            if (savedRole === 'ADMIN') goto('/admin/dashboard');
            else if (savedRole === 'TECH') goto('/tecnico/dashboard');
            else if (savedRole === 'STORE_MANAGER') goto('/encargado/dashboard');
            else goto('/dashboard');
        } else {
            goto('/');
        }
    });
</script>

<div class="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-body p-6 text-center transition-colors duration-500">
    <WifiOff size={64} class="text-slate-400 dark:text-slate-500 mb-6" />
    <h1 class="text-2xl font-bold mb-2">Modo Sin Conexión</h1>
    <p class="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
        Estás abriendo la aplicación sin conexión a internet.
        Iniciando tu sesión guardada...
    </p>
    <Loader2 size={32} class="animate-spin text-primary" />
</div>
