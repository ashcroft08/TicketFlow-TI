<script lang="ts">
	import './layout.css';
	import faviconIco from '$lib/assets/img/TicketFlow_logo_modo_claro.ico';

	import { onMount } from 'svelte';
	import { syncReferenceData } from '$lib/client/db';

	let { children } = $props();

	onMount(() => {
		syncReferenceData();
	});
</script>

<svelte:head>
	<link rel="icon" href={faviconIco} />
	<link rel="manifest" href="/manifest.json" />
	<meta name="theme-color" content="#3b82f6" />
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
</svelte:head>

{@render children()}

<style>
	@reference "./layout.css";
</style>
