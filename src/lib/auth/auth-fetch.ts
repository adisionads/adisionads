import { supabase } from '@/lib/supabase/client';

/**
 * Client-Side Authenticated Fetch Helper
 * Wraps native fetch() and automatically injects the current Supabase Auth
 * access token as an 'Authorization: Bearer <token>' header.
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers || {});

  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  } catch (err) {
    console.warn('[authFetch] Could not retrieve Supabase session:', err);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
