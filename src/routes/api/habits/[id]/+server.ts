import { json } from '@sveltejs/kit';
import { habitDb, habitLogDb } from '$lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);
		const habit = habitDb.getById(id);

		if (!habit) {
			return json({ error: 'Habit not found' }, { status: 404 });
		}

		const logs = habitLogDb.getByHabitId(id);
		return json({ habit, logs });
	} catch (error) {
		console.error('Error fetching habit:', error);
		return json({ error: 'Failed to fetch habit' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const id = parseInt(params.id);
		const { name, startDate } = await request.json();

		if (!name || !startDate) {
			return json({ error: 'Name and startDate are required' }, { status: 400 });
		}

		const success = habitDb.update(id, { name, startDate });

		if (!success) {
			return json({ error: 'Habit not found' }, { status: 404 });
		}

		const habit = habitDb.getById(id);
		return json(habit);
	} catch (error) {
		console.error('Error updating habit:', error);
		return json({ error: 'Failed to update habit' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);
		const habit = habitDb.getById(id);

		if (!habit) {
			return json({ error: 'Habit not found' }, { status: 404 });
		}

		habitDb.delete(id);
		return json({ success: true });
	} catch (error) {
		console.error('Error deleting habit:', error);
		return json({ error: 'Failed to delete habit' }, { status: 500 });
	}
};
