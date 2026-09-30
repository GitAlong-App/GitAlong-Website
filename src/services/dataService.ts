/**
 * Direct Supabase access for the core loops (profile, swipe, match, chat,
 * safety). These go straight to RLS-protected tables and RPCs so they keep
 * working when the backend is cold or down.
 *
 * Contract: docs/API_AND_DATA_CONTRACT.md (§2–§4) in the main GitAlong repo.
 */

import { supabase } from '../lib/supabase';
import {
  MatchRow,
  MessageRow,
  ProfileUpdate,
  PublicProfile,
  UserProfile,
  normalizePublicProfile,
  normalizeUserProfile,
} from '../lib/types';
import { MESSAGE_MAX, PITCH_MAX, REPORT_DETAILS_MAX, ReportReason, isIntent } from '../lib/collab';
import { MyProgress, parseProgress } from '../lib/progress';
import { backendService } from './backendService';

export type SwipeAction = 'like' | 'dislike' | 'superLike';

export interface SwipeRow {
  id: string;
  swiped_user_id: string;
  action: SwipeAction;
  swiped_at: string;
}

export interface RepoSwipeRow {
  id: string;
  repo_id: number;
  action: 'save' | 'skip';
  repo_full_name: string;
  repo_name: string;
  repo_owner: string;
  repo_url: string;
  repo_description: string | null;
  repo_language: string | null;
  repo_stars: number;
  repo_forks: number;
  swiped_at: string;
}

export type RepoSwipeInput = Omit<RepoSwipeRow, 'id' | 'swiped_at' | 'repo_description' | 'repo_language' | 'repo_stars' | 'repo_forks'> & {
  repo_description?: string | null;
  repo_language?: string | null;
  repo_stars?: number;
  repo_forks?: number;
};

function client() {
  if (!supabase) {
    throw new Error('GitAlong is not configured (missing Supabase URL/key).');
  }
  return supabase;
}

/** Turn a PostgREST/RPC error into a readable Error. */
function fail(error: { message?: string } | null, fallback: string): never {
  throw new Error(error?.message || fallback);
}

/** Same as the generated `matches.pair_key`: both ids lowercased (Postgres uuid::text), sorted, joined with ':'. */
export const pairKey = (a: string, b: string): string =>
  [a.toLowerCase(), b.toLowerCase()].sort().join(':');

// ─── Profile ──────────────────────────────────────────────────────────────────

/** The caller's `users` row; creates it if missing and bumps last_active_at. */
export async function ensureUserProfile(): Promise<UserProfile> {
  const { data, error } = await client().rpc('ensure_user_profile');
  if (error) fail(error, 'Could not load your profile.');
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) throw new Error('Could not load your profile.');
  return normalizeUserProfile(row as Record<string, unknown>);
}

const cleanText = (v: string | null | undefined, max?: number): string | null => {
  if (v == null) return null;
  const t = v.trim();
  if (!t) return null;
  return max ? t.slice(0, max) : t;
};

const cleanList = (values: string[] | undefined): string[] =>
  Array.from(new Set((values ?? []).map((v) => v.trim()).filter(Boolean)));

/**
 * Update the caller's own profile. Only the columns RLS allows clients to
 * write are sent: name, bio, location, company, website_url, languages,
 * interests, looking_for, seeking_skills, pitch.
 */
export async function updateMyProfile(userId: string, patch: ProfileUpdate): Promise<UserProfile> {
  const payload: Record<string, unknown> = {};
  if ('name' in patch) payload.name = cleanText(patch.name, 100);
  if ('bio' in patch) payload.bio = cleanText(patch.bio, 500);
  if ('location' in patch) payload.location = cleanText(patch.location, 100);
  if ('company' in patch) payload.company = cleanText(patch.company, 100);
  if ('website_url' in patch) payload.website_url = cleanText(patch.website_url, 300);
  if ('languages' in patch) payload.languages = cleanList(patch.languages);
  if ('interests' in patch) payload.interests = cleanList(patch.interests);
  if ('seeking_skills' in patch) payload.seeking_skills = cleanList(patch.seeking_skills);
  if ('looking_for' in patch) payload.looking_for = cleanList(patch.looking_for).filter(isIntent);
  if ('pitch' in patch) payload.pitch = cleanText(patch.pitch, PITCH_MAX);

  const { data, error } = await client()
    .from('users')
    .update(payload)
    .eq('id', userId)
    .select('*')
    .single();
  if (error) fail(error, 'Could not save your profile.');
  return normalizeUserProfile(data as Record<string, unknown>);
}

/** Batch-load other people's public profiles (no email; hides blocked users). */
export async function fetchPublicProfiles(ids: string[]): Promise<Map<string, PublicProfile>> {
  const unique = Array.from(new Set(ids.filter(Boolean)));
  const result = new Map<string, PublicProfile>();
  if (unique.length === 0) return result;

  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += 100) chunks.push(unique.slice(i, i + 100));

  const responses = await Promise.all(
    chunks.map((chunk) => client().from('public_profiles').select('*').in('id', chunk))
  );
  for (const { data, error } of responses) {
    if (error) fail(error, 'Could not load profiles.');
    for (const row of data ?? []) {
      const p = normalizePublicProfile(row as Record<string, unknown>);
      result.set(p.id, p);
    }
  }
  return result;
}

