<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	import { onMount } from 'svelte';
	import { syncReferenceData } from '$lib/client/db';

	let { children } = $props();

	onMount(() => {
		syncReferenceData();
	});
</script>

<svelte:head>
	<link rel="icon" href="/favicon.png" />
	<link rel="manifest" href="/manifest.json" />
	<meta name="theme-color" content="#3b82f6" />
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
</svelte:head>

{@render children()}
