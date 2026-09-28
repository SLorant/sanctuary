import { building } from '$app/environment';
import { startReleaseNotifier } from '$lib/server/notifier';

// Start the daily release check when the Node server boots
// (skipped while `vite build` analyses the code).
if (!building) {
	startReleaseNotifier();
}