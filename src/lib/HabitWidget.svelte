<script lang="ts">
	import type { Habit, HabitLog } from '$lib/server/db';
	import { getWeekDays } from '$lib/habitUtils';
	import { habitToggled } from '$lib/habitToggleStore';
	import { onMount } from 'svelte';
	import { resolve } from '$app/paths';

	interface HabitWithLogs extends Habit {
		logs: Map<string, boolean>;
	}

	let habits: HabitWithLogs[] = [];
	let currentHabitIndex = 0;

	async function loadHabits() {
		try {
			const response = await fetch('/api/habits');
			const data = await response.json();

			habits = await Promise.all(
				data.map(async (habit: Habit) => {
					const logsResponse = await fetch(`/api/habits/${habit.id}/logs`);
					const { logs } = await logsResponse.json();
					const logsMap = new Map<string, boolean>();
					logs.forEach((log: HabitLog) => {
						logsMap.set(log.logDate, true);
					});
					return { ...habit, logs: logsMap };
				})
			);
		} catch (error) {
			console.error('Error loading habits:', error);
		}
	}

	async function toggleDay(habitId: number, date: string) {
		try {
			const response = await fetch(`/api/habits/${habitId}/logs`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ logDate: date })
			});

			if (response.ok) {
				habitToggled.set(Date.now());
				await loadHabits();
			}
		} catch (error) {
			console.error('Error toggling day:', error);
		}
	}

	function nextHabit() {
		if (habits.length > 0) {
			currentHabitIndex = (currentHabitIndex + 1) % habits.length;
		}
	}

	function prevHabit() {
		if (habits.length > 0) {
			currentHabitIndex = (currentHabitIndex - 1 + habits.length) % habits.length;
		}
	}

	onMount(() => {
		loadHabits();
	});
</script>

<div class="habits">
	{#if habits.length > 0}
		{@const currentHabit = habits[currentHabitIndex]}
		<div class="habit-widget">
			<button class="habit-nav" on:click={prevHabit}><p>P</p></button>
			<div class="habit-widget-content">
				<div class="habit-widget-header">
					<h3>{currentHabit.name}</h3>
					<!-- 	<p>{currentHabitIndex + 1} / {habits.length}</p> -->
				</div>
				<div class="habit-widget-grid">
					{#each getWeekDays(currentHabit.startDate!, 30) as week (week)}
						<div class="week-column">
							{#each week as day, dayIndex (week + ':' + dayIndex)}
								{#if day}
									<button
										class="day-box {currentHabit.logs.get(day) ? 'completed' : ''}"
										on:click={() => toggleDay(currentHabit.id!, day)}
										title={day}
									></button>
								{:else}
									<div class="day-box empty"></div>
								{/if}
							{/each}
						</div>
					{/each}
				</div>
				<a href={resolve('/tracking')} class="habit-link">see thy rituals</a>
			</div>
			<button class="habit-nav" on:click={nextHabit}><p>N</p></button>
		</div>
	{:else}
		<div class="habit-widget-empty">
			<p>No habits yet</p>
			<a href={resolve('/tracking')}>Create one →</a>
		</div>
	{/if}
</div>

<style>
	.habits {
		background-color: black;
		grid-row: 3/4;
		grid-column: 3;
		border: 2px solid white;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1.5rem;
		max-width: 333.3333px;
		overflow: scroll;
		border-top: none;
	}

	.habit-widget {
		display: flex;
		align-items: center;
		gap: 1rem;
		width: 100%;
		height: 100%;
		color: white;
	}

	.habit-nav {
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
	}
	.habit-nav p {
		margin: 0;
		line-height: 1;
		text-align: center;
		font-family: 'Hangyaku';
	}

	.habit-nav:hover {
		background: white;
		color: black;
	}

	.habit-widget-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		/* 	height: 100%; */
		gap: 1rem;
	}

	.habit-widget-header {
		text-align: center;
	}

	.habit-widget-header h3 {
		margin: 0;
		font-size: 2rem;
		line-height: 1.2;
	}

	.habit-widget-grid {
		display: flex;
		gap: 0.5rem;
		overflow-x: auto;
		flex: 1;
		align-items: flex-start;
		height: fit-content;
	}

	.week-column {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		flex-shrink: 0;
	}

	.day-box {
		width: 20px;
		height: 20px;
		border: 1px solid white;
		background: black;
		cursor: pointer;
	}

	.day-box:hover {
		background: white;
	}

	.day-box.completed {
		background: white;
	}

	.day-box.empty {
		border: none;
		background: transparent;
		cursor: default;
	}

	.habit-link {
		color: white;
		text-decoration: none;
		font-size: 1.2rem;
		text-align: center;
		border-top: 1px solid white;
		padding-top: 0.5rem;
	}

	.habit-link:hover {
		color: rgb(219, 54, 54);
	}

	.habit-widget-empty {
		text-align: center;
		color: white;
	}

	.habit-widget-empty p {
		margin: 0 0 0.5rem 0;
	}

	.habit-widget-empty a {
		color: white;
		text-decoration: none;
	}

	.habit-widget-empty a:hover {
		opacity: 0.7;
	}

	@media (max-width: 768px) {
		.habits {
			width: 100%;
			max-width: none;
			aspect-ratio: 1 / 1;
			border-left: none;
			border-right: none;
		}
	}
</style>
