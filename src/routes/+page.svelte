<script lang="ts">
	import { onMount } from 'svelte';
	import HabitWidget from '$lib/HabitWidget.svelte';
	import ArtistsWidget from '$lib/ArtistsWidget.svelte';
	import NotesWidget from '$lib/NotesWidget.svelte';
	import MoonWidget from '$lib/MoonWidget.svelte';
	import { habitToggled } from '$lib/habitToggleStore';
	import { resolve } from '$app/paths';
	import QuoteWidget from '$lib/QuoteWidget.svelte';
	import type { PageData } from './$types';

	export let data: PageData;

	const links = [
		'banking',
		'red',
		'torrent',
		'notes',
		'navidrome',
		'photos',
		'sync',
		'tools',
		'utils',
		'cloud',
		'media',
		'filebrowser',
		'radarr',
		'stats',
		'sonarr',
		'prowlarr'
	];

	let showAnimation = false;
	let animationTrigger = 0;
	let points: number = 0;

	async function fetchPoints() {
		try {
			const response = await fetch('/api/points');
			const data = await response.json();
			points = data.points;
		} catch (error) {
			console.error('Failed to fetch points:', error);
		}
	}

	onMount(() => {
		fetchPoints();

		let isFirstEmit = true;
		const unsubscribe = habitToggled.subscribe(() => {
			if (isFirstEmit) {
				isFirstEmit = false;
				return;
			}
			showAnimation = true;
			animationTrigger++;
			fetchPoints();
			setTimeout(() => {
				showAnimation = false;
			}, 1500);
		});

		return unsubscribe;
	});
</script>

<main>
	<div class="grid">
		<QuoteWidget />

		<div class="links">
			{#each links as link (link)}
				<div>
					<a href={`https://${link}.morn.onl`} target="_blank" rel="noopener noreferrer">{link}</a>
				</div>
			{/each}
		</div>

		<MoonWidget />

		<div class="points">
			<div class="pp">
				<h2>Feathers</h2>
				<p class="points-value">{points}</p>
			</div>
			<a href={resolve('/shop')} class="habit-link">see the Oracle</a>
		</div>

		<HabitWidget />

		<div class="middle">
			{#if showAnimation}
				<img class="middleimg" src="croc3.gif?t={animationTrigger}" alt="" />
			{:else}
				<img class="middleimg" src="croc11.jpg" alt="" />
			{/if}
		</div>

		<div class="trackers">
			<!-- <WaterIntakeWidget /> -->
			<img class="cp" src={data.galleryImage} alt="" />
		</div>

		<div class="notes">
			<NotesWidget />
		</div>

		<div class="artists">
			<ArtistsWidget />
		</div>
	</div>
</main>

<style>
	main {
		width: 100%;
		height: 100vh;
		background: black;
		padding: 2rem 0rem;
		padding-bottom: 2rem;
		color: white;
		font-family: 'Hangyaku';
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		grid-template-rows: 140px 1fr 2fr repeat(2, 1fr);
		grid-column-gap: 0px;
		grid-row-gap: 0px;
		height: 960px;
		width: 1000px;
		margin: 0 auto;
	}

	@media (max-width: 768px) {
		main {
			height: auto;
			min-height: 100vh;
		}

		.grid {
			display: flex;
			flex-direction: column;
			width: 100%;
			height: auto;
			margin: 0;
		}

		.links,
		.points,
		.middle,
		.trackers,
		.notes,
		.artists {
			width: 100%;
			max-width: none;
		}

		.links {
			aspect-ratio: 333.33 / 492;
			overflow-y: auto;
			border-left: none;
			border-right: none;
		}

		.points {
			aspect-ratio: 333.33 / 164;
			border-left: none;
			border-right: none;
		}

		.middle {
			aspect-ratio: 333.33 / 328;
			overflow: hidden;
		}

		.middle :global(img) {
			max-width: 100%;
			max-height: 100%;
			object-fit: contain;
		}

		.trackers {
			aspect-ratio: 1 / 1;
			border-left: none;
			border-right: none;
		}

		.notes {
			aspect-ratio: 333.33 / 328;
		}

		.artists {
			aspect-ratio: 1 / 1;
		}
	}

	.links {
		display: flex;
		flex-direction: column;
		background-color: black;
		grid-row: 2 / 4;
		font-size: 1.8rem;
		flex-wrap: wrap;
		padding: 2rem;
		border: 2px solid white;
		border-top: none;
		text-align: left;
	}

	.links a:hover {
		color: rgb(219, 54, 54);
	}

	.middle {
		grid-row: 3;
		/* 	aspect-ratio: 1/1; */
		display: flex;
		justify-content: end;
		align-items: end;
		border-bottom: 2px solid white;
	}
	.points {
		background-color: black;
		border: 2px solid white;
		border-top: none;
		grid-row: 2;
		grid-column: 3;
		text-align: center;
		font-size: 2rem;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 0 3rem;
		/* padding-top: 1rem; */
	}

	.points-value {
		font-size: 4rem;
		font-weight: bold;
		margin: 0;
		color: white;
		line-height: 1;
	}
	.pp {
		display: flex;
		justify-content: space-between;
		align-items: end;
		width: 100%;
	}

	.artists {
		grid-row: 4 / 6;
		display: flex;
		align-items: stretch;
		justify-content: stretch;
	}

	.notes {
		grid-row: 4 / 6;
		grid-column: 2/3;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.trackers {
		grid-row: 4 / 6;
		grid-column: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		border: 2px solid white;
		border-top: none;
		overflow: hidden;
	}
	.trackers img {
		aspect-ratio: 1 / 1;
		margin-top: 20px;
	}

	.cp {
		filter: grayscale(1) brightness(1.3);
	}

	.habit-link {
		color: white;
		text-decoration: none;
		font-size: 1.2rem;
		text-align: center;
		border-top: 1px solid white;
		padding-top: 0.5rem;
		width: 100%;
	}

	.habit-link:hover {
		color: rgb(219, 54, 54);
	}
</style>
