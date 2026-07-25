import { json } from '@sveltejs/kit';
import { habitDb, habitLogDb, pointsDb } from '$lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const habitId = parseInt(params.id);
		const habit = habitDb.getById(habitId);

		if (!habit) {
			return json({ error: 'Habit not found' }, { status: 404 });
		}

		const logs = habitLogDb.getByHabitId(habitId);
		return json({ logs });
	} catch (error) {
		console.error('Error fetching habit logs:', error);
		return json({ error: 'Failed to fetch habit logs' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ params, request }) => {
	try {
		const habitId = parseInt(params.id);
		const { logDate } = await request.json();

		if (!logDate) {
			return json({ error: 'logDate is required' }, { status: 400 });
		}

		const habit = habitDb.getById(habitId);
		if (!habit) {
			return json({ error: 'Habit not found' }, { status: 404 });
		}

		const existing = habitLogDb.getByHabitAndDate(habitId, logDate);
		if (existing) {
			// If it already exists, delete it (toggle off) and subtract a point
			habitLogDb.delete(existing.id!);
			pointsDb.addPoints(-1);
			return json({ success: true, created: false });
		}

		// Create new log and add a point
		const logId = habitLogDb.create(habitId, logDate);
		pointsDb.addPoints(1);
		const log = { id: logId, habitId, logDate };
		return json(log, { status: 201 });
	} catch (error) {
		console.error('Error creating habit log:', error);
		return json({ error: 'Failed to create habit log' }, { status: 500 });
	}
};
