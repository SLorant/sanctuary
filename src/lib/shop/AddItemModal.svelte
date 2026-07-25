<script lang="ts">
	let {
		name = $bindable(''),
		cost = $bindable(10),
		loading = false,
		onCancel,
		onConfirm
	}: {
		name: string;
		cost: number;
		loading?: boolean;
		onCancel: () => void;
		onConfirm: () => void;
	} = $props();
</script>

<div
	class="modal-overlay"
	role="dialog"
	aria-modal="true"
	aria-labelledby="modal-title"
	onclick={onCancel}
	onkeydown={(e) => e.key === 'Escape' && onCancel()}
>
	<div class="modal" onclick={(e) => e.stopPropagation()}>
		<h2 id="modal-title">Add Corruption</h2>
		<input type="text" placeholder="name" bind:value={name} class="input-field" />
		<div class="cost-input-group">
			<label for="cost-input">Feathers Cost:</label>
			<input id="cost-input" type="number" min="1" bind:value={cost} class="input-field" />
		</div>
		<div class="modal-buttons">
			<button class="btn-cancel" onclick={onCancel}>Cancel</button>
			<button class="btn-confirm" onclick={onConfirm} disabled={loading}>
				{loading ? 'Adding...' : 'Add'}
			</button>
		</div>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.85);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal {
		background: black;
		border: 4px solid white;
		border-radius: 2px;
		padding: 2.5rem;
		max-width: 450px;
		width: 95%;
		position: relative;
	}

	.modal h2 {
		color: white;
		margin: 1rem 0 2rem 0;
		text-align: center;
		font-size: 1.8rem;
		letter-spacing: 2px;
	}

	.input-field {
		width: 100%;
		padding: 0.8rem;
		margin-bottom: 1.2rem;
		background: black;
		border: 2px solid white;
		border-radius: 1px;
		color: white;
		font-size: 1.2rem;
	}

	.input-field::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	.input-field:focus {
		outline: none;
		border-color: white;
	}

	.cost-input-group {
		margin-bottom: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.cost-input-group label {
		color: white;
		font-size: 1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.modal-buttons {
		display: flex;
		gap: 1.2rem;
		margin-top: 2rem;
	}

	.btn-cancel,
	.btn-confirm {
		flex: 1;
		padding: 0.85rem;
		border: 2px solid white;
		border-radius: 2px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 1.2rem;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.btn-cancel {
		background: black;
		color: white;
	}

	.btn-confirm {
		background: white;
		color: black;
	}

	.btn-confirm:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
