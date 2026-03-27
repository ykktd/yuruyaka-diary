import type { PageLoad } from './$types';
import { getEntryByDate, getRecentEntryDates } from '$lib/services/entries';

export const load: PageLoad = async () => {
	const todayDate = new Date();
	const today = todayDate.toISOString().split('T')[0];

	const yesterdayDate = new Date(todayDate);
	yesterdayDate.setDate(yesterdayDate.getDate() - 1);
	const yesterday = yesterdayDate.toISOString().split('T')[0];

	const [todayEntry, yesterdayEntry, recentDates] = await Promise.all([
		getEntryByDate(today),
		getEntryByDate(yesterday),
		getRecentEntryDates(7)
	]);

	return { today, yesterday, todayEntry, yesterdayEntry, recentDates };
};
