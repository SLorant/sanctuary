import { json } from '@sveltejs/kit';
import { badHabitDb, badHabitLogDb } from '$lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);
		const badHabit = badHabitDb.getById(id);

		if (!badHabit) {
			return json({ error: 'Bad habit not found' }, { status: 404 });
		}

		const logs = badHabitLogDb.getByBadHabitId(id);
		return json({ badHabit, logs });
	} catch (error) {
		console.error('Error fetching bad habit:', error);
		return json({ error: 'Failed to fetch bad habit' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ params, request }) => {
	try {
		const id = parseInt(params.id);
		const { name, pointPenalty } = await request.json();

		if (!name || pointPenalty === undefined) {
			return json({ error: 'Name and pointPenalty are required' }, { status: 400 });
		}

		const success = badHabitDb.update(id, { name, pointPenalty });

		if (!success) {
			return json({ error: 'Bad habit not found' }, { status: 404 });
		}

		const badHabit = badHabitDb.getById(id);
		return json(badHabit);
	} catch (error) {
		console.error('Error updating bad habit:', error);
		return json({ error: 'Failed to update bad habit' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);
		const badHabit = badHabitDb.getById(id);

		if (!badHabit) {
			return json({ error: 'Bad habit not found' }, { status: 404 });
		}

		badHabitDb.delete(id);
		return json({ success: true });
	} catch (error) {
		console.error('Error deleting bad habit:', error);
		return json({ error: 'Failed to delete bad habit' }, { status: 500 });
	}
};
