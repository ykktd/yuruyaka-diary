import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getEntryByDate } from '$lib/services/entries';
import { getResponsesByEntryId } from '$lib/services/responses';
import { getActivePrompts } from '$lib/services/prompts';

export const load: PageLoad = async ({ params }) => {
	const { date } = params;
	const today = new Date().toISOString().split('T')[0];

	// 未来日はダッシュボードへリダイレクト
	if (date > today) {
		redirect(302, '/');
	}

	const isPastDay = date < today;

	const [entry, dailyPrompts, freeNotePrompts] = await Promise.all([
		getEntryByDate(date),
		getActivePrompts('daily_question'),
		getActivePrompts('free_note')
	]);

	const responses = entry ? await getResponsesByEntryId(entry.id) : [];

	// 日付から決定論的に質問を選ぶ
	const dayIndex = dailyPrompts.length > 0 ? new Date(date).getDate() % dailyPrompts.length : 0;
	const todayPrompt = dailyPrompts[dayIndex] ?? null;

	const freeNotePrompt = freeNotePrompts[0] ?? null;

	return { date, isPastDay, entry, todayPrompt, freeNotePrompt, responses };
};
