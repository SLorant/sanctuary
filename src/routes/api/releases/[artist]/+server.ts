import { json } from '@sveltejs/kit';
import { getCachedArtistReleases } from '$lib/server/releases';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, fetch }) => {
	const releases = await getCachedArtistReleases(params.artist, fetch);
	return json({ releases });
};
