import { json } from '@sveltejs/kit';
import { trackedArtistDb } from '$lib/server/db';
import { getArtistReleases } from '$lib/server/releases';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ fetch }) => {
	const trackedArtistsData = trackedArtistDb.getAll();
	const TRACKED_ARTISTS = trackedArtistsData.map((artist) => artist.name);

	const releases = await getArtistReleases(fetch, TRACKED_ARTISTS);

	return json({ releases });
};
