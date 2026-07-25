import { json } from '@sveltejs/kit';
import { shopItemDb, pointsDb } from '$lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = () => {
	const items = shopItemDb.getAll();
	return json(items);
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { name, pointCost } = await request.json();

		if (!name || typeof pointCost !== 'number') {
			return json({ error: 'Invalid input' }, { status: 400 });
		}

		const id = shopItemDb.create({ name, pointCost });
		return json({ id, name, pointCost }, { status: 201 });
	} catch (error) {
		console.error('Error creating shop item:', error);
		return json({ error: 'Failed to create shop item' }, { status: 500 });
	}
};
