<script lang="ts">
	import ArtistPicker from '$lib/dashboard/ArtistPicker.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	}

	function getRelativeTime(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffTime = date.getTime() - now.getTime();
		const isFuture = diffTime > 0;
		const diffDays = Math.ceil(Math.abs(diffTime) / (1000 * 60 * 60 * 24));

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

<svelte:head>
	<title>Music Tracker Dashboard</title>
</svelte:head>

<div class="dashboard">
	<header>
		<h1>Music Tracker Dashboard</h1>
	</header>

	<div class="stats">
		<div class="stat-card">
			<div class="stat-value">{data.trackedArtists.length}</div>
			<div class="stat-label">Tracked Artists</div>
		</div>
		<div class="stat-card">
			<div class="stat-value">{data.releases.length}</div>
			<div class="stat-label">New Releases</div>
		</div>
	</div>

	<div class="releases-section">
		<h2>Recent Releases</h2>

		{#if data.releases.length === 0}
			<div class="empty-state">
				<p>No new releases in the past 3 months 😔</p>
				<p class="empty-subtitle">Check back later!</p>
			</div>
		{:else}
			<div class="releases-list">
				{#each data.releases as release (`${release.artistName}-${release.title}`)}
					<div class="release-card">
						<div class="release-info">
							<div class="release-header">
								<h3 class="release-title">{release.title}</h3>
								<span class="release-type">{release.type}</span>
							</div>
							<p class="artist-name">{release.artistName}</p>
							<div class="release-date">
								<span class="date-full">{formatDate(release.releaseDate)}</span>
								<span class="date-relative">• {getRelativeTime(release.releaseDate)}</span>
							</div>
						</div>
						<a
							href={release.tidalLink}
							target="_blank"
							rel="noopener noreferrer"
							class="tidal-link"
						>
							<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
								<path
									d="M12.012 3.992L8.008 7.996 12.012 12 8.008 16.004 4.004 12 8.008 7.996 4.004 3.992 0 7.996 4.004 12 8.008 16.004 12.012 12 16.016 16.004 12.012 20.008 16.016 24.012 20.02 20.008 16.016 16.004 20.02 12 16.016 7.996 20.02 3.992 24.024 7.996 20.02 12 16.016 16.004 12.012 12 16.016 7.996 12.012 3.992z"
								/>
							</svg>
							Listen on Tidal
						</a>
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<ArtistPicker bind:data />
</div>

<style>
	:global(body) {
		background: black;
	}

	.dashboard {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}

	.dashboard {
		min-height: 100vh;
		padding: 2rem;
		background: black;
		color: white;
		position: relative;
		overflow-x: hidden;
		font-family: 'Hangyaku';
	}

	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 3rem;
		gap: 2rem;
		padding: 2rem;
		border: 2px solid white;
		position: relative;
		background: black;
		font-size: 2.5rem;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.stat-card {
		border: 2px solid white;
		color: white;
		padding: 1rem;
		padding-bottom: 1.2rem;
		text-align: center;
		transition: all 0.3s ease;
	}

	.stat-value {
		font-size: 3rem;
		font-weight: 900;
		margin-bottom: 0rem;
		text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}

	.stat-label {
		font-size: 1.2rem;
		opacity: 0.95;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.releases-section {
		margin-bottom: 3rem;
	}

	h2 {
		font-size: 1.8rem;
		margin-bottom: 1.5rem;
		color: #ffffff;
		font-weight: 800;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		background: #1a1f3a;
		border-radius: 16px;
		border: 2px dashed #00ff88;
	}

	.empty-state p {
		font-size: 1.2rem;
		color: #8b96c9;
		margin-bottom: 0.5rem;
	}

	.empty-subtitle {
		font-size: 1rem;
		color: #00ff88;
		font-weight: 600;
	}

	.releases-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.release-card {
		display: flex;
		gap: 1.5rem;
		padding: 1.5rem;
		border: 2px solid white;
		transition: all 0.3s ease;
		position: relative;
		overflow: hidden;
	}

	.release-card:hover {
		transform: translateX(-4px);
		border-color: #00ff88;
	}

	.release-info {
		flex: 1;
		position: relative;
		z-index: 1;
	}

	.release-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 0.1rem;
	}

	.release-title {
		font-size: 1.7rem;
		margin: 0;
		color: #ffffff;
	}

	.release-type {
		padding: 0.1rem 0.6rem;
		background: linear-gradient(135deg, #00ff88 0%, #00cc66 100%);
		color: #0a0e27;
		font-size: 0.8rem;
		text-transform: uppercase;
		font-weight: 700;
		letter-spacing: 0.05em;
		box-shadow: 0 2px 8px rgba(0, 255, 136, 0.3);
	}

	.artist-name {
		font-size: 1.2rem;
		color: #00ff88;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	.release-date {
		font-size: 1rem;
		color: white;
		font-weight: 500;
	}

	.date-relative {
		color: #00ff88;
	}

	.tidal-link {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1.25rem;
		background: #000000;
		color: #ffffff;
		text-decoration: none;
		font-weight: 700;
		font-size: 0.9rem;
		transition: all 0.3s ease;
		white-space: nowrap;
		margin-left: auto;
		position: relative;
		z-index: 1;
		border: 1px solid #ffffff;
		/* 		box-shadow: 0 4px 12px rgba(0, 255, 136, 0.4); */
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.tidal-link:hover {
		color: #33ffaa;
	}

	.tidal-link svg {
		width: 20px;
		height: 20px;
	}

	@media (max-width: 768px) {
		.dashboard {
			padding: 1rem;
		}

		h1 {
			font-size: 2rem;
		}

		.release-card {
			flex-direction: column;
			text-align: center;
		}

		.tidal-link {
			margin: 1rem auto 0;
		}

		.release-header {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
