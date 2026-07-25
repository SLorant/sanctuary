<script lang="ts">
	import { onMount } from 'svelte';
	import ShopHeader from '$lib/shop/ShopHeader.svelte';
	import AddItemModal from '$lib/shop/AddItemModal.svelte';
	import ShopItemsGrid from '$lib/shop/ShopItemsGrid.svelte';
	import type { ShopItem, ShopItemWithPurchases } from '$lib/shop/types';

	let items = $state<ShopItemWithPurchases[]>([]);
	let showAddModal = $state(false);
	let newItemName = $state('');
	let newItemCost = $state(10);
	let loading = $state(false);
	let points = $state(0);
	let errorMessage = $state('');

	onMount(async () => {
		await loadItems();
		await fetchPoints();
	});

	function flashError(message: string) {
		errorMessage = message;
		setTimeout(() => {
			errorMessage = '';
		}, 3000);
	}

	async function fetchPoints() {
		try {
			const response = await fetch('/api/points');
			const data = await response.json();
			points = data.points;
		} catch (error) {
			console.error('Failed to fetch points:', error);
		}
	}

	async function loadItems() {
		try {
			const response = await fetch('/api/shop');
			const data = await response.json();

			items = await Promise.all(
				data.map(async (item: ShopItem) => {
					const purchaseResponse = await fetch(`/api/shop/${item.id}/purchases`);
					const { count } = await purchaseResponse.json();
					return { ...item, purchaseCount: count };
				})
			);
		} catch (error) {
			console.error('Error loading items:', error);
		}
	}

	async function addItem() {
		if (!newItemName.trim() || newItemCost <= 0) {
			alert('Please fill in all fields with valid values');
			return;
		}

		loading = true;
		try {
			const response = await fetch('/api/shop', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: newItemName,
					pointCost: newItemCost
				})
			});

			if (response.ok) {
				newItemName = '';
				newItemCost = 10;
				showAddModal = false;
				await loadItems();
			} else {
				const error = await response.json();
				alert(error.error || 'Failed to add item');
			}
		} catch (error) {
			console.error('Error adding item:', error);
			alert('Failed to add item');
		} finally {
			loading = false;
		}
	}

	async function buyItem(item: ShopItemWithPurchases) {
		if (points < item.pointCost) {
			flashError(`Not enough points! You need ${item.pointCost} points but only have ${points}.`);
			return;
		}

		try {
			const response = await fetch(`/api/shop/${item.id}/purchases`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});

			if (response.ok) {
				const data = await response.json();
				points = data.remainingPoints;
				await loadItems();
				errorMessage = '';
			} else {
				const error = await response.json();
				flashError(error.error || 'Failed to purchase item');
			}
		} catch (error) {
			console.error('Error purchasing item:', error);
			flashError('Failed to purchase item');
		}
	}

	async function deleteItem(itemId: number) {
		if (!confirm('Are you sure you want to delete this item?')) return;

		try {
			const response = await fetch(`/api/shop/${itemId}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadItems();
			}
		} catch (error) {
			console.error('Error deleting item:', error);
		}
	}
</script>

<div class="shop-container">
	<ShopHeader {points} onAddItem={() => (showAddModal = true)} />

	{#if errorMessage}
		<div class="error-message">
			{errorMessage}
		</div>
	{/if}

	{#if showAddModal}
		<AddItemModal
			bind:name={newItemName}
			bind:cost={newItemCost}
			{loading}
			onCancel={() => (showAddModal = false)}
			onConfirm={addItem}
		/>
	{/if}

	<ShopItemsGrid {items} {points} onBuy={buyItem} onDelete={deleteItem} />
</div>

<style>
	.shop-container {
		min-height: 100vh;
		padding: 2rem;
		background: black;
		color: white;
		position: relative;
		overflow-x: hidden;
		font-family: 'Hangyaku';
	}

	.error-message {
		background: rgb(219, 54, 54);
		color: white;
		padding: 1rem 2rem;
		margin: 0 2rem 2rem 2rem;
		border: 2px solid rgb(219, 54, 54);
		border-radius: 2px;
		text-align: center;
		font-weight: 700;
		animation: slideIn 0.3s ease;
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.shop-container {
			padding: 1rem;
		}
	}
</style>
