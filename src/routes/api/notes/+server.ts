import { json } from '@sveltejs/kit';
import { noteDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const notes = noteDb.getAll();
		return json(notes);
	} catch (error) {
		console.error('Failed to fetch notes:', error);
		return json({ error: 'Failed to fetch notes' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { content } = await request.json();

		if (!content || typeof content !== 'string' || !content.trim()) {
			return json({ error: 'Content is required' }, { status: 400 });
		}

		const id = noteDb.create(content.trim());
		return json({ id, content: content.trim() }, { status: 201 });
	} catch (error) {
		console.error('Failed to create note:', error);
		return json({ error: 'Failed to create note' }, { status: 500 });
	}
};
