import type { PageServerLoad } from './$types';
import { trackedArtistDb } from '$lib/server/db.ts';
import { getArtistReleases } from '$lib/server/releases';

export const load: PageServerLoad = async ({ fetch }) => {
	const trackedArtistsData = trackedArtistDb.getAll();
	const TRACKED_ARTISTS = trackedArtistsData.map((artist) => artist.name);

	const releases = await getArtistReleases(fetch, TRACKED_ARTISTS);

	return {
		releases,
		trackedArtists: TRACKED_ARTISTS
	};
};
