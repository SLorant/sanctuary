interface Release {
	artistName: string;
	title: string;
	releaseDate: string;
	type: 'album' | 'single';
	tidalLink: string;
}

interface ReleaseGroupData {
	id: string;
	title: string;
	'first-release-date'?: string;
	'primary-type'?: string;
}

// MusicBrainz enforces ~1 request/second per IP across ALL endpoints, not
// just within a single artist's pagination. Serialize every call through
// this so bursts across artists don't get silently 503'd/429'd.
const MUSICBRAINZ_MIN_INTERVAL_MS = 1100;
let queueTail: Promise<void> = Promise.resolve();

async function rateLimitedFetch(
	url: string,
	headers: Record<string, string>,
	fetch: typeof global.fetch
): Promise<Response> {
	// Wait for whoever's ahead of us, then publish our own completion as the
	// new tail so the next caller waits on us instead.
	const myTurn = queueTail;
	let releaseNext!: () => void;
	queueTail = new Promise<void>((resolve) => {
		releaseNext = resolve;
	});

	await myTurn;

	try {
		const response = await fetch(url, { headers });
		if (!response.ok) {
			throw new Error(`MusicBrainz request failed: ${response.status} ${response.statusText} (${url})`);
		}
		return response;
	} finally {
		setTimeout(releaseNext, MUSICBRAINZ_MIN_INTERVAL_MS);
	}
}

async function fetchArtistReleases(
	artistName: string,
	fetch: typeof global.fetch
): Promise<Release[]> {
	try {
		const headers = { 'User-Agent': 'SanctuaryApp/1.0.0 ( contact@example.com )' };

		// Search for artist on MusicBrainz
		const artistSearchUrl = `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(artistName)}&fmt=json&limit=1`;
		const artistResponse = await rateLimitedFetch(artistSearchUrl, headers, fetch);
		const artistData = await artistResponse.json();

		if (!artistData.artists || artistData.artists.length === 0) {
			return [];
		}

		const artistId = artistData.artists[0].id;

		// Fetch release-groups from the past month (albums, EPs, singles)
		const lookbackStart = new Date();
		lookbackStart.setMonth(lookbackStart.getMonth() - 1);

		// Fetch all release-groups using pagination
		const allReleaseGroups: ReleaseGroupData[] = [];
		let offset = 0;
		const limit = 100;
		let hasMore = true;

		while (hasMore) {
			const releaseGroupsUrl = `https://musicbrainz.org/ws/2/release-group?artist=${artistId}&fmt=json&limit=${limit}&offset=${offset}`;
			const releaseGroupsResponse = await rateLimitedFetch(releaseGroupsUrl, headers, fetch);
			const releaseGroupsData = await releaseGroupsResponse.json();

			if (releaseGroupsData['release-groups'] && releaseGroupsData['release-groups'].length > 0) {
				allReleaseGroups.push(...releaseGroupsData['release-groups']);
				offset += limit;

				// If we got fewer results than the limit, we've reached the end
				if (releaseGroupsData['release-groups'].length < limit) {
					hasMore = false;
				}
			} else {
				hasMore = false;
			}
		}

		const recentReleases: Release[] = [];

		for (const releaseGroup of allReleaseGroups) {
			// Check if it has a first release date
			if (releaseGroup['first-release-date']) {
				const releaseDate = new Date(releaseGroup['first-release-date']);
				if (releaseDate >= lookbackStart) {
					// Determine the actual type
					let type: 'album' | 'single' = 'single';
					const primaryType = releaseGroup['primary-type']?.toLowerCase();

					if (primaryType === 'album' || primaryType === 'ep') {
						type = 'album';
					}

					// Create Tidal search link
					const tidalSearchQuery = encodeURIComponent(
						`${artistData.artists[0].name} ${releaseGroup.title}`
					);
					const tidalLink = `https://listen.tidal.com/search?q=${tidalSearchQuery}`;

					recentReleases.push({
						artistName: artistData.artists[0].name,
						title: releaseGroup.title,
						releaseDate: releaseGroup['first-release-date'],
						type: type,
						tidalLink: tidalLink
					});
				}
			}
		}

		return recentReleases;
	} catch (error) {
		console.error(`Error fetching releases for ${artistName}:`, error);
		return [];
	}
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
let releaseCache: { releases: Release[]; trackedArtists: string[]; fetchedAt: number } | null =
	null;

export async function getArtistReleases(
	fetch: typeof global.fetch,
	trackedArtists: string[]
): Promise<Release[]> {
	const sameArtists =
		releaseCache &&
		releaseCache.trackedArtists.length === trackedArtists.length &&
		releaseCache.trackedArtists.every((name) => trackedArtists.includes(name));

	if (releaseCache && sameArtists && Date.now() - releaseCache.fetchedAt < CACHE_TTL_MS) {
		return releaseCache.releases;
	}

	const allReleases: Release[] = [];

	// Fetch releases for all tracked artists
	for (const artist of trackedArtists) {
		const releases = await fetchArtistReleases(artist, fetch);
		allReleases.push(...releases);
	}

	// Sort by release date (newest first)
	allReleases.sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime());

	// MusicBrainz can list the same title multiple times per artist (reissues, regional variants)
	const seenKeys = new Set<string>();
	const dedupedReleases = allReleases.filter((release) => {
		const key = `${release.artistName}-${release.title}`;
		if (seenKeys.has(key)) return false;
		seenKeys.add(key);
		return true;
	});

	releaseCache = {
		releases: dedupedReleases,
		trackedArtists,
		fetchedAt: Date.now()
	};

	return dedupedReleases;
}
