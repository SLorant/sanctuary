<script lang="ts">
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<title>Sanctuary</title>
	<link
		rel="icon"
		href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🐦‍⬛</text></svg>"
	/>
</svelte:head>

{@render children()}

<style is:global>
	@font-face {
		font-family: 'Hangyaku';
		src: url('/Hangyaku.ttf');
	}

	* {
		overflow-y: hidden;
	}

	@media (max-width: 768px) {
		* {
			overflow-y: visible;
		}
	}
</style>
