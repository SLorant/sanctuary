import type { PageServerLoad } from './$types';
import { trackedArtistDb } from '$lib/server/db.ts';

export const load: PageServerLoad = async () => {
	const trackedArtistsData = trackedArtistDb.getAll();
	const trackedArtists = trackedArtistsData.map((artist) => artist.name);

	return {
		trackedArtists
	};
};
