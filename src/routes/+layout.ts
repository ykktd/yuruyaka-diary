import type { LayoutLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { supabase } from '$lib/supabase/client';

export const ssr = false;

const PUBLIC_ROUTES = ['/login', '/signup'];

export const load: LayoutLoad = async ({ url }) => {
	// メール確認・マジックリンク等の PKCE コードを明示的に交換する。
	// detectSessionInUrl は非同期処理のため getSession() より先に完了しない場合があり、
	// ここで先に交換することでリダイレクトループを防ぐ。
	const code = url.searchParams.get('code');
	if (code) {
		try {
			await supabase.auth.exchangeCodeForSession(code);
		} catch {
			// コードが使用済み or 無効な場合は無視して続行
		}
	}

	const {
		data: { session }
	} = await supabase.auth.getSession();

	if (!session && !PUBLIC_ROUTES.includes(url.pathname)) {
		redirect(302, '/login');
	}
	if (session && PUBLIC_ROUTES.includes(url.pathname)) {
		redirect(302, '/');
	}

	return { session, user: session?.user ?? null };
};
