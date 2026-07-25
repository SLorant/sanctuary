<script lang="ts">
	import { onMount } from 'svelte';

	interface Quote {
		content: string;
	}

	let quote: Quote | null = $state(null);

	async function fetchQuote() {
		try {
			const response = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/today');
			const data = await response.json();
			quote = {
				content: data.text
			};
		} catch (error) {
			console.error('Failed to fetch quote:', error);
		}
	}

	onMount(() => {
		fetchQuote();
	});
</script>

<div class="quote">
	{#if quote}
		<div class="quote-body">
			<p class="quote-text">"{quote.content}"</p>
			<!-- <p class="quote-author">— {quote.author}</p> -->
		</div>
	{:else}
		<p class="loading">Loading quote...</p>
	{/if}
	<img class="quotetarot" src="/tarot2.gif" alt="" />
	<img class="quotecrow" src="/crow.jpg" alt="" />
</div>

<style>
	.quote {
		background-color: black;
		border: 2px solid white;
		grid-column: 1 / 4;
		position: relative;
		display: flex;
		align-items: center;
		padding: 1.4rem 2rem;
		overflow: hidden;
	}

	.quote-body {
		width: 100%;
	}

	.quotecrow {
		position: absolute;
		right: 2rem;
		top: 50%;
		transform: translateY(-50%);
		width: 80px;
	}

	.quotetarot {
		position: absolute;
		left: 2rem;
		top: 50%;
		transform: translateY(-50%);
		width: 60px;
	}

	.quote-text {
		font-size: 1.6rem;
		font-style: italic;
		text-align: center;
		line-height: 1;
		margin-bottom: 0rem;
	}

	.quote-author {
		width: 100%;
		font-size: 1.3rem;
		text-align: right;
		margin: 0;
		opacity: 0.8;
	}

	.loading {
		text-align: center;
		opacity: 0.7;
	}

	@media (max-width: 768px) {
		.quote {
			border-left: none;
			border-right: none;
		}
	}
</style>
