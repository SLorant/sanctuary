import { json } from '@sveltejs/kit';
import { shopItemDb } from '$lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id, 10);
		const success = shopItemDb.delete(id);

		if (!success) {
			return json({ error: 'Shop item not found' }, { status: 404 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting shop item:', error);
		return json({ error: 'Failed to delete shop item' }, { status: 500 });
	}
};