// ─── Swipes ───────────────────────────────────────────────────────────────────

/** Swipe → match flow (§4): upsert the swipe, then look for the trigger-created match. */
export async function recordSwipe(
  me: string,
  otherId: string,
  action: SwipeAction
): Promise<{ matched: boolean; matchId: string | null }> {
  const { error } = await client()
    .from('swipes')
    .upsert({ swiper_id: me, swiped_user_id: otherId, action }, { onConflict: 'swiper_id,swiped_user_id' });
  if (error) fail(error, 'Could not save your swipe.');

  if (action === 'dislike') return { matched: false, matchId: null };

  const { data, error: matchError } = await client()
    .from('matches')
    .select('id')
    .eq('pair_key', pairKey(me, otherId))
    .maybeSingle();
  if (matchError) return { matched: false, matchId: null };
  return { matched: !!data, matchId: (data as { id: string } | null)?.id ?? null };
}

export async function getSwipeHistory(me: string, limit = 100): Promise<SwipeRow[]> {
  const { data, error } = await client()
    .from('swipes')
    .select('id, swiped_user_id, action, swiped_at')
    .eq('swiper_id', me)
    .order('swiped_at', { ascending: false })
    .limit(limit);
  if (error) fail(error, 'Could not load your swipes.');
  return (data ?? []) as SwipeRow[];
}

/** People waiting on your swipe. Never reveals who. */
export async function getLikesReceivedCount(): Promise<number> {
  const { data, error } = await client().rpc('get_likes_received_count');
  if (error) fail(error, 'Could not load likes.');
  return typeof data === 'number' ? data : Number(data) || 0;
}

// ─── Repo swipes (project discovery) ─────────────────────────────────────────

