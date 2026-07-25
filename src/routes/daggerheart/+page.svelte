<script lang="ts">
	import { PDFViewer, SpreadMode } from '@embedpdf/svelte-pdf-viewer';
	let count = $state(0);
	function onready(registry) {
		console.log('PDF viewer ready!', registry);
	}
</script>

<main>
	<h1>asd</h1>
	<PDFViewer
		config={{
			src: '/example.pdf',
			disabledCategories: [
				'annotation',
				'redaction',
				'document-open',
				'document-close',
				'document-protect',
				'panel-comment'
			],
			spread: { defaultSpreadMode: SpreadMode.None }
		}}
		style="height: 1000px; "
		{onready}
	/>
</main>

<style>
	main {
		width: 100%;
		height: 100%;
		background: black;
		padding: 6rem 20rem;
	}
</style>
