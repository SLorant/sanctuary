<script lang="ts">
	import type { ShopItemWithPurchases } from './types';

	let {
		item,
		points,
		onBuy,
		onDelete
	}: {
		item: ShopItemWithPurchases;
		points: number;
		onBuy: (item: ShopItemWithPurchases) => void;
		onDelete: (id: number) => void;
	} = $props();

	let canAfford = $derived(points >= item.pointCost);
</script>

<div class="shop-item-card">
	<div class="item-header">
		<div>
			<h3 class="item-name">{item.name}</h3>
			<p class="item-cost">{item.pointCost} feathers</p>
		</div>
		<button class="delete-btn" onclick={() => onDelete(item.id)}>✕</button>
	</div>

	<div class="item-action">
		<button
			class="buy-btn {canAfford ? '' : 'disabled'}"
			onclick={() => onBuy(item)}
			disabled={!canAfford}
		>
			Ask
		</button>
		<div class="purchase-counter">
			<span class="counter-label">Bought:</span>
			<span class="counter-value">{item.purchaseCount}</span>
		</div>
	</div>
</div>

<style>
	.shop-item-card {
		background: black;
		border: 3px solid white;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.item-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid white;
	}

	.item-name {
		color: white;
		font-size: 1.8rem;
		font-weight: 700;
		margin: 0;
		letter-spacing: 1px;
	}

	.item-cost {
		color: rgba(255, 255, 255, 0.8);
		font-size: 1rem;
		margin: 0.3rem 0 0 0;
		font-weight: 600;
	}

	.delete-btn {
		background: white;
		color: black;
		border: 2px solid white;
		width: 32px;
		height: 32px;
		cursor: pointer;
		font-size: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: all 0.2s ease;
	}

	.delete-btn:hover {
		background: black;
		color: white;
	}

	.item-action {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.buy-btn {
		flex: 1;
		padding: 0.85rem 1.5rem;
		background: white;
		color: black;
		border: 2px solid white;
		border-radius: 2px;
		font-weight: 700;
		font-size: 1.1rem;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 1px;
		transition: all 0.2s ease;
	}

	.buy-btn:hover:not(.disabled) {
		background: black;
		color: white;
	}

	.buy-btn.disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: rgba(255, 255, 255, 0.3);
		color: rgba(0, 0, 0, 0.3);
	}

	.purchase-counter {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		padding: 0.5rem 1rem;
		background: rgba(255, 255, 255, 0.1);
		border: 2px solid white;
		border-radius: 2px;
		min-width: 100px;
	}

	.counter-label {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.counter-value {
		font-size: 1.8rem;
		font-weight: bold;
		color: white;
	}

	@media (max-width: 768px) {
		.item-action {
			flex-direction: column;
		}

		.buy-btn {
			width: 100%;
		}
	}
</style>
