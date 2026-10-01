import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Sign-in and the app will not work until they are set (see .env.example).'
  );
}

/**
 * A failed OAuth round trip comes back as `?error=…&error_description=…` (or the
 * same in the hash). Read it before the client starts parsing the URL, then strip
 * it so a reload doesn't show the error again.
 */
function takeOAuthRedirectError(): string | null {
  if (typeof window === 'undefined') return null;
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));
  const code = search.get('error') ?? hash.get('error');
  if (!code) return null;
  const description = (search.get('error_description') ?? hash.get('error_description') ?? '').replace(/\+/g, ' ');
  ['error', 'error_code', 'error_description'].forEach((k) => search.delete(k));
  const query = search.toString();
  window.history.replaceState(window.history.state, '', `${window.location.pathname}${query ? `?${query}` : ''}`);
  if (code === 'access_denied') return 'GitHub sign-in was cancelled.';
  if (/exchange external code/i.test(description)) {
    return 'GitHub sign-in failed: the GitHub OAuth app credentials in Supabase are out of date. Please try again later.';
  }
  return `Sign-in failed: ${description || code}`;
}

export const oauthRedirectError = takeOAuthRedirectError();

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * The current Supabase access token, read from the live session right before
 * it is needed. supabase-js refreshes an expired session here, so never cache
 * the result — tokens expire hourly.
 */
export async function getAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) return null;
  return data.session?.access_token ?? null;
}

/** Force a session refresh (used once after a backend 401) and return the new token. */
export async function refreshAccessToken(): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.refreshSession();
  if (error) return null;
  return data.session?.access_token ?? null;
}
