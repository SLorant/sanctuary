import { json } from '@sveltejs/kit';
import { trackedArtistDb } from '$lib/server/db';
import type { RequestHandler } from './$types';

import { env } from '$env/dynamic/private';

interface Concert {
	artistName: string;
	eventName: string;
	date: string;
	city: string;
	venue: string;
	url: string;
}

export const GET: RequestHandler = async ({ fetch }) => {
	try {
		const trackedArtistsData = trackedArtistDb.getAll();
		const trackedArtists = trackedArtistsData.map((a) => a.name);

		if (trackedArtists.length === 0) {
			return json({ concerts: [] });
		}

		// Add your Ticketmaster API Key to your `.env` file as TICKETMASTER_API_KEY.
		// Ex: TICKETMASTER_API_KEY=your_key_here
		const apiKey = env.TICKETMASTER_API_KEY || 'YOUR_TICKETMASTER_API_KEY';

		if (apiKey === 'YOUR_TICKETMASTER_API_KEY') {
			console.warn('TICKETMASTER_API_KEY is not set in `.env`.');
			return json({ concerts: [] });
		}

		const allConcerts: Concert[] = [];
		const today = new Date();
		const nextYear = new Date();
		nextYear.setFullYear(today.getFullYear() + 1);

		const startDateTime = today.toISOString().split('.')[0] + 'Z';
		const endDateTime = nextYear.toISOString().split('.')[0] + 'Z';

		for (const artist of trackedArtists) {
			// Sorting by date to get chronological concerts.
			const searchUrl = `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${apiKey}&keyword=${encodeURIComponent(artist)}&classificationName=Music&startDateTime=${startDateTime}&endDateTime=${endDateTime}&sort=date,asc`;

			try {
				const response = await fetch(searchUrl);

				const data = await response.json();
				if (!data._embedded || !data._embedded.events) {
					// Polite quota handling (Ticketmaster limit is ~5 requests/sec)
					await new Promise((resolve) => setTimeout(resolve, 200));
					continue;
				}

				for (const event of data._embedded.events) {
					let city = 'Unknown City';
					let venueName = 'Unknown Venue';

					if (event._embedded && event._embedded.venues && event._embedded.venues.length > 0) {
						const v = event._embedded.venues[0];
						if (v.name) venueName = v.name;
						if (v.city && v.city.name) city = v.city.name;
					}

					const date = event.dates?.start?.localDate || event.dates?.start?.dateTime || '';

					allConcerts.push({
						artistName: artist,
						eventName: event.name,
						date,
						city,
						venue: venueName,
						url: event.url || ''
					});
				}

				await new Promise((resolve) => setTimeout(resolve, 200));
			} catch (err) {
				console.error(`Error fetching Ticketmaster concerts for ${artist}:`, err);
				await new Promise((resolve) => setTimeout(resolve, 200));
			}
		}

		allConcerts.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

		// Drop duplicates (Ticketmaster can return multi-day festivals as repeats)
		const uniqueConcerts: Concert[] = [];
		const seen = new Set();
		for (const c of allConcerts) {
			const id = `${c.artistName}-${c.date}-${c.city}`;
			if (!seen.has(id)) {
				seen.add(id);
				uniqueConcerts.push(c);
			}
		}

		return json({ concerts: uniqueConcerts });
	} catch (error) {
		console.error('Error fetching concerts:', error);
		return json({ error: 'Failed to fetch concerts' }, { status: 500 });
	}
};
