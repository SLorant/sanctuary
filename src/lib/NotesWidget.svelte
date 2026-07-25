<script lang="ts">
	import { onMount } from 'svelte';

	interface Note {
		id?: number;
		content: string;
		createdAt?: string;
	}

	let notes: Note[] = [];
	let newNote = '';
	let isLoading = false;
	let showAddModal = false;

	async function loadNotes() {
		try {
			const response = await fetch('/api/notes');
			if (response.ok) {
				notes = await response.json();
			}
		} catch (error) {
			console.error('Failed to load notes:', error);
		}
	}

	async function addNote() {
		if (!newNote.trim()) return;

		isLoading = true;
		try {
			const response = await fetch('/api/notes', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ content: newNote })
			});

			if (response.ok) {
				const note = await response.json();
				notes = [note, ...notes];
				newNote = '';
				showAddModal = false;
			}
		} catch (error) {
			console.error('Failed to add note:', error);
		} finally {
			isLoading = false;
		}
	}

	async function deleteNote(id: number | undefined) {
		if (!id) return;

		try {
			const response = await fetch(`/api/notes/${id}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				notes = notes.filter((note) => note.id !== id);
			}
		} catch (error) {
			console.error('Failed to delete note:', error);
		}
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			addNote();
		}
	}

	onMount(() => {
		loadNotes();
	});
</script>

<div class="notes-widget">
	<div class="notes-header">
		<h2>keep in mind</h2>
		<button class="add-note-btn" on:click={() => (showAddModal = true)}>+</button>
	</div>

	{#if showAddModal}
		<div
			class="modal-overlay"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
			on:click={() => (showAddModal = false)}
			on:keydown={(e) => e.key === 'Escape' && (showAddModal = false)}
		>
			<div class="modal" on:click={(e) => e.stopPropagation()}>
				<h2 id="modal-title">Add Prophecy</h2>
				<input
					type="text"
					placeholder="Enter note"
					bind:value={newNote}
					on:keydown={handleKeydown}
					class="input-field"
					disabled={isLoading}
				/>
				<div class="modal-buttons">
					<button class="btn-cancel" on:click={() => (showAddModal = false)}>Cancel</button>
					<button class="btn-confirm" on:click={addNote} disabled={isLoading || !newNote.trim()}>
						{isLoading ? 'Saving...' : 'Save'}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<div class="notes-list">
		{#if notes.length === 0}
			<p class="empty-message">No notes yet</p>
		{:else}
			{#each notes as note (note.id)}
				<div class="note-item">
					<span class="note-content">{note.content}</span>
					<button class="delete-button" on:click={() => deleteNote(note.id)} title="Delete note">
						×
					</button>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.notes-widget {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		background-color: black;
		border: 2px solid white;
		padding: 1rem;
		box-sizing: border-box;
		color: white;
		font-family: 'Hangyaku';
		gap: 1rem;
		border-left: none;
		border-top: none;
		border-right: none;
	}

	.notes-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-shrink: 0;
	}

	h2 {
		margin: 0;
		font-size: 1.8rem;
		text-align: center;
		flex: 1;
	}

	.add-note-btn {
		padding: 0rem 0.8rem;
		background-color: black;
		border: 1px solid white;
		color: white;
		font-family: 'Hangyaku';
		cursor: pointer;
		font-size: 1.5rem;
		font-weight: bold;
		flex-shrink: 0;
	}

	.add-note-btn:hover {
		background-color: white;
		color: black;
	}

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
		border: 2px solid white;
		padding: 2rem;
		max-width: 400px;
		width: 90%;
	}

	.modal h2 {
		color: white;
		margin: 0 0 1.5rem 0;
		text-align: center;
		font-size: 1.8rem;
	}

	.input-field {
		width: 100%;
		padding: 0.6rem;
		margin-bottom: 1.5rem;
		background: black;
		border: 1px solid white;
		color: white;
		font-family: 'Hangyaku';
		font-size: 1.2rem;
		box-sizing: border-box;
	}

	.input-field::placeholder {
		color: rgba(255, 255, 255, 0.5);
	}

	.input-field:focus {
		outline: none;
	}

	.modal-buttons {
		display: flex;
		gap: 1rem;
	}

	.btn-cancel,
	.btn-confirm {
		flex: 1;
		padding: 0.6rem;
		border: 1px solid white;
		font-family: 'Hangyaku';
		cursor: pointer;
		font-size: 1.2rem;
	}

	.btn-cancel {
		background: black;
		color: white;
	}

	.btn-cancel:hover {
		background: white;
		color: black;
	}

	.btn-confirm {
		background: white;
		color: black;
	}

	.btn-confirm:hover:not(:disabled) {
		background: black;
		color: white;
		border-color: white;
	}

	.btn-confirm:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.notes-list {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.note-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.4rem;
		background-color: rgba(255, 255, 255, 0.05);
		border: 1px solid rgba(255, 255, 255, 0.2);
		font-size: 1.2rem;
		gap: 0.5rem;
	}

	.note-content {
		flex: 1;
		word-break: break-word;
	}

	.delete-button {
		background: none;
		border: none;
		color: white;
		font-size: 2rem;
		cursor: pointer;
		padding: 0;
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.delete-button:hover {
		color: rgb(219, 54, 54);
	}

	.empty-message {
		text-align: center;
		opacity: 0.5;
		margin: auto;
	}

	/* Scrollbar styling */
	.notes-list::-webkit-scrollbar {
		width: 6px;
	}

	.notes-list::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
	}

	.notes-list::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 3px;
	}

	.notes-list::-webkit-scrollbar-thumb:hover {
		background: rgba(255, 255, 255, 0.4);
	}
</style>
