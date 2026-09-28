import { env } from '$env/dynamic/private';
import { trackedArtistDb, announcedReleaseDb, notifierStateDb } from './db';
import { fetchArtistReleasesStrict, normalizeReleaseDate, type Release } from './releases';

/**
 * Notification rules
 *  - First time a release is seen (already out OR upcoming): one notification.
 *  - On the release day itself: a second notification.
 *  - Seen on/after its release day: only the first one.
 *  - Partial dates ("2026", "2026-10") count as the first day of that period.
 */

// ---- settings --------------------------------------------------------------

// Release-groups with any of these MusicBrainz secondary types are skipped.
// Other candidates: 'Compilation', 'Remix', 'DJ-mix', 'Demo', 'Soundtrack'.
const EXCLUDED_SECONDARY_TYPES = new Set(['Live']);

// Local hour (container TZ!) after which the daily check may run.
const NOTIFY_HOUR = Number(env.RELEASE_NOTIFY_HOUR ?? 9);

// The first time an artist is scanned, record their recent releases WITHOUT
// pinging (otherwise adding an artist floods the channel). Upcoming releases
// seeded this way still get their release-day notification.
// Set RELEASE_SEED_SILENTLY=false to disable (useful for testing).
const SEED_SILENTLY = env.RELEASE_SEED_SILENTLY !== 'false';

// If a run had failures, retry at most this often.
const RETRY_AFTER_MS = 60 * 60 * 1000;

// ---- presentation ----------------------------------------------------------

type Kind = 'upcoming' | 'new' | 'today' | 'out';

const KIND_STYLE: Record<Kind, { label: string; color: number }> = {
	upcoming: { label: '📅 Upcoming release', color: 0xf5a623 },
	new: { label: '🆕 New release', color: 0x5865f2 },
	today: { label: '🎉 Out today', color: 0x57f287 },
	out: { label: '🎉 Now out', color: 0x57f287 } // release-day ping that was delayed
};

function buildEmbed(release: Release, kind: Kind) {
	const style = KIND_STYLE[kind];
	const exactDay = release.releaseDate.split('-').length === 3;
	const dateText = exactDay
		? release.releaseDate
		: `${release.releaseDate} (exact day unknown)`;

	return {
		author: { name: style.label },
		title: `${release.artistName} – ${release.title}`,
		url: release.tidalLink,
		color: style.color,
		thumbnail: {
			url: `https://coverartarchive.org/release-group/${release.id}/front-250`
		},
		fields: [
			{ name: 'Type', value: release.type === 'album' ? 'Album / EP' : 'Single', inline: true },
			{ name: 'Release date', value: dateText, inline: true }
		],
		footer: { text: 'MusicBrainz' }
	};
}

// ---- discord ---------------------------------------------------------------

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function postWebhook(embed: ReturnType<typeof buildEmbed>): Promise<void> {
	const payload: Record<string, unknown> = {
		username: env.DISCORD_WEBHOOK_USERNAME || 'Release Radar',
		embeds: [embed]
	};
	if (env.DISCORD_WEBHOOK_AVATAR_URL) payload.avatar_url = env.DISCORD_WEBHOOK_AVATAR_URL;

	for (let attempt = 0; attempt < 3; attempt++) {
		const response = await fetch(env.DISCORD_WEBHOOK_URL!, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload)
		});

		if (response.ok) return;

		if (response.status === 429) {
			const body = (await response.json().catch(() => ({}))) as { retry_after?: number };
			await sleep((body.retry_after ?? 1) * 1000 + 100);
			continue;
		}

		throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
	}
	throw new Error('Discord webhook kept rate-limiting us');
}

async function notify(release: Release, kind: Kind): Promise<void> {
	await postWebhook(buildEmbed(release, kind));
	await sleep(1000); // stay well under webhook rate limits
}

// ---- core logic ------------------------------------------------------------

