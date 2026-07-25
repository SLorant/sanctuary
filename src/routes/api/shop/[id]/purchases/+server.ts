import { json } from '@sveltejs/kit';
import { shopPurchaseDb, shopItemDb, pointsDb } from '$lib/server/db';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const itemId = parseInt(params.id, 10);
		const count = shopPurchaseDb.getCount(itemId);
		return json({ count });
	} catch (error) {
		console.error('Error getting purchase count:', error);
		return json({ error: 'Failed to get purchase count' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ params }) => {
	try {
		const itemId = parseInt(params.id, 10);
		const item = shopItemDb.getById(itemId);

		if (!item) {
			return json({ error: 'Shop item not found' }, { status: 404 });
		}

		const currentPoints = pointsDb.get();
		if (!currentPoints || currentPoints.points < item.pointCost) {
			return json({ error: 'Not enough points' }, { status: 400 });
		}

		// Deduct points
		pointsDb.addPoints(-item.pointCost);

		// Record purchase
		shopPurchaseDb.create(itemId);

		return json({ success: true, remainingPoints: currentPoints.points - item.pointCost });
	} catch (error) {
		console.error('Error making purchase:', error);
		return json({ error: 'Failed to complete purchase' }, { status: 500 });
	}
};
