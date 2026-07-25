<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	const { card } = data;
</script>

<main>
	<div class="container">
		<div class="back">
			<a href="/">← Back to Home</a>
		</div>

		<div class="card-content">
			<h1>{card.name}</h1>
			<div class="divider"></div>
			<p class="description">{card.desc}</p>
		</div>
	</div>
</main>

<style>
	main {
		width: 100%;
		min-height: 100vh;
		background: black;
		color: white;
		font-family: 'Hangyaku';
		padding: 2rem 0;
	}

	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 2rem;
		border: 2px solid white;
	}

	.back {
		margin-bottom: 2rem;
	}

	.back a {
		color: white;
		text-decoration: none;
		font-size: 1.2rem;
		transition: color 0.3s ease;
	}

	.back a:hover {
		color: rgb(219, 54, 54);
	}

	.card-content {
		text-align: left;
	}

	h1 {
		font-size: 3rem;
		margin: 0 0 1rem 0;
		border-bottom: 2px solid white;
		padding-bottom: 1rem;
	}

	.divider {
		height: 2px;
		background: white;
		margin: 2rem 0;
	}

	.description {
		font-size: 1.1rem;
		line-height: 1.8;
		color: rgba(255, 255, 255, 0.95);
	}
</style>
