<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { WifiOff, Loader2, ArrowLeft } from 'lucide-svelte';

    let isColdBoot = $state(true);
    let targetDashboard = $state('/');

    onMount(() => {
        const currentPath = window.location.pathname;
        const savedRole = localStorage.getItem('ticketflow_offline_role');
        
        if (savedRole) {
            if (savedRole === 'ADMIN') targetDashboard = '/admin/dashboard';
            else if (savedRole === 'TECH') targetDashboard = '/tecnico/dashboard';
            else if (savedRole === 'STORE_MANAGER') targetDashboard = '/encargado/dashboard';
            else targetDashboard = '/dashboard';
        }

        // Si la URL es la raíz (/), significa que la app se abrió desde cero (cold boot).
        // En este caso, sí redirigimos al dashboard.
        if (currentPath === '/') {
            goto(targetDashboard);
        } else {
            // Si la URL es diferente a /, significa que el usuario intentó navegar
            // a una página no cacheada y el Service Worker le entregó esta página fallback.
            // Para evitar un bucle de redirección, detenemos la carga automática.
            isColdBoot = false;
        }
    });
</script>

<div id="main-content" class="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white font-body p-6 text-center transition-colors duration-500">
    <WifiOff size={64} class="text-slate-400 dark:text-slate-500 mb-6" />
    <h1 class="text-2xl font-bold mb-2">Modo Sin Conexión</h1>
    
    {#if isColdBoot}
        <p class="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
            Estás abriendo la aplicación sin conexión a internet.
            Iniciando tu sesión guardada...
        </p>
        <Loader2 size={32} class="animate-spin text-primary" />
    {:else}
        <p class="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
            Parece que intentaste acceder a una página que no está disponible sin conexión. 
            Vuelve a conectarte a internet para verla o regresa a tu panel principal.
        </p>
        <a 
            href={targetDashboard} 
            class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
        >
            <ArrowLeft size={20} />
            Volver al Panel
        </a>
    {/if}
</div>
