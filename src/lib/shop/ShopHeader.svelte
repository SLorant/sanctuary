<script lang="ts">
	import { resolve } from '$app/paths';

	let { points, onAddItem }: { points: number; onAddItem: () => void } = $props();
</script>

<div class="header-section">
	<div>
		<h1 class="main-title">The Oracle</h1>
	</div>
	<div class="header-right">
		<a href={resolve('/tracking')} class="tracking-link">Ritual Board</a>
		<div class="points-display">
			<span class="points-label">Feathers:</span>
			<span class="points-number">{points}</span>
		</div>
		<button class="add-item-btn" onclick={onAddItem}>Add Corruption</button>
	</div>
</div>

<style>
	.header-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 3rem;
		gap: 2rem;
		padding: 2rem;
		border: 2px solid white;
		position: relative;
		background: black;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 2rem;
	}

	.points-display {
		display: flex;
		align-items: center;
		padding: 1rem 1.5rem;
		border: 2px solid white;
		background: black;
		gap: 0.5rem;
	}

	.points-label {
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: rgba(255, 255, 255, 0.8);
	}

	.points-number {
		font-size: 2.2rem;
		font-weight: bold;
		color: rgb(255, 255, 255);
		line-height: 0.8;
	}

	.main-title {
		font-size: 2.8rem;
		font-weight: 900;
		color: white;
		margin: 0;
		letter-spacing: 4px;
		font-style: italic;
		text-transform: uppercase;
	}

	.add-item-btn {
		padding: 0.9rem 2rem;
		color: black;
		background: white;
		border: 2px solid white;
		border-radius: 2px;
		font-size: 1.2rem;
		font-weight: 700;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 1px;
		position: relative;
		transition: all 0.2s ease;
	}

	.add-item-btn:hover {
		background: black;
		color: white;
	}

	.tracking-link {
		padding: 0.9rem 2rem;
		color: white;
		background: transparent;
		border: 2px solid white;
		border-radius: 2px;
		font-size: 1.2rem;
		font-weight: 700;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 1px;
		position: relative;
		text-decoration: none;
		transition: all 0.2s ease;
		display: inline-block;
	}

	.tracking-link:hover {
		background: white;
		color: black;
	}

	@media (max-width: 768px) {
		.header-section {
			flex-direction: column;
			margin-bottom: 2rem;
			gap: 1rem;
		}

		.main-title {
			font-size: 1.9rem;
			letter-spacing: 2px;
		}
	}
</style>
