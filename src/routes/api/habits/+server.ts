import { json } from '@sveltejs/kit';
import { habitDb } from '$lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		const habits = habitDb.getAll();
		return json(habits);
	} catch (error) {
		console.error('Error fetching habits:', error);
		return json({ error: 'Failed to fetch habits' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { name, startDate } = await request.json();

		if (!name || !startDate) {
			return json({ error: 'Name and startDate are required' }, { status: 400 });
		}

		const id = habitDb.create({ name, startDate });
		const habit = habitDb.getById(id);

		return json(habit, { status: 201 });
	} catch (error) {
		console.error('Error creating habit:', error);
		return json({ error: 'Failed to create habit' }, { status: 500 });
	}
};
