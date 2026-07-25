import { json } from '@sveltejs/kit';
import { pointsDb } from '$lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
	try {
		const points = pointsDb.get();
		if (!points) {
			return json({ error: 'Points not found' }, { status: 404 });
		}
		return json(points);
	} catch (error) {
		console.error('Error fetching points:', error);
		return json({ error: 'Failed to fetch points' }, { status: 500 });
	}
};