function todayLocal(): string {
	// en-CA formats as YYYY-MM-DD, in the process's timezone (set TZ in docker!)
	return new Date().toLocaleDateString('en-CA');
}

async function processRelease(release: Release, today: string, silent: boolean): Promise<void> {
	const date = normalizeReleaseDate(release.releaseDate);
	const stored = announcedReleaseDb.get(release.id);

	// ---- never seen before ----
	if (!stored) {
		const record = {
			id: release.id,
			artistName: release.artistName,
			title: release.title,
			releaseDate: date
		};

		if (!silent) {
			const kind: Kind = date > today ? 'upcoming' : date === today ? 'today' : 'new';
			await notify(release, kind);
		}
		// If it's already out (or out today), there is no second notification to wait for.
		announcedReleaseDb.insert(record, date <= today);
		return;
	}

	// ---- already known ----
	// The date can change on MusicBrainz (postponed, or a year becomes a real day).
	if (stored.releaseDate !== date) {
		announcedReleaseDb.updateDate(release.id, date);
	}

	if (!stored.releaseDayNotified && date <= today) {
		// Normally date === today. If the server missed that day, still notify once, late.
		await notify(release, date === today ? 'today' : 'out');
		announcedReleaseDb.markReleaseDayNotified(release.id);
	}
}

let running = false;

/** Runs one full check. Returns true if nothing failed. */
export async function runReleaseCheck(): Promise<boolean> {
	if (running) return false;
	running = true;
	let allOk = true;

	try {
		const today = todayLocal();

		for (const artist of trackedArtistDb.getAll()) {
			let releases: Release[];
			try {
				releases = await fetchArtistReleasesStrict(artist.name, fetch);
			} catch (error) {
				console.error(`[release-notifier] fetch failed for ${artist.name}:`, error);
				allOk = false;
				continue;
			}

			const seedKey = `seeded:${artist.name}`;
			const silent = SEED_SILENTLY && !notifierStateDb.get(seedKey);

			for (const release of releases) {
				if (release.secondaryTypes.some((type) => EXCLUDED_SECONDARY_TYPES.has(type))) continue;

				try {
					await processRelease(release, today, silent);
				} catch (error) {
					// e.g. webhook down: nothing was recorded, so it is retried on the next run
					console.error(`[release-notifier] ${release.artistName} – ${release.title}:`, error);
					allOk = false;
				}
			}

			if (silent) notifierStateDb.set(seedKey, today);
		}
	} finally {
		running = false;
	}

	return allOk;
}

// ---- scheduler -------------------------------------------------------------

export function startReleaseNotifier(): void {
	// Guard against double start (dev-mode module reloads)
	const g = globalThis as { __releaseNotifierStarted?: boolean };
	if (g.__releaseNotifierStarted) return;
	g.__releaseNotifierStarted = true;

	if (!env.DISCORD_WEBHOOK_URL) {
		console.warn('[release-notifier] DISCORD_WEBHOOK_URL is not set, notifier disabled.');
		return;
	}

	let lastAttempt = 0;

	const tick = async () => {
		const today = todayLocal();
		if (new Date().getHours() < NOTIFY_HOUR) return;
		if (notifierStateDb.get('last_success_day') === today) return;
		if (Date.now() - lastAttempt < RETRY_AFTER_MS) return;

		lastAttempt = Date.now();
		console.log('[release-notifier] running check...');
		const ok = await runReleaseCheck();
		if (ok) {
			notifierStateDb.set('last_success_day', today);
			console.log('[release-notifier] check finished.');
		} else {
			console.warn('[release-notifier] check had errors, will retry in about an hour.');
		}
	};

	const safeTick = () => tick().catch((error) => console.error('[release-notifier]', error));

	setTimeout(safeTick, 15_000); // catch-up shortly after startup
	setInterval(safeTick, 60_000);
	console.log(`[release-notifier] enabled, daily check after ${NOTIFY_HOUR}:00 local time.`);
}