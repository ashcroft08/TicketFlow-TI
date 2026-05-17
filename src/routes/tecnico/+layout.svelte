<script lang="ts">
    import ModernNavbar from '$lib/components/shared/ModernNavbar.svelte';
    import MobileNav from '$lib/components/shared/MobileNav.svelte';
    import { page } from '$app/state';

    let { children, data } = $props();

    let isTicketView = $derived(page.route.id === '/tecnico/ticket/[id]');
    let isProfilePage = $derived(page.url.pathname.endsWith('/perfil'));
</script>

<div class="min-h-screen bg-bg-main dark:bg-dark-bg-main text-text-main dark:text-dark-text-main transition-colors duration-500 overflow-x-hidden">
    <ModernNavbar user={data.user} role="TECH" />

    <main id="main-content" tabindex="-1" class="focus:outline-none {isTicketView 
        ? 'fixed inset-0 pt-16 pb-[68px] overflow-hidden lg:static lg:h-auto lg:pt-24 lg:pb-8 lg:px-8 lg:max-w-[1400px] lg:mx-auto lg:overflow-visible' 
        : (isProfilePage ? 'pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto' : 'pt-20 pb-24 md:pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto')}">
        {@render children()}
    </main>

    {#if !isProfilePage}
        <MobileNav />
    {/if}
</div>


<style>
    @reference "../layout.css";
</style>
