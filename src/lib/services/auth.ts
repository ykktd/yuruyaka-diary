import { supabase } from '$lib/supabase/client';
import type { Session } from '@supabase/supabase-js';

export async function signUp(email: string, password: string, displayName: string): Promise<void> {
	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: { data: { display_name: displayName } }
	});
	if (error) throw error;
}

export async function signIn(email: string, password: string): Promise<void> {
	const { error } = await supabase.auth.signInWithPassword({ email, password });
	if (error) throw error;
}

export async function signOut(): Promise<void> {
	const { error } = await supabase.auth.signOut();
	if (error) throw error;
}

export async function getSession(): Promise<Session | null> {
	const { data } = await supabase.auth.getSession();
	return data.session;
}
