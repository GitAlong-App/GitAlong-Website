/**
 * Gamification data (docs/DESIGN_SYSTEM.md §6). All numbers come from the
 * `get_my_progress` RPC; this module only parses them defensively and derives
 * display values. Profile strength is computed client-side with the same 8
 * checks the server uses for `profile_complete`.
 */
import { isAchievementKey, type AchievementKey } from './achievements';

export interface MyProgress {
  streakDays: number;
  bestStreak: number;
  activeToday: boolean;
  /** 7 days, oldest → today. */
  weekActivity: boolean[];
  todaySwipes: number;
  dailyGoal: number;
  goalDays: number;
  totalSwipes: number;
  matches: number;
  conversationsStarted: number;
  qualifiedConversations: number;
  messagesSent: number;
  profileComplete: boolean;
  xp: number;
  level: number;
  levelFloorXp: number;
  nextLevelXp: number;
  achievements: AchievementKey[];
}

const DEFAULT_DAILY_GOAL = 10;

const int = (v: unknown, fallback = 0): number => {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : fallback;
};

const bool = (v: unknown): boolean => v === true || v === 'true';

/** Level = ⌊√(xp / 50)⌋ + 1. */
export const levelForXp = (xp: number): number => Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
export const levelFloorXp = (level: number): number => 50 * (level - 1) * (level - 1);
export const nextLevelXp = (level: number): number => 50 * level * level;

/**
 * Parse the RPC's JSON object. Returns null when the payload is not usable
 * (so the caller hides the progress UI instead of showing nonsense).
 */
export function parseProgress(raw: unknown): MyProgress | null {
  let value: unknown = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch {
      return null;
    }
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const r = value as Record<string, unknown>;
  // A payload without XP or streak data is not the progress object.
  if (!('xp' in r) && !('streak_days' in r)) return null;

  const xp = int(r.xp);
  const computedLevel = levelForXp(xp);
  const level = int(r.level, computedLevel) || computedLevel;
  let floor = int(r.level_floor_xp, levelFloorXp(level));
  let next = int(r.next_level_xp, nextLevelXp(level));
  if (next <= floor) {
    floor = levelFloorXp(level);
    next = nextLevelXp(level);
  }

  const weekRaw = Array.isArray(r.week_activity) ? r.week_activity.slice(-7).map(bool) : [];
  const weekActivity = [...Array<boolean>(Math.max(0, 7 - weekRaw.length)).fill(false), ...weekRaw];

  const achievements = Array.isArray(r.achievements)
    ? Array.from(new Set(r.achievements.filter((a): a is string => typeof a === 'string').filter(isAchievementKey)))
    : [];

  const activeToday = 'active_today' in r ? bool(r.active_today) : weekActivity[6] ?? false;

  return {
    streakDays: int(r.streak_days),
    bestStreak: int(r.best_streak),
    activeToday,
    weekActivity,
    todaySwipes: int(r.today_swipes),
    dailyGoal: int(r.daily_goal, DEFAULT_DAILY_GOAL) || DEFAULT_DAILY_GOAL,
    goalDays: int(r.goal_days),
    totalSwipes: int(r.total_swipes),
    matches: int(r.matches),
    conversationsStarted: int(r.conversations_started),
    qualifiedConversations: int(r.qualified_conversations),
    messagesSent: int(r.messages_sent),
    profileComplete: bool(r.profile_complete),
    xp,
    level,
    levelFloorXp: floor,
    nextLevelXp: next,
    achievements,
  };
}

/** 0..1 progress through the current level. */
export const levelProgress = (p: Pick<MyProgress, 'xp' | 'levelFloorXp' | 'nextLevelXp'>): number => {
  const span = p.nextLevelXp - p.levelFloorXp;
  if (span <= 0) return 0;
  return Math.min(1, Math.max(0, (p.xp - p.levelFloorXp) / span));
};

// ─── Profile strength: 8 checks, identical on app, web and server ────────────

export interface StrengthProfile {
  avatar_url?: string | null;
  bio?: string | null;
  pitch?: string | null;
  location?: string | null;
  looking_for?: string[] | null;
  languages?: string[] | null;
  interests?: string[] | null;
  seeking_skills?: string[] | null;
}

export type ProfileCheckKey =
  | 'avatar'
  | 'bio'
  | 'pitch'
  | 'looking_for'
  | 'languages'
  | 'interests'
  | 'seeking_skills'
  | 'location';

export interface ProfileCheck {
  key: ProfileCheckKey;
  label: string;
  done: boolean;
}

const filled = (s: string | null | undefined) => !!s && s.trim().length > 0;
const some = (a: string[] | null | undefined) => Array.isArray(a) && a.some((x) => filled(x));

export function profileChecks(p: StrengthProfile | null | undefined): ProfileCheck[] {
  return [
    { key: 'avatar', label: 'Profile photo (from GitHub)', done: filled(p?.avatar_url) },
    { key: 'bio', label: 'A short bio', done: filled(p?.bio) },
    { key: 'pitch', label: 'Your pitch', done: filled(p?.pitch) },
    { key: 'looking_for', label: 'What you’re looking for', done: some(p?.looking_for) },
    { key: 'languages', label: 'Languages you work in', done: some(p?.languages) },
    { key: 'interests', label: 'Your interests', done: some(p?.interests) },
    { key: 'seeking_skills', label: 'Skills you want in a partner', done: some(p?.seeking_skills) },
    { key: 'location', label: 'Your location', done: filled(p?.location) },
  ];
}

/** Checks passed ÷ 8. */
export const profileStrength = (p: StrengthProfile | null | undefined): number => {
  const checks = profileChecks(p);
  return checks.filter((c) => c.done).length / checks.length;
};
