<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	interface Concert {
		artistName: string;
		eventName: string;
		date: string;
		city: string;
		venue: string;
		url: string;
	}

	let concerts: Concert[] = [];
	let currentIndex = 0;
	let isLoading = true;

	async function loadConcerts() {
		try {
			const response = await fetch('/api/concerts');
			const data = await response.json();
			if (data.concerts) {
				concerts = data.concerts;
			}
		} catch (error) {
			console.error('Error loading concerts:', error);
		} finally {
			isLoading = false;
		}
	}

	function nextConcert() {
		if (concerts.length > 0) {
			currentIndex = (currentIndex + 1) % concerts.length;
		}
	}

	function prevConcert() {
		if (concerts.length > 0) {
			currentIndex = (currentIndex - 1 + concerts.length) % concerts.length;
		}
	}

	onMount(() => {
		loadConcerts();
	});

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString(undefined, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="artists-widget">
	{#if isLoading}
		<div class="widget-empty">
			<p>Loading...</p>
		</div>
	{:else if concerts.length > 0}
		{@const concert = concerts[currentIndex]}
		<div class="widget-content-wrapper">
			<button class="widget-nav" on:click={prevConcert}><p>P</p></button>

			<div class="widget-content">
				<div class="release-info">
					<h3 class="artist-name">{concert.artistName}</h3>
					<span class="release-type">{concert.city}</span>

					<p class="release-title">{concert.eventName || concert.venue}</p>
					<p class="release-date">{formatDate(concert.date)}</p>
				</div>
				<a href={concert.url} target="_blank" rel="noopener noreferrer" class="listen-link"
					>Tickets</a
				>
				<a href={resolve('/dashboard')} class="dashboard-link">dashboard</a>
			</div>

			<button class="widget-nav" on:click={nextConcert}><p>N</p></button>
		</div>
	{:else}
		<div class="widget-empty">
			<p>No upcoming concerts</p>
			<a href={resolve('/dashboard')}>Dashboard →</a>
		</div>
	{/if}
</div>

<style>
	.artists-widget {
		background-color: black;
		width: 333px;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		border: 2px solid white;
		border-top: none;
		padding: 1rem;
		box-sizing: border-box;
		max-width: 333px;
	}

	.widget-content-wrapper {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		height: 100%;
		gap: 0rem;
	}

	.widget-nav {
		background: black;
		color: white;
		border: 2px solid white;
		font-size: 2.2rem;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: end;
		justify-content: center;
		cursor: pointer;
		flex-shrink: 0;
	}

	.widget-nav p {
		margin: 0;
		line-height: 1;
		font-family: 'Hangyaku';
	}

	.widget-nav:hover {
		background: white;
		color: black;
	}

	.widget-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		height: 100%;
		text-align: center;
		overflow: hidden;
		padding-bottom: 0.4rem;
	}

	.release-info {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
		justify-content: center;
	}

	.artist-name {
		font-size: 1.5rem;
		margin: 0;
		text-transform: uppercase;
		white-space: wrap;
		text-overflow: ellipsis;
		text-align: center;
	}

	.release-title {
		font-size: 1.2rem;
		margin: 0;
		font-style: italic;
		white-space: wrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding: 0 1rem;
	}

	.release-date {
		font-size: 0.9rem;
		margin: 0;
		opacity: 0.8;
	}

	.release-type {
		display: inline;
		border: 1px solid white;
		padding: 0.2rem 0.5rem;
		font-size: 0.8rem;
		text-transform: uppercase;
		margin: 0rem auto 0;
		width: fit-content;
	}

	.listen-link {
		color: black;
		background: white;
		text-decoration: none;
		font-size: 1.2rem;
		padding: 0.2rem 0.5rem;
		text-transform: uppercase;
		display: block;
		border: 1px solid black;
	}

	.listen-link:hover {
		background: black;
		color: white;
		border: 1px solid white;
	}

	.dashboard-link {
		color: white;
		text-decoration: none;
		font-size: 1rem;
		margin-top: 0.5rem;
		border-top: 1px solid white;
		padding-top: 0.5rem;
		align-self: center;
		width: 100%;
	}

	.dashboard-link:hover {
		color: rgb(219, 54, 54);
	}

	.widget-empty {
		text-align: center;
	}

	.widget-empty p {
		margin: 0 0 1rem 0;
	}
</style>
