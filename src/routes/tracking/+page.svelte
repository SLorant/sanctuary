<script lang="ts">
	import type { Habit, HabitLog, BadHabit } from '$lib/server/db';
	import { getDaysInRange, getWeekDays } from '$lib/habitUtils';
	import { onMount } from 'svelte';

	interface HabitWithLogs extends Habit {
		logs: Map<string, boolean>;
	}

	interface BadHabitWithCount extends BadHabit {
		count: number;
	}

	let habits: HabitWithLogs[] = [];
	let badHabits: BadHabitWithCount[] = [];
	let showAddModal = false;
	let showAddBadHabitModal = false;
	let newHabitName = '';
	let newHabitStartDate = '';
	let newBadHabitName = '';
	let newBadHabitPointPenalty = 5;
	let loading = false;
	let points: number = 0;

	onMount(async () => {
		await loadHabits();
		await loadBadHabits();
		await fetchPoints();
	});

	async function fetchPoints() {
		try {
			const response = await fetch('/api/points');
			const data = await response.json();
			points = data.points;
		} catch (error) {
			console.error('Failed to fetch points:', error);
		}
	}

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

	async function loadBadHabits() {
		try {
			const response = await fetch('/api/bad-habits');
			const data = await response.json();

			badHabits = await Promise.all(
				data.map(async (badHabit: BadHabit) => {
					const logsResponse = await fetch(`/api/bad-habits/${badHabit.id}/logs`);
					const { count } = await logsResponse.json();
					return { ...badHabit, count };
				})
			);
		} catch (error) {
			console.error('Error loading bad habits:', error);
		}
	}

	async function addHabit() {
		if (!newHabitName.trim() || !newHabitStartDate) {
			alert('Please fill in all fields');
			return;
		}

		loading = true;
		try {
			const response = await fetch('/api/habits', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: newHabitName,
					startDate: newHabitStartDate
				})
			});

			if (response.ok) {
				newHabitName = '';
				newHabitStartDate = '';
				showAddModal = false;
				await loadHabits();
			}
		} catch (error) {
			console.error('Error adding habit:', error);
			alert('Failed to add habit');
		} finally {
			loading = false;
		}
	}

	async function addBadHabit() {
		if (!newBadHabitName.trim() || newBadHabitPointPenalty <= 0) {
			alert('Please fill in all fields with valid values');
			return;
		}

		loading = true;
		try {
			const response = await fetch('/api/bad-habits', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: newBadHabitName,
					pointPenalty: newBadHabitPointPenalty
				})
			});

			if (response.ok) {
				newBadHabitName = '';
				newBadHabitPointPenalty = 5;
				showAddBadHabitModal = false;
				await loadBadHabits();
			}
		} catch (error) {
			console.error('Error adding bad habit:', error);
			alert('Failed to add bad habit');
		} finally {
			loading = false;
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
				await loadHabits();
				await fetchPoints();
			}
		} catch (error) {
			console.error('Error toggling day:', error);
		}
	}

	async function recordBadHabit(badHabitId: number) {
		try {
			const response = await fetch(`/api/bad-habits/${badHabitId}/logs`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' }
			});

			if (response.ok) {
				await loadBadHabits();
				await fetchPoints();
			}
		} catch (error) {
			console.error('Error recording bad habit:', error);
		}
	}

	async function deleteHabit(habitId: number) {
		if (!confirm('Are you sure you want to delete this habit?')) return;

		try {
			const response = await fetch(`/api/habits/${habitId}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadHabits();
			}
		} catch (error) {
			console.error('Error deleting habit:', error);
		}
	}

	async function deleteBadHabit(badHabitId: number) {
		if (!confirm('Are you sure you want to delete this bad habit?')) return;

		try {
			const response = await fetch(`/api/bad-habits/${badHabitId}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadBadHabits();
			}
		} catch (error) {
			console.error('Error deleting bad habit:', error);
		}
	}
</script>

