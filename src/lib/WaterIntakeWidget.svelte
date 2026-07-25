<script lang="ts">
	import { onMount } from 'svelte';

	let waterIntake: number = 0;
	const maxWater = 2.5;
	const step = 0.1;
	const markInterval = 0.5;

	function getTodayKey(): string {
		const today = new Date().toISOString().split('T')[0];
		return `water_intake_${today}`;
	}

	function handleChange(event: Event) {
		const target = event.target as HTMLInputElement;
		waterIntake = parseFloat(target.value);
		localStorage.setItem(getTodayKey(), waterIntake.toString());
	}

	onMount(() => {
		const todayKey = getTodayKey();
		const saved = localStorage.getItem(todayKey);
		if (saved) {
			waterIntake = parseFloat(saved);
		}
	});

	// Generate marks for the slider
	const marks = [];
	for (let i = 0; i <= maxWater; i += markInterval) {
		marks.push(i);
	}
</script>

<div class="container">
	<div class="slider-container">
		<input
			type="range"
			min="0"
			max={maxWater}
			{step}
			value={waterIntake}
			on:change={handleChange}
			on:input={handleChange}
			class="slider"
		/>
		<div class="marks">
			{#each marks as mark (mark)}
				<div class="mark" style="--mark-percent: {mark / maxWater}" title="{mark}L" />
			{/each}
		</div>
	</div>
	<p class="water-value">{waterIntake.toFixed(1)}L / {maxWater}L</p>
</div>

<style>
	.container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		height: 100%;
		background-color: black;
		border: 2px solid white;
		color: white;
		font-family: 'Hangyaku';
		padding: 1rem;
		box-sizing: border-box;
		border-top: none;
		border-left: none;
	}

	.slider-container {
		position: relative;
		width: calc(100% - 2rem);
	}

	.slider {
		width: 100%;
		height: 8px;
		border-radius: 0px;
		background: white;
		outline: none;
		-webkit-appearance: none;
		appearance: none;
		cursor: pointer;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 18px;
		height: 18px;
		border-radius: 0;
		background: white;
		border: 2px solid black;
		cursor: pointer;
	}

	.slider::-moz-range-thumb {
		width: 18px;
		height: 18px;
		border-radius: 0;
		background: white;
		border: 2px solid black;
		cursor: pointer;
	}

	.slider::-webkit-slider-runnable-track {
		background: white;
		height: 8px;
		border-radius: 4px;
	}

	.slider::-moz-range-track {
		background: white;
		height: 8px;
		border-radius: 4px;
	}

	.marks {
		position: relative;
		width: 100%;
		height: 20px;
		margin-top: -4px;
	}

	.mark {
		position: absolute;
		width: 2px;
		height: 8px;
		background: white;
		top: 0;
		left: calc((var(--mark-percent, 0)) * (100% - 18px) + 9px);
		transform: translateX(-50%);
	}

	.water-value {
		font-size: 1.5rem;
		font-weight: bold;
		margin: 0;
		text-align: center;
	}
</style>
