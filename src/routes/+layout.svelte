<script lang="ts">
	import './layout.css';

	import { onMount } from 'svelte';
	import { syncReferenceData } from '$lib/client/db';
	import ToastContainer from '$lib/components/shared/ToastContainer.svelte';
	import PwaInstallPrompt from '$lib/components/shared/PwaInstallPrompt.svelte';

	let { data, children } = $props();

	$effect(() => {
		if (data?.user) {
			localStorage.setItem('ticketflow_offline_role', data.user.cod_rol);
		}
	});

	onMount(() => {
		syncReferenceData();
	});
</script>

<svelte:head>
	<title>TicketFlow TI</title>
	<meta name="description" content="Sistema de gestión de incidencias y soporte técnico de TicketFlow." />
	<!-- Favicon principal desde static -->
	<link rel="icon" type="image/png" href="/favicon.png" />
	<!-- Soporte para Apple y PWA -->
	<link rel="apple-touch-icon" href="/favicon.png" />
	<link rel="manifest" href="/manifest.json" />
	
	<!-- Metatags específicos para iOS / Apple PWA -->
	<meta name="apple-mobile-web-app-capable" content="yes" />
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
	<meta name="apple-mobile-web-app-title" content="TicketFlow" />
	
	<meta name="theme-color" content="#3b82f6" />
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
</svelte:head>

<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-primary focus:text-white focus:font-bold">
	Saltar al contenido principal
</a>

<div class="app-root antialiased text-slate-900 dark:text-slate-100">
	{@render children()}
	
	<!-- Contenedores Globales de Toasts e Instalación PWA -->
	<ToastContainer />
	<PwaInstallPrompt />
</div>

<style>
	@reference "./layout.css";
</style>
