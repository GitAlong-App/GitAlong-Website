import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import { getMyProgress, ProgressUnavailableError } from '../services/dataService';
import { MyProgress, levelFloorXp, levelForXp, nextLevelXp } from '../lib/progress';
import { AchievementKey, achievementByKey, isAchievementKey } from '../lib/achievements';
import { localDateKey, readJson, readString, writeJson, writeString } from '../lib/storage';
import { Celebration, Illustration, LevelBadge, showAchievementToast, showCelebrationToast } from '../components/ui';
import { haptics } from '../lib/haptics';

/**
 * Server-backed progress (docs/DESIGN_SYSTEM.md §6): streak, daily goal, XP,
 * level and achievements from `get_my_progress`.
 *
 * - If the RPC fails (e.g. the migration isn't applied yet) `status` becomes
 *   'unavailable' and progress UI hides itself. Core flows never wait on it.
 * - The last-seen level and achievements are kept in localStorage per user, so
 *   level-ups and unlocks are celebrated exactly once (per browser).
 */
export type ProgressStatus = 'idle' | 'loading' | 'ready' | 'unavailable';

interface ProgressContextValue {
  progress: MyProgress | null;
  status: ProgressStatus;
  /** Re-read progress (debounced). Call after swipes, sent messages and profile saves. */
  refresh: () => void;
  /** A swipe was saved: bump today's count optimistically, then refresh. */
  noteSwipe: () => void;
  /** Pause celebrations while another overlay is open; call the returned function to resume. */
  holdCelebrations: () => () => void;
  /** Achievements unlocked during this visit (for "new" highlights). */
  recentUnlocks: ReadonlySet<AchievementKey>;
}

const noop = () => {};
const DEFAULT_VALUE: ProgressContextValue = {
  progress: null,
  status: 'unavailable',
  refresh: noop,
  noteSwipe: noop,
  holdCelebrations: () => noop,
  recentUnlocks: new Set(),
};

const ProgressContext = createContext<ProgressContextValue>(DEFAULT_VALUE);

/** Safe outside the provider: returns an "unavailable" value. */
export const useProgress = (): ProgressContextValue => useContext(ProgressContext);

interface SeenState {
  level: number;
  xp: number;
  achievements: string[];
}

const isSeenState = (v: unknown): v is SeenState =>
  !!v &&
  typeof v === 'object' &&
  typeof (v as SeenState).level === 'number' &&
  Array.isArray((v as SeenState).achievements);

const seenKey = (uid: string) => `gitalong:progress-seen:v1:${uid}`;
const goalKey = (uid: string) => `gitalong:goal-celebrated:v1:${uid}`;

const REFRESH_DEBOUNCE_MS = 400;
const RETRY_AFTER_ERROR_MS = 30_000;
const FOCUS_REFRESH_AFTER_MS = 60_000;

type Pending = { kind: 'level'; level: number; gained: number } | { kind: 'achievement'; key: AchievementKey } | { kind: 'goal'; goal: number };

