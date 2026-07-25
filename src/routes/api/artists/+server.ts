import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { trackedArtistDb } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { name } = await request.json();

		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			return json({ error: 'Artist name is required' }, { status: 400 });
		}

		const id = trackedArtistDb.add(name.trim());
		return json({ id, name: name.trim() }, { status: 201 });
	} catch (error) {
		if (error instanceof Error && error.message.includes('UNIQUE')) {
			return json({ error: 'Artist already being tracked' }, { status: 409 });
		}
		console.error('Error adding artist:', error);
		return json({ error: 'Failed to add artist' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ request }) => {
	try {
		const { name } = await request.json();

		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			return json({ error: 'Artist name is required' }, { status: 400 });
		}

		const removed = trackedArtistDb.remove(name.trim());

		if (!removed) {
			return json({ error: 'Artist not found' }, { status: 404 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Error removing artist:', error);
		return json({ error: 'Failed to remove artist' }, { status: 500 });
	}
};
