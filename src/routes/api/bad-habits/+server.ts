import { json } from '@sveltejs/kit';
import { badHabitDb } from '$lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		const badHabits = badHabitDb.getAll();
		return json(badHabits);
	} catch (error) {
		console.error('Error fetching bad habits:', error);
		return json({ error: 'Failed to fetch bad habits' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { name, pointPenalty } = await request.json();

		if (!name || pointPenalty === undefined) {
			return json({ error: 'Name and pointPenalty are required' }, { status: 400 });
		}

		const id = badHabitDb.create({ name, pointPenalty });
		const badHabit = badHabitDb.getById(id);

		return json(badHabit, { status: 201 });
	} catch (error) {
		console.error('Error creating bad habit:', error);
		return json({ error: 'Failed to create bad habit' }, { status: 500 });
	}
};
