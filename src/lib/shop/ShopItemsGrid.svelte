<script lang="ts">
	import ShopItemCard from './ShopItemCard.svelte';
	import type { ShopItemWithPurchases } from './types';

	let {
		items,
		points,
		onBuy,
		onDelete
	}: {
		items: ShopItemWithPurchases[];
		points: number;
		onBuy: (item: ShopItemWithPurchases) => void;
		onDelete: (id: number) => void;
	} = $props();
</script>

<div class="items-grid">
	{#each items as item (item.id)}
		<ShopItemCard {item} {points} {onBuy} {onDelete} />
	{/each}
</div>

{#if items.length === 0}
	<div class="empty-state">
		<p>No corruptions...</p>
	</div>
{/if}

<style>
	.items-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
		padding: 2rem;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: rgba(255, 255, 255, 0.7);
		font-size: 1.1rem;
		background: black;
		border: 3px solid white;
		margin: 2rem;
		border-radius: 2px;
	}

	.empty-state::before {
		content: '🛍';
		display: block;
		font-size: 2rem;
		margin-bottom: 1rem;
	}

	@media (max-width: 768px) {
		.items-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
			padding: 1rem;
		}
	}
</style>