export const ProgressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const uid = currentUser?.id ?? null;

  const [progress, setProgress] = useState<MyProgress | null>(null);
  const [status, setStatus] = useState<ProgressStatus>('idle');
  const [recentUnlocks, setRecentUnlocks] = useState<Set<AchievementKey>>(new Set());
  const [levelUp, setLevelUp] = useState<{ level: number; gained: number } | null>(null);
  const [holds, setHolds] = useState(0);
  const [queue, setQueue] = useState<Pending[]>([]);

  const disabledRef = useRef(false);
  const retryAtRef = useRef(0);
  const lastFetchRef = useRef(0);
  const inFlightRef = useRef(false);
  const againRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const serverRef = useRef<MyProgress | null>(null);
  const uidRef = useRef(uid);
  uidRef.current = uid;

  // Compare a fresh server result with what this browser has already celebrated.
  const detectCelebrations = useCallback((prev: MyProgress | null, next: MyProgress, user: string) => {
    const found: Pending[] = [];
    const seen = readJson(seenKey(user), isSeenState);
    if (!seen) {
      // First time on this browser: remember silently (no flood for past unlocks).
      writeJson(seenKey(user), { level: next.level, xp: next.xp, achievements: next.achievements });
    } else {
      const known = new Set(seen.achievements);
      const fresh = next.achievements.filter((a) => !known.has(a));
      if (next.level > seen.level) found.push({ kind: 'level', level: next.level, gained: Math.max(0, next.xp - (seen.xp ?? 0)) });
      fresh.forEach((key) => found.push({ kind: 'achievement', key }));
      if (fresh.length || next.level !== seen.level || next.xp !== seen.xp) {
        writeJson(seenKey(user), {
          level: Math.max(next.level, seen.level),
          xp: next.xp,
          achievements: Array.from(new Set([...seen.achievements.filter(isAchievementKey), ...next.achievements])),
        });
      }
      if (fresh.length) setRecentUnlocks((s) => new Set([...s, ...fresh]));
    }

    // Daily goal reached during this visit → one celebration toast per day.
    const today = localDateKey();
    if (prev && prev.todaySwipes < prev.dailyGoal && next.todaySwipes >= next.dailyGoal && readString(goalKey(user)) !== today) {
      writeString(goalKey(user), today);
      found.push({ kind: 'goal', goal: next.dailyGoal });
    }
    if (found.length) setQueue((q) => [...q, ...found]);
  }, []);

  const load = useCallback(async () => {
    const user = uidRef.current;
    if (!user || !supabase || disabledRef.current) return;
    if (Date.now() < retryAtRef.current) return;
    if (inFlightRef.current) {
      againRef.current = true;
      return;
    }
    inFlightRef.current = true;
    setStatus((s) => (s === 'idle' ? 'loading' : s));
    try {
      const next = await getMyProgress();
      if (uidRef.current !== user) return;
      const prev = serverRef.current;
      serverRef.current = next;
      lastFetchRef.current = Date.now();
      setProgress(next);
      setStatus('ready');
      detectCelebrations(prev, next, user);
    } catch (err) {
      if (uidRef.current !== user) return;
      if (err instanceof ProgressUnavailableError && err.permanent) disabledRef.current = true;
      else retryAtRef.current = Date.now() + RETRY_AFTER_ERROR_MS;
      // Keep showing the last good numbers after a blip; hide the UI if we never had any.
      if (!serverRef.current || disabledRef.current) {
        serverRef.current = null;
        setProgress(null);
        setStatus('unavailable');
      }
    } finally {
      inFlightRef.current = false;
      if (againRef.current) {
        againRef.current = false;
        window.setTimeout(() => void load(), REFRESH_DEBOUNCE_MS);
      }
    }
  }, [detectCelebrations]);

  const refresh = useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => void load(), REFRESH_DEBOUNCE_MS);
  }, [load]);

  const noteSwipe = useCallback(() => {
    setProgress((p) => {
      if (!p) return p;
      const xp = p.xp + (p.todaySwipes < 50 ? 1 : 0);
      const level = Math.max(p.level, levelForXp(xp));
      const streakDays = p.activeToday ? p.streakDays : p.streakDays + 1;
      return {
        ...p,
        todaySwipes: p.todaySwipes + 1,
        totalSwipes: p.totalSwipes + 1,
        activeToday: true,
        weekActivity: [...p.weekActivity.slice(0, 6), true],
        streakDays,
        bestStreak: Math.max(p.bestStreak, streakDays),
        xp,
        level,
        levelFloorXp: level === p.level ? p.levelFloorXp : levelFloorXp(level),
        nextLevelXp: level === p.level ? p.nextLevelXp : nextLevelXp(level),
      };
    });
    refresh();
  }, [refresh]);

  const holdCelebrations = useCallback(() => {
    setHolds((h) => h + 1);
    let released = false;
    return () => {
      if (released) return;
      released = true;
      setHolds((h) => Math.max(0, h - 1));
    };
  }, []);

  // Reset and load when the signed-in user changes.
  useEffect(() => {
    disabledRef.current = false;
    retryAtRef.current = 0;
    serverRef.current = null;
    setProgress(null);
    setQueue([]);
    setLevelUp(null);
    setRecentUnlocks(new Set());
    if (!uid || !supabase) {
      setStatus('unavailable');
      return;
    }
    setStatus('loading');
    void load();
  }, [uid, load]);

  // Refresh when the tab regains focus after a while (streak/day may have changed).
  useEffect(() => {
    if (!uid) return;
    const onFocus = () => {
      if (Date.now() - lastFetchRef.current > FOCUS_REFRESH_AFTER_MS) refresh();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [uid, refresh]);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    },
    []
  );

  // Play queued celebrations one at a time, unless something else is on screen.
  useEffect(() => {
    if (holds > 0 || levelUp || queue.length === 0) return;
    const [next, ...rest] = queue;
    if (next.kind === 'level') {
      haptics.match();
      setLevelUp({ level: next.level, gained: next.gained });
      setQueue(rest);
      return;
    }
    const delay = 250;
    const timer = window.setTimeout(() => {
      if (next.kind === 'achievement') {
        const def = achievementByKey(next.key);
        if (def) showAchievementToast(def);
      } else {
        showCelebrationToast({
          id: 'daily-goal',
          illustration: 'trophy',
          title: 'Daily goal reached!',
          message: `You reviewed ${next.goal} builders today. See you tomorrow!`,
        });
      }
      setQueue(rest);
    }, delay + (next.kind === 'achievement' ? 450 : 0));
    return () => window.clearTimeout(timer);
  }, [queue, holds, levelUp]);

  const value = useMemo<ProgressContextValue>(
    () => ({ progress, status, refresh, noteSwipe, holdCelebrations, recentUnlocks }),
    [progress, status, refresh, noteSwipe, holdCelebrations, recentUnlocks]
  );

  return (
    <ProgressContext.Provider value={value}>
      {children}
      <Celebration
        open={!!levelUp}
        onClose={() => setLevelUp(null)}
        title={levelUp ? `Level ${levelUp.level}!` : ''}
        message="You’re levelling up. Every builder you review and every chat earns XP."
        art={
          <div className="relative">
            <Illustration name="crown" size={150} priority />
            {levelUp && <LevelBadge level={levelUp.level} size="lg" className="absolute -bottom-2 -right-3" />}
          </div>
        }
        xp={levelUp?.gained || undefined}
        primaryLabel="Keep going"
      />
    </ProgressContext.Provider>
  );
};
