export function getDaysInRange(startDate: string, limit?: number): string[] {
	const start = new Date(startDate);
	const today = new Date();
	const days: string[] = [];

	for (let d = new Date(start); d <= today; d.setDate(d.getDate() + 1)) {
		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const day = String(d.getDate()).padStart(2, '0');
		days.push(`${year}-${month}-${day}`);
	}

	if (limit) {
		return days.slice(-limit);
	}
	return days;
}

export function getWeekDays(startDate: string, limit?: number): string[][] {
	const days = getDaysInRange(startDate, limit);
	const weeks: string[][] = [];
	let currentWeek: string[] = [];

	const startDay = new Date(startDate).getDay();

	// Add empty slots for days before start date in first week
	for (let i = 0; i < startDay; i++) {
		currentWeek.push('');
	}

	for (const day of days) {
		if (currentWeek.length === 7) {
			weeks.push(currentWeek);
			currentWeek = [];
		}
		currentWeek.push(day);
	}

	if (currentWeek.length > 0) {
		weeks.push(currentWeek);
	}

	return weeks;
}