export async function recordRepoSwipe(me: string, input: RepoSwipeInput): Promise<void> {
  const { error } = await client()
    .from('repo_swipes')
    .upsert(
      {
        user_id: me,
        repo_id: input.repo_id,
        action: input.action,
        repo_full_name: input.repo_full_name,
        repo_name: input.repo_name,
        repo_owner: input.repo_owner,
        repo_url: input.repo_url,
        repo_description: input.repo_description ?? null,
        repo_language: input.repo_language ?? null,
        repo_stars: input.repo_stars ?? 0,
        repo_forks: input.repo_forks ?? 0,
        swiped_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,repo_id' }
    );
  if (error) fail(error, 'Could not save that repository.');
}

export async function getRepoSwipeHistory(me: string, limit = 200, action?: 'save' | 'skip'): Promise<RepoSwipeRow[]> {
  let query = client()
    .from('repo_swipes')
    .select('id, repo_id, action, repo_full_name, repo_name, repo_owner, repo_url, repo_description, repo_language, repo_stars, repo_forks, swiped_at')
    .eq('user_id', me)
    .order('swiped_at', { ascending: false })
    .limit(limit);
  if (action) query = query.eq('action', action);
  const { data, error } = await query;
  if (error) fail(error, 'Could not load saved repositories.');
  return (data ?? []) as RepoSwipeRow[];
}

// ─── Matches & messages ──────────────────────────────────────────────────────

/** Matches you are in (RLS limits rows to your own). */
export async function listMatches(): Promise<MatchRow[]> {
  const { data, error } = await client()
    .from('matches')
    .select('id, users, matched_at, last_message, last_message_at, last_message_sender_id, is_read, pair_key')
    .order('matched_at', { ascending: false })
    .limit(200);
  if (error) fail(error, 'Could not load your matches.');
  return (data ?? []) as MatchRow[];
}

/** The most recent messages of a match, oldest first. */
export async function listMessages(matchId: string, limit = 200): Promise<MessageRow[]> {
  const { data, error } = await client()
    .from('messages')
    .select('id, match_id, sender_id, receiver_id, content, type, sent_at, is_read')
    .eq('match_id', matchId)
    .order('sent_at', { ascending: false })
    .limit(limit);
  if (error) fail(error, 'Could not load messages.');
  return ((data ?? []) as MessageRow[]).reverse();
}

/** Send a text message. The trigger sets sent_at and updates the match preview. Content is stored verbatim. */
export async function sendMessage(params: {
  matchId: string;
  senderId: string;
  receiverId: string;
  content: string;
}): Promise<MessageRow> {
  const content = params.content;
  if (!content.trim()) throw new Error('Message is empty.');
  if (content.length > MESSAGE_MAX) throw new Error(`Messages can be at most ${MESSAGE_MAX} characters.`);

  const { data, error } = await client()
    .from('messages')
    .insert({
      match_id: params.matchId,
      sender_id: params.senderId,
      receiver_id: params.receiverId,
      content,
      type: 'text',
    })
    .select('id, match_id, sender_id, receiver_id, content, type, sent_at, is_read')
    .single();
  if (error) fail(error, 'Could not send your message.');
  return data as MessageRow;
}

export async function markMatchRead(matchId: string): Promise<void> {
  const { error } = await client().rpc('mark_match_read', { p_match_id: matchId });
  if (error) fail(error, 'Could not mark messages as read.');
}

export async function unmatch(matchId: string): Promise<void> {
  const { error } = await client().from('matches').delete().eq('id', matchId);
  if (error) fail(error, 'Could not unmatch.');
}

// ─── Safety ──────────────────────────────────────────────────────────────────

/** Block someone: hides both sides from each other and ends any match. */
export async function blockUser(userId: string): Promise<void> {
  const { error } = await client().rpc('block_user', { p_user_id: userId });
  if (error) fail(error, 'Could not block this user.');
}

export async function reportUser(params: {
  reporterId: string;
  reportedId: string;
  matchId?: string | null;
  reason: ReportReason;
  details?: string;
}): Promise<void> {
  const details = params.details?.trim().slice(0, REPORT_DETAILS_MAX) || null;
  const { error } = await client().from('reports').insert({
    reporter_id: params.reporterId,
    reported_id: params.reportedId,
    match_id: params.matchId ?? null,
    reason: params.reason,
    details,
  });
  if (error) fail(error, 'Could not send your report.');
}

// ─── Progress (streaks, daily goal, XP, level, achievements) ─────────────────

/** Thrown when the progress RPC can't be used (not deployed yet, bad payload, …). */
export class ProgressUnavailableError extends Error {
  /** True when retrying is pointless for this session (e.g. the RPC doesn't exist). */
  permanent: boolean;
  constructor(message: string, permanent: boolean) {
    super(message);
    this.name = 'ProgressUnavailableError';
    this.permanent = permanent;
  }
}

/**
 * The caller's progress from `get_my_progress` (docs/DESIGN_SYSTEM.md §6).
 * JS `getTimezoneOffset()` is inverted (IST gives -330), so it is negated:
 * the RPC expects the device's UTC offset in minutes (IST = +330).
 */
export async function getMyProgress(): Promise<MyProgress> {
  const { data, error } = await client().rpc('get_my_progress', {
    p_tz_offset_minutes: -new Date().getTimezoneOffset(),
  });
  if (error) {
    const code = (error as { code?: string }).code ?? '';
    const missing =
      code === 'PGRST202' || code === '42883' || /could not find the function|does not exist/i.test(error.message ?? '');
    throw new ProgressUnavailableError(error.message || 'Progress is unavailable.', missing);
  }
  const parsed = parseProgress(data);
  if (!parsed) throw new ProgressUnavailableError('Progress data had an unexpected shape.', true);
  return parsed;
}

// ─── Account ─────────────────────────────────────────────────────────────────

/** Everything the signed-in user can read about themselves, for "Export my data". */
export async function exportMyData(me: string): Promise<Record<string, unknown>> {
  const c = client();
  const [profile, swipes, matches, messages, repoSwipes, blocks, reports] = await Promise.all([
    c.from('users').select('*').eq('id', me).maybeSingle(),
    c.from('swipes').select('swiped_user_id, action, swiped_at').eq('swiper_id', me).order('swiped_at', { ascending: false }).limit(5000),
    c.from('matches').select('id, users, matched_at, last_message_at').order('matched_at', { ascending: false }).limit(1000),
    c.from('messages').select('id, match_id, sender_id, receiver_id, content, type, sent_at, is_read').order('sent_at', { ascending: true }).limit(10000),
    c.from('repo_swipes').select('repo_full_name, repo_url, action, swiped_at').eq('user_id', me).limit(5000),
    c.from('blocks').select('blocked_id, created_at').eq('blocker_id', me),
    c.from('reports').select('reported_id, reason, details, created_at').eq('reporter_id', me),
  ]);
  const firstError = [profile, swipes, matches, messages, repoSwipes].find((r) => r.error)?.error;
  if (firstError) fail(firstError, 'Could not export your data.');

  return {
    exported_at: new Date().toISOString(),
    profile: profile.data,
    swipes: swipes.data ?? [],
    matches: matches.data ?? [],
    messages: messages.data ?? [],
    repo_swipes: repoSwipes.data ?? [],
    blocks: blocks.error ? [] : blocks.data ?? [],
    reports: reports.error ? [] : reports.data ?? [],
  };
}

/**
 * Permanently delete the account: backend first, database RPC as fallback.
 * Throws if both fail — never report success unless deletion happened.
 */
export async function deleteMyAccount(): Promise<void> {
  try {
    await backendService.deleteMyAccount();
    return;
  } catch (backendError) {
    const { error } = await client().rpc('delete_my_account');
    if (error) {
      const reason = backendError instanceof Error ? backendError.message : String(backendError);
      throw new Error(
        `Your account could not be deleted (${reason}; ${error.message}). Please try again, or email srivallabhkakarala@gmail.com and we will delete it for you.`
      );
    }
  }
}
