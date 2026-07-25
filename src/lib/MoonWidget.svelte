<script lang="ts">
	import { onMount } from 'svelte';

	const SYNODIC_MONTH = 29.530588853;
	const KNOWN_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14);

	interface MoonPhase {
		name: string;
		emoji: string;
		illumination: number;
	}

	let moon: MoonPhase | null = null;

	function getMoonPhase(date: Date): MoonPhase {
		const daysSinceNewMoon = (date.getTime() - KNOWN_NEW_MOON) / 86400000;
		let age = daysSinceNewMoon % SYNODIC_MONTH;
		if (age < 0) age += SYNODIC_MONTH;

		const phase = age / SYNODIC_MONTH;
		const illumination = Math.round((1 - Math.cos(2 * Math.PI * phase)) * 50);

		const stages: { max: number; name: string; emoji: string }[] = [
			{ max: 1 / 16, name: '삭', emoji: '🌑' },
			{ max: 3 / 16, name: '초승달', emoji: '🌒' },
			{ max: 5 / 16, name: '상현달', emoji: '🌓' },
			{ max: 7 / 16, name: '차오르는 달', emoji: '🌔' },
			{ max: 9 / 16, name: '보름달', emoji: '🌕' },
			{ max: 11 / 16, name: '이지러지는 달', emoji: '🌖' },
			{ max: 13 / 16, name: '하현달', emoji: '🌗' },
			{ max: 15 / 16, name: '그믐달', emoji: '🌘' },
			{ max: 1, name: '삭', emoji: '🌑' }
		];

		const stage = stages.find((s) => phase < s.max) ?? stages[stages.length - 1];

		return { name: stage.name, emoji: stage.emoji, illumination };
	}

	onMount(() => {
		moon = getMoonPhase(new Date());
	});
</script>

<div class="moon">
	{#if moon}
		<div class="moon-body">
			<p class="moon-name">{moon.name}</p>
			<p class="moon-illumination">{moon.illumination}% 밝음</p>
		</div>
		<span class="moon-emoji">{moon.emoji}</span>
	{:else}
		<p class="loading">Loading...</p>
	{/if}
</div>

<style>
	.moon {
		background-color: black;
		border-bottom: 2px solid white;
		/* 	grid-column: 1 / 4; */
		grid-row: 2;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 2rem;
		padding: 1.4rem 2rem;
		overflow: hidden;
	}

	.moon-body {
		flex: 1;
		min-width: 0;
	}

	.moon-name {
		font-size: 1.6rem;
		text-align: right;
		line-height: 1.2;
		margin: 0;
	}

	.moon-illumination {
		width: 100%;
		font-size: 1.3rem;
		text-align: right;
		margin: 0;
		opacity: 0.8;
	}

	.moon-emoji {
		flex-shrink: 0;
		font-size: 3rem;
		line-height: 1;
		filter: grayscale(1);
	}

	.loading {
		text-align: center;
		opacity: 0.7;
		width: 100%;
	}

	@media (max-width: 768px) {
		.moon {
			width: 100%;
			aspect-ratio: 333.33 / 164;
		}
	}
</style>
