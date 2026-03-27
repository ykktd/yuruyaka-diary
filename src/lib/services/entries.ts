import { supabase } from '$lib/supabase/client';
import type { Entry } from '$lib/types';

function toEntry(row: {
	id: string;
	date: string;
	mood: number;
	slept_well: boolean;
	busy: boolean;
	went_out: boolean;
	created_at: string | null;
	updated_at: string | null;
}): Entry {
	return {
		id: row.id,
		date: row.date,
		mood: row.mood,
		sleptWell: row.slept_well,
		busy: row.busy,
		wentOut: row.went_out,
		createdAt: row.created_at ?? '',
		updatedAt: row.updated_at ?? ''
	};
}

export async function getEntryByDate(date: string): Promise<Entry | null> {
	try {
		const { data, error } = await supabase
			.from('entries')
			.select('id, date, mood, slept_well, busy, went_out, created_at, updated_at')
			.eq('date', date)
			.maybeSingle();
		if (error) throw error;
		return data ? toEntry(data) : null;
	} catch (e) {
		console.error('getEntryByDate error:', e);
		return null;
	}
}

export async function upsertEntry(
	entry: Omit<Entry, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Entry> {
	const { data, error } = await supabase
		.from('entries')
		.upsert(
			{
				date: entry.date,
				mood: entry.mood,
				slept_well: entry.sleptWell,
				busy: entry.busy,
				went_out: entry.wentOut,
				updated_at: new Date().toISOString()
			},
			{ onConflict: 'date' }
		)
		.select('id, date, mood, slept_well, busy, went_out, created_at, updated_at')
		.single();
	if (error) throw error;
	return toEntry(data);
}

export async function getRecentEntryDates(days: number): Promise<string[]> {
	const since = new Date();
	since.setDate(since.getDate() - days + 1);
	const sinceStr = since.toISOString().split('T')[0];

	try {
		const { data, error } = await supabase
			.from('entries')
			.select('date')
			.gte('date', sinceStr)
			.order('date', { ascending: true });
		if (error) throw error;
		return (data ?? []).map((r) => r.date);
	} catch (e) {
		console.error('getRecentEntryDates error:', e);
		return [];
	}
}
