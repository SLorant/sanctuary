import { json } from '@sveltejs/kit';
import { noteDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const id = parseInt(params.id);

		if (isNaN(id)) {
			return json({ error: 'Invalid note ID' }, { status: 400 });
		}

		const deleted = noteDb.delete(id);

		if (!deleted) {
			return json({ error: 'Note not found' }, { status: 404 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Failed to delete note:', error);
		return json({ error: 'Failed to delete note' }, { status: 500 });
	}
};
