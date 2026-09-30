/**
 * Row shapes for the Supabase objects the website reads/writes.
 * Source of truth: docs/API_AND_DATA_CONTRACT.md (§2) in the main GitAlong repo.
 * Clients must tolerate missing/null email, pitch, arrays and counters.
 */

/** Columns shared by `users` (own row) and the `public_profiles` view. */
export interface PublicProfile {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  company: string | null;
  website_url: string | null;
  github_url: string | null;
  followers: number;
  following: number;
  public_repos: number;
  total_stars: number;
  languages: string[];
  interests: string[];
  github_topics: string[];
  looking_for: string[];
  seeking_skills: string[];
  pitch: string | null;
  created_at: string | null;
  last_active_at: string | null;
}

/** The signed-in user's own `users` row (only readable for yourself). */
export interface UserProfile extends PublicProfile {
  email: string | null;
  github_synced_at: string | null;
}

/** Columns a client may update on its own `users` row. */
export interface ProfileUpdate {
  name?: string | null;
  bio?: string | null;
  location?: string | null;
  company?: string | null;
  website_url?: string | null;
  languages?: string[];
  interests?: string[];
  looking_for?: string[];
  seeking_skills?: string[];
  pitch?: string | null;
}

export interface MatchRow {
  id: string;
  users: string[];
  matched_at: string;
  last_message: string | null;
  last_message_at: string | null;
  last_message_sender_id: string | null;
  is_read: boolean | null;
  pair_key?: string | null;
}

export type MessageType = 'text' | 'image' | 'link' | 'code';

export interface MessageRow {
  id: string;
  match_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: MessageType;
  sent_at: string;
  is_read: boolean;
}

const arr = (v: unknown): string[] => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);
const str = (v: unknown): string | null => (typeof v === 'string' && v.length > 0 ? v : null);

/** Normalise a raw `public_profiles`/`users` row so the UI never sees null arrays or counters. */
export function normalizePublicProfile(raw: Record<string, unknown>): PublicProfile {
  return {
    id: String(raw.id ?? ''),
    username: typeof raw.username === 'string' ? raw.username : '',
    name: str(raw.name),
    bio: str(raw.bio),
    avatar_url: str(raw.avatar_url),
    location: str(raw.location),
    company: str(raw.company),
    website_url: str(raw.website_url),
    github_url: str(raw.github_url),
    followers: num(raw.followers),
    following: num(raw.following),
    public_repos: num(raw.public_repos),
    total_stars: num(raw.total_stars),
    languages: arr(raw.languages),
    interests: arr(raw.interests),
    github_topics: arr(raw.github_topics),
    looking_for: arr(raw.looking_for),
    seeking_skills: arr(raw.seeking_skills),
    pitch: str(raw.pitch),
    created_at: str(raw.created_at),
    last_active_at: str(raw.last_active_at),
  };
}

export function normalizeUserProfile(raw: Record<string, unknown>): UserProfile {
  return {
    ...normalizePublicProfile(raw),
    email: str(raw.email),
    github_synced_at: str(raw.github_synced_at),
  };
}

/** Contract rule: unread for me = last_message != null && is_read == false && last_message_sender_id != me. */
export const isMatchUnreadFor = (match: MatchRow, me: string): boolean =>
  match.last_message != null && match.is_read === false && match.last_message_sender_id !== me;

export const otherMemberId = (match: MatchRow, me: string): string | null =>
  match.users.find((id) => id !== me) ?? null;

export const displayName = (p: { name?: string | null; username?: string | null } | null | undefined): string =>
  p?.name?.trim() || p?.username?.trim() || 'GitAlong developer';

export const DEFAULT_AVATAR = 'https://avatars.githubusercontent.com/u/0?v=4';
