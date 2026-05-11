<script lang="ts">
    import ModernNavbar from '$lib/components/shared/ModernNavbar.svelte';
    import { page } from '$app/state';

    let { children, data } = $props();
</script>

<div class="min-h-screen bg-bg-main dark:bg-dark-bg-main text-text-main dark:text-dark-text-main transition-colors duration-500">
    <ModernNavbar user={data.user} role="TECH" />

    <main class="pt-20 pb-24 md:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {@render children()}
    </main>
</div>

<style>
    @reference "../layout.css";
</style>
