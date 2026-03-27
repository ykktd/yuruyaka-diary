import { supabase } from '$lib/supabase/client';
import type { DiaryResponse } from '$lib/types';

function toDiaryResponse(row: {
	id: string;
	entry_id: string;
	question_id: string;
	answer_text: string | null;
	created_at: string | null;
}): DiaryResponse {
	return {
		id: row.id,
		entryId: row.entry_id,
		promptId: row.question_id,
		content: row.answer_text ?? '',
		createdAt: row.created_at ?? ''
	};
}

export async function getResponsesByEntryId(entryId: string): Promise<DiaryResponse[]> {
	try {
		const { data, error } = await supabase
			.from('question_answers')
			.select('id, entry_id, question_id, answer_text, created_at')
			.eq('entry_id', entryId);
		if (error) throw error;
		return (data ?? []).map(toDiaryResponse);
	} catch (e) {
		console.error('getResponsesByEntryId error:', e);
		return [];
	}
}

export async function upsertResponse(
	entryId: string,
	promptId: string,
	content: string
): Promise<DiaryResponse> {
	const { data, error } = await supabase
		.from('question_answers')
		.upsert(
			{ entry_id: entryId, question_id: promptId, answer_text: content },
			{ onConflict: 'entry_id,question_id' }
		)
		.select('id, entry_id, question_id, answer_text, created_at')
		.single();
	if (error) throw error;
	return toDiaryResponse(data);
}
