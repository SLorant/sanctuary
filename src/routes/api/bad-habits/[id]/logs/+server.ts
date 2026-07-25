import { json } from '@sveltejs/kit';
import { badHabitDb, badHabitLogDb, pointsDb } from '$lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const badHabitId = parseInt(params.id);
		const badHabit = badHabitDb.getById(badHabitId);

		if (!badHabit) {
			return json({ error: 'Bad habit not found' }, { status: 404 });
		}

		const logs = badHabitLogDb.getByBadHabitId(badHabitId);
		const count = badHabitLogDb.getCount(badHabitId);
		return json({ logs, count });
	} catch (error) {
		console.error('Error fetching bad habit logs:', error);
		return json({ error: 'Failed to fetch bad habit logs' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ params }) => {
	try {
		const badHabitId = parseInt(params.id);

		const badHabit = badHabitDb.getById(badHabitId);
		if (!badHabit) {
			return json({ error: 'Bad habit not found' }, { status: 404 });
		}

		// Create new log and subtract points
		const logId = badHabitLogDb.create(badHabitId);
		pointsDb.addPoints(-badHabit.pointPenalty);
		const count = badHabitLogDb.getCount(badHabitId);

		const log = { id: logId, badHabitId };
		return json({ log, count }, { status: 201 });
	} catch (error) {
		console.error('Error creating bad habit log:', error);
		return json({ error: 'Failed to create bad habit log' }, { status: 500 });
	}
};
