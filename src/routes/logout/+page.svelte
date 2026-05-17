<script>
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    
    onMount(() => {
        // Fallback en caso de que la acción falle o se acceda por GET
        goto('/');
    });
</script>

<main id="main-content" aria-live="polite" class="min-h-screen flex items-center justify-center bg-slate-950 text-white font-bold uppercase tracking-widest text-xs">
    Cerrando sesión...
</main>
