<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import type { PageData } from '../../routes/dashboard/$types';

	export let data: PageData;

	let artistInput = '';
	let suggestions: Array<{ id: string; name: string }> = [];
	let showSuggestions = false;
	let isSearching = false;
	let searchTimeout: ReturnType<typeof setTimeout>;

	async function searchArtists(query: string) {
		if (!query || query.trim().length < 2) {
			suggestions = [];
			showSuggestions = false;
			return;
		}

		isSearching = true;
		try {
			const searchUrl = `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(query)}&fmt=json&limit=10`;
			const response = await fetch(searchUrl);
			const result = await response.json();

			if (result.artists && result.artists.length > 0) {
				suggestions = result.artists.map((artist: any) => ({
					id: artist.id,
					name: artist.name
				}));
				showSuggestions = true;
			} else {
				suggestions = [];
				showSuggestions = false;
			}
		} catch (error) {
			console.error('Error searching artists:', error);
			suggestions = [];
		} finally {
			isSearching = false;
		}
	}

	function handleInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			searchArtists(artistInput);
		}, 300);
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});

	async function selectArtist(artistName: string) {
		if (!browser) return;

		try {
			const response = await fetch('/api/artists', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: artistName })
			});

			if (response.ok) {
				// Reload the page to fetch new data
				goto(resolve('/dashboard'));
			} else if (response.status === 409) {
				console.warn('Artist already being tracked');
			} else {
				console.error('Failed to add artist');
			}
		} catch (error) {
			console.error('Error adding artist:', error);
		}

		artistInput = '';
		suggestions = [];
		showSuggestions = false;
	}

	async function removeArtist(artistName: string) {
		if (!browser) return;

		try {
			const response = await fetch('/api/artists', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name: artistName })
			});

			if (response.ok) {
				// Reload the page
				goto(resolve('/dashboard'));
			} else {
				console.error('Failed to remove artist');
			}
		} catch (error) {
			console.error('Error removing artist:', error);
		}
	}

	function handleClickOutside(event: MouseEvent) {
		const target = event.target as HTMLElement;
		if (!target.closest('.artist-picker')) {
			showSuggestions = false;
		}
	}

	onMount(() => {
		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div class="artist-picker-section">
	<h2>Manage Artists</h2>
	<div class="artist-picker">
		<div class="input-wrapper">
			<input
				type="text"
				bind:value={artistInput}
				on:input={handleInput}
				placeholder="Search for artists to track..."
				class="artist-input"
			/>
			{#if isSearching}
				<span class="loading-indicator">🔍</span>
			{/if}
		</div>

		{#if showSuggestions && suggestions.length > 0}
			<div class="suggestions">
				{#each suggestions as suggestion (suggestion.id)}
					<button class="suggestion-item" on:click={() => selectArtist(suggestion.name)}>
						{suggestion.name}
					</button>
				{/each}
			</div>
		{/if}
	</div>

	{#if data.trackedArtists.length > 0}
		<div class="tracked-artists-list">
			{#each data.trackedArtists as artist (artist)}
				<div class="artist-chip">
					<span>{artist}</span>
					<button class="remove-btn" on:click={() => removeArtist(artist)}><p>x</p></button>
				</div>
			{/each}
		</div>
	{/if}
</div>

<style>
	.artist-picker-section {
		padding: 2rem;
		border: 2px solid white;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
		margin-bottom: 2rem;
	}

	.artist-picker-section h2 {
		font-size: 1.5rem;
		margin-bottom: 1.5rem;
		color: #ffffff;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.artist-picker {
		position: relative;
		margin-bottom: 1.5rem;
	}

	.input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.artist-input {
		width: 100%;
		padding: 1rem 1.5rem;
		font-size: 1.1rem;
		border: 1px solid white;
		color: #ffffff;
		outline: none;
		transition: all 0.3s ease;
		font-family: inherit;
	}

	.artist-input::placeholder {
		color: #8b96c9;
	}

	.artist-input:focus {
		border-color: #00ff88;
	}

	.loading-indicator {
		position: absolute;
		right: 1.5rem;
		font-size: 1.2rem;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.suggestions {
		position: absolute;
		top: calc(100% + 0.5rem);
		left: 0;
		right: 0;
		background: black;
		border: 2px solid white;
		border-radius: 12px;
		max-height: 300px;
		overflow-y: auto;
		z-index: 100;
	}

	.suggestion-item {
		width: 100%;
		padding: 1rem 1.5rem;
		text-align: left;
		background: transparent;
		border: none;
		color: #ffffff;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 1rem;
		border-bottom: 1px solid rgba(45, 53, 88, 0.5);
	}

	.suggestion-item:last-child {
		border-bottom: none;
	}

	.suggestion-item:hover {
		background: linear-gradient(135deg, rgba(0, 255, 136, 0.2) 0%, rgba(0, 204, 102, 0.2) 100%);
		color: #00ff88;
	}

	.tracked-artists-list {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.artist-chip {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: black;
		color: #ffffff;
		border: 1px solid white;
		transition: all 0.3s ease;
	}

	.remove-btn {
		background: rgba(255, 255, 255, 0.2);
		border: none;
		color: #ffffff;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		cursor: pointer;
		font-size: 1.2rem;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0;
		transition: all 0.2s ease;
	}
	.remove-btn p {
		margin: 0;
		line-height: 0.5;
		margin-bottom: 4px;
		font-weight: 400;
	}

	.remove-btn:hover {
		transform: scale(1.1);
	}
</style>