<div class="tracking-container">
	<div class="header-section">
		<div>
			<h1 class="main-title">Ritual Board</h1>
		</div>
		<div class="header-right">
			<a href="/shop" class="shop-link">The Oracle</a>
			<div class="points-display">
				<span class="points-label">Feathers:</span>
				<span class="points-number">{points}</span>
			</div>
			<button class="add-habit-btn" on:click={() => (showAddModal = true)}>+ Add Ritual</button>
		</div>
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
				<h2 id="modal-title">Create New Ritual</h2>
				<input
					type="text"
					placeholder="Ritual name"
					bind:value={newHabitName}
					class="input-field"
				/>
				<input type="date" bind:value={newHabitStartDate} class="input-field" />
				<div class="modal-buttons">
					<button class="btn-cancel" on:click={() => (showAddModal = false)}>Cancel</button>
					<button class="btn-confirm" on:click={addHabit} disabled={loading}>
						{loading ? 'Creating...' : 'Create'}
					</button>
				</div>
			</div>
		</div>
	{/if}

	<div class="habits-grid">
		{#each habits as habit (habit.id)}
			<div class="habit-card">
				<div class="habit-header">
					<div>
						<h3 class="habit-name">{habit.name}</h3>
						<p class="habit-start-date">
							Started: {new Date(habit.startDate).toLocaleDateString()}
						</p>
					</div>
					<button class="delete-btn" on:click={() => deleteHabit(habit.id!)}>✕</button>
				</div>

				<div class="activity-grid">
					{#each getWeekDays(habit.startDate!).reverse() as week (week)}
						<div class="week-column">
							{#each week as day, dayIndex (week + ':' + dayIndex)}
								{#if day}
									<button
										class="day-box {habit.logs.get(day) ? 'completed' : ''}"
										on:click={() => toggleDay(habit.id!, day)}
										title={day}
										aria-label="Toggle {day}"
									>
										<span class="day-indicator"></span>
									</button>
								{:else}
									<div class="day-box empty"></div>
								{/if}
							{/each}
						</div>
					{/each}
				</div>

				<div class="legend">
					<span class="legend-item"><span class="legend-box empty"></span> Not started</span>
					<span class="legend-item"><span class="legend-box partial"></span> Tracked</span>
				</div>
			</div>
		{/each}
	</div>

	{#if habits.length === 0}
		<div class="empty-state">
			<p>No rituals...</p>
		</div>
	{/if}

	<!-- Bad Habits Section -->
	<div class="bad-habits-section">
		<div class="bad-habits-header">
			<h2 class="bad-habits-title">Sins</h2>
			<button class="add-bad-habit-btn" on:click={() => (showAddBadHabitModal = true)}
				>+ Add Sin</button
			>
		</div>

		{#if showAddBadHabitModal}
			<div
				class="modal-overlay"
				role="dialog"
				aria-modal="true"
				aria-labelledby="bad-habit-modal-title"
				on:click={() => (showAddBadHabitModal = false)}
				on:keydown={(e) => e.key === 'Escape' && (showAddBadHabitModal = false)}
			>
				<div class="modal" on:click={(e) => e.stopPropagation()}>
					<h2 id="bad-habit-modal-title">Create Sin</h2>
					<input
						type="text"
						placeholder="Sin name"
						bind:value={newBadHabitName}
						class="input-field"
					/>
					<div class="penalty-input-group">
						<label for="penalty-input">Feathers Lost:</label>
						<input
							id="penalty-input"
							type="number"
							min="1"
							bind:value={newBadHabitPointPenalty}
							class="input-field"
						/>
					</div>
					<div class="modal-buttons">
						<button class="btn-cancel" on:click={() => (showAddBadHabitModal = false)}
							>Cancel</button
						>
						<button class="btn-confirm" on:click={addBadHabit} disabled={loading}>
							{loading ? 'Creating...' : 'Create'}
						</button>
					</div>
				</div>
			</div>
		{/if}

		<div class="bad-habits-grid">
			{#each badHabits as badHabit (badHabit.id)}
				<div class="bad-habit-card">
					<div class="bad-habit-header">
						<div>
							<h3 class="bad-habit-name">{badHabit.name}</h3>
							<p class="bad-habit-penalty">-{badHabit.pointPenalty} feathers</p>
						</div>
						<button class="delete-btn" on:click={() => deleteBadHabit(badHabit.id!)}>✕</button>
					</div>

					<div class="bad-habit-action">
						<button class="did-this-btn" on:click={() => recordBadHabit(badHabit.id!)}>
							Sinned
						</button>
						<div class="counter">
							<span class="counter-label">Times:</span>
							<span class="counter-value">{badHabit.count}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>

		{#if badHabits.length === 0}
			<div class="empty-state">
				<p>No sins.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.tracking-container {
		min-height: 100vh;
		padding: 2rem;
		background: black;
		color: white;
		position: relative;
		overflow-x: hidden;
		font-family: 'Hangyaku';
	}

	.header-section {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 3rem;
		gap: 2rem;
		padding: 2rem;
		border: 2px solid white;
		position: relative;
		background: black;
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: 2rem;
	}

	.shop-link {
		padding: 0.9rem 2rem;
		color: white;
		background: transparent;
		border: 2px solid white;
		border-radius: 2px;
		font-size: 1.2rem;
		font-weight: 700;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 1px;
		position: relative;
		text-decoration: none;
		transition: all 0.2s ease;
		display: inline-block;
	}

	.shop-link:hover {
		background: white;
		color: black;
	}

	.points-display {
		display: flex;
		/* flex-direction: column; */
		align-items: center;
		padding: 1rem 1.5rem;
		border: 2px solid white;
		background: black;
		gap: 0.5rem;
	}

	.points-label {
		font-size: 0.9rem;
		text-transform: uppercase;
		letter-spacing: 1px;
		color: rgba(255, 255, 255, 0.8);
	}

	.points-number {
		font-size: 2.2rem;
		font-weight: bold;
		color: rgb(255, 255, 255);
		line-height: 0.8;
	}

	.main-title {
		font-size: 2.8rem;
		font-weight: 900;
		color: white;
		margin: 0;
		letter-spacing: 4px;
		font-style: italic;
		text-transform: uppercase;
	}

	.add-habit-btn {
		padding: 0.9rem 2rem;
		color: black;
		background: white;
		border: 2px solid white;
		border-radius: 2px;
		font-size: 1.2rem;
		font-weight: 700;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 1px;
		position: relative;
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

	.habits-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
		gap: 2.5rem;
		padding: 2rem;
	}

	.habit-card {
		background: black;
		border: 4px solid white;
		border-radius: 2px;
		padding: 1.8rem;
		position: relative;
	}

	.habit-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1.5rem;
		gap: 1rem;
		padding-top: 0.5rem;
	}

	.habit-name {
		color: white;
		font-size: 2rem;
		font-weight: 700;
		margin: 0;
		letter-spacing: 1px;
	}

	.habit-start-date {
		color: rgba(255, 255, 255, 0.7);
		font-size: 1rem;
		margin: 0.3rem 0 0 0;
		font-style: italic;
	}

	.delete-btn {
		background: white;
		color: black;
		border: 2px solid white;
		width: 32px;
		height: 32px;
		cursor: pointer;
		font-size: 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.delete-btn:hover {
		background: black;
		color: white;
	}

	.activity-grid {
		display: flex;
		gap: 1rem;
		margin-bottom: 1.5rem;
		overflow-x: auto;
		padding: 1rem 0;
		padding-right: 0.5rem;
	}

	.activity-grid::-webkit-scrollbar {
		height: 6px;
	}

	.activity-grid::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
	}

	.activity-grid::-webkit-scrollbar-thumb {
		background: white;
		border-radius: 3px;
	}

	.week-column {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		flex-shrink: 0;
	}

	.day-box {
		width: 28px;
		height: 28px;
		border: 2px solid white;
		border-radius: 1px;
		background: black;
		cursor: pointer;
		padding: 0;
		position: relative;
		overflow: hidden;
	}

	.day-box:hover {
		background: white;
		color: black;
	}

	.day-box.completed {
		background: white;
		border-color: white;
	}

	.day-box.completed .day-indicator {
		opacity: 1;
	}

	.day-box.empty {
		background: transparent;
		border: none;
		cursor: default;
	}

	.day-box.empty:hover {
		background: transparent;
		transform: none;
	}

	.day-indicator {
		position: absolute;
		width: 100%;
		height: 100%;
		opacity: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 14px;
		color: black;
		font-weight: bold;
	}

	.legend {
		display: flex;
		gap: 1.5rem;
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.8);
		margin-top: 1.2rem;
		padding-top: 1.2rem;
		border-top: 2px solid white;
		flex-wrap: wrap;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.6rem;
	}

	.legend-box {
		width: 14px;
		height: 14px;
		border: 1px solid white;
		border-radius: 1px;
	}

	.legend-box.empty {
		background: black;
	}

	.legend-box.partial {
		background: white;
		border-color: white;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
		color: rgba(255, 255, 255, 0.7);
		font-size: 1.1rem;
		background: black;
		border: 3px solid white;
		margin: 2rem;
		border-radius: 2px;
	}

	.empty-state::before {
		content: '⚔';
		display: block;
		font-size: 2rem;
		color: white;
		margin-bottom: 1rem;
	}

	/* Bad Habits Styles */
	.bad-habits-section {
		padding: 2rem;
		margin-top: 3rem;
	}

	.bad-habits-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		gap: 2rem;
		padding: 1.5rem 2rem;
		border: 3px solid rgb(219, 54, 54);
		background: black;
	}

	.bad-habits-title {
		font-size: 2rem;
		font-weight: 900;
		color: rgb(219, 54, 54);
		margin: 0;
		letter-spacing: 2px;
		text-transform: uppercase;
	}

	.add-bad-habit-btn {
		padding: 0.9rem 2rem;
		color: black;
		background: rgb(219, 54, 54);
		border: 2px solid rgb(219, 54, 54);
		border-radius: 2px;
		font-size: 1.1rem;
		font-weight: 700;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 1px;
		position: relative;
		transition: all 0.2s ease;
	}

	.add-bad-habit-btn:hover {
		background: transparent;
		color: rgb(219, 54, 54);
	}

	.penalty-input-group {
		margin-bottom: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.penalty-input-group label {
		color: white;
		font-size: 1rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 1px;
	}

	.bad-habits-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
		gap: 2rem;
	}

	.bad-habit-card {
		background: black;
		border: 3px solid white;
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.bad-habit-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
	}

	.bad-habit-name {
		color: white;
		font-size: 1.5rem;
		font-weight: 700;
		margin: 0;
		letter-spacing: 1px;
	}

	.bad-habit-penalty {
		color: white;
		font-size: 1.2rem;
		margin: 0.3rem 0 0 0;
		font-style: italic;
		font-weight: 600;
	}

	.bad-habit-action {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 1rem;
		border-top: 2px solid rgb(219, 54, 54);
	}

	.did-this-btn {
		flex: 1;
		padding: 0.8rem 1.5rem;
		background: rgb(219, 54, 54);
		color: white;
		border: 2px solid rgb(219, 54, 54);
		border-radius: 2px;
		font-weight: 700;
		font-size: 1rem;
		cursor: pointer;
		text-transform: uppercase;
		letter-spacing: 1px;
		transition: all 0.2s ease;
	}

	.did-this-btn:hover {
		background: transparent;
		color: rgb(219, 54, 54);
	}

	.counter {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.3rem;
		padding: 0.5rem 1rem;
		background: rgba(219, 54, 54, 0.1);
		border: 2px solid rgb(219, 54, 54);
		border-radius: 2px;
		min-width: 80px;
	}

	.counter-label {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.7);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.counter-value {
		font-size: 1.8rem;
		font-weight: bold;
		color: rgb(219, 54, 54);
	}

	@media (max-width: 768px) {
		.tracking-container {
			padding: 1rem;
		}

		.header-section {
			flex-direction: column;
			margin-bottom: 2rem;
			gap: 1rem;
		}

		.main-title {
			font-size: 1.9rem;
			letter-spacing: 2px;
		}

		.habits-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
			padding: 1rem;
		}

		.activity-grid {
			gap: 0.7rem;
		}

		.bad-habits-header {
			flex-direction: column;
			gap: 1rem;
		}

		.bad-habits-grid {
			grid-template-columns: 1fr;
		}

		.bad-habit-action {
			flex-direction: column;
		}

		.did-this-btn {
			width: 100%;
		}
	}
</style>
