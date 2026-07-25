<script lang="ts">
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	interface Release {
		artistName: string;
		title: string;
		releaseDate: string;
		type: 'album' | 'single';
		tidalLink: string;
	}

	let releases: Release[] = [];
	let currentIndex = 0;
	let isLoading = true;

	async function loadReleases() {
		try {
			const response = await fetch('/api/releases');
			const data = await response.json();
			if (data.releases) {
				releases = data.releases;
			}
		} catch (error) {
			console.error('Error loading releases:', error);
		} finally {
			isLoading = false;
		}
	}

	function nextRelease() {
		if (releases.length > 0) {
			currentIndex = (currentIndex + 1) % releases.length;
		}
	}

	function prevRelease() {
		if (releases.length > 0) {
			currentIndex = (currentIndex - 1 + releases.length) % releases.length;
		}
	}

	onMount(() => {
		loadReleases();
	});

	function getRelativeTime(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = date.getTime() - now.getTime();
		const isFuture = diffTime > 0;
		const diffDays = Math.floor(Math.abs(diffTime) / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return isFuture ? 'Tomorrow' : 'Yesterday';

		const label = (value: number, unit: string) =>
			isFuture
				? `in ${value} ${unit}${value !== 1 ? 's' : ''}`
				: `${value} ${unit}${value !== 1 ? 's' : ''} ago`;

		if (diffDays < 7) {
			return label(diffDays, 'day');
		} else if (diffDays < 30) {
			return label(Math.floor(diffDays / 7), 'week');
		} else {
			return label(Math.floor(diffDays / 30), 'month');
		}
	}
</script>

<div class="artists-widget">
	{#if isLoading}
		<div class="widget-empty">
			<p>Loading...</p>
		</div>
	{:else if releases.length > 0}
		{@const release = releases[currentIndex]}
		<div class="widget-content-wrapper">
			<button class="widget-nav" on:click={prevRelease}><p>P</p></button>

			<div class="widget-content">
				<div class="release-info">
					<h3 class="artist-name">{release.artistName}</h3>
					<span class="release-type">{release.type}</span>

					<p class="release-title">{release.title}</p>
					<p class="release-date">{getRelativeTime(release.releaseDate)}</p>
				</div>
				<a
					href={'https://' + release.tidalLink}
					target="_blank"
					rel="noopener noreferrer"
					class="listen-link">Listen</a
				>
				<a href={resolve('/dashboard')} class="dashboard-link">see thy artisans</a>
			</div>

			<button class="widget-nav" on:click={nextRelease}><p>N</p></button>
		</div>
	{:else}
		<div class="widget-empty">
			<p>No new releases</p>
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
		justify-content: start;
		margin-top: 0.25rem;
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
		font-size: 1.3rem;
		margin: 0;
		font-style: italic;
		white-space: wrap;
		overflow: hidden;
		text-overflow: ellipsis;
		padding: 0 1rem;
		line-height: 1.2;
		margin-top: 0.4rem;
	}

	.release-date {
		font-size: 1.1rem;
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
		/* margin-top: 1rem; */
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

	.widget-empty a {
		color: white;
		text-decoration: none;
		border-bottom: 1px solid white;
	}

	.widget-empty a:hover {
		color: rgb(219, 54, 54);
	}

	@media (max-width: 768px) {
		.artists-widget {
			width: 100%;
			max-width: none;
			border-left: none;
			border-right: none;
		}
	}
</style>
