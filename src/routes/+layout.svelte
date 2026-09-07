<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';

	import './layout.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Tracker</title>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}
