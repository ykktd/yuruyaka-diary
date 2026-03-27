import { supabase } from '$lib/supabase/client';
import type { Prompt } from '$lib/types';

function toPrompt(row: {
	id: string;
	type: string;
	text: string;
	is_active: boolean;
	created_at: string | null;
}): Prompt {
	return {
		id: row.id,
		type: row.type as 'daily_question' | 'free_note',
		text: row.text,
		isActive: row.is_active,
		createdAt: row.created_at ?? ''
	};
}

export async function getActivePrompts(type: 'daily_question' | 'free_note'): Promise<Prompt[]> {
	try {
		const { data, error } = await supabase
			.from('questions')
			.select('id, type, text, is_active, created_at')
			.eq('type', type)
			.eq('is_active', true);
		if (error) throw error;
		return (data ?? []).map(toPrompt);
	} catch (e) {
		console.error('getActivePrompts error:', e);
		return [];
	}
}
