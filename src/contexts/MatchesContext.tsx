import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { MatchRow, PublicProfile, isMatchUnreadFor, otherMemberId } from '../lib/types';
import { fetchPublicProfiles, listMatches } from '../services/dataService';

export interface MatchWithProfile extends MatchRow {
  otherId: string;
  /** Null when the other profile is hidden (blocked) or was deleted. */
  other: PublicProfile | null;
  unread: boolean;
}

interface MatchesContextValue {
  matches: MatchWithProfile[];
  loading: boolean;
  error: string | null;
  unreadCount: number;
  reload: () => Promise<void>;
  markReadLocal: (matchId: string) => void;
  removeLocal: (matchId: string) => void;
}

const MatchesContext = createContext<MatchesContextValue | null>(null);

export const useMatches = (): MatchesContextValue => {
  const ctx = useContext(MatchesContext);
  if (!ctx) throw new Error('useMatches must be used within a MatchesProvider');
  return ctx;
};

const activityTime = (m: MatchRow) => new Date(m.last_message_at || m.matched_at).getTime() || 0;

export const MatchesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const me = currentUser?.id ?? null;
  const [rows, setRows] = useState<MatchRow[]>([]);
  const [profiles, setProfiles] = useState<Map<string, PublicProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reloadTimer = useRef<number | null>(null);
  const profilesRef = useRef(profiles);
  profilesRef.current = profiles;
  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const reload = useCallback(async () => {
    if (!me || !supabase) {
      setRows([]);
      setLoading(false);
      return;
    }
    try {
      const matchRows = await listMatches();
      const otherIds = matchRows.map((m) => otherMemberId(m, me)).filter((id): id is string => !!id);
      const missing = otherIds.filter((id) => !profilesRef.current.has(id));
      if (missing.length) {
        const loaded = await fetchPublicProfiles(missing);
        setProfiles((prev) => {
          const next = new Map(prev);
          loaded.forEach((p, id) => next.set(id, p));
          return next;
        });
      }
      setRows(matchRows);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load your matches.');
    } finally {
      setLoading(false);
    }
  }, [me]);

  const scheduleReload = useCallback(() => {
    if (reloadTimer.current) window.clearTimeout(reloadTimer.current);
    reloadTimer.current = window.setTimeout(() => void reload(), 300);
  }, [reload]);

  useEffect(() => {
    setLoading(true);
    void reload();
  }, [reload]);

  // Realtime: RLS limits match events to rows the user belongs to.
  useEffect(() => {
    if (!me || !supabase) return;
    const client = supabase;
    const channel = client
      .channel(`matches-${me}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, (payload) => {
        const updated = payload.new as MatchRow;
        if (!updated?.id) return;
        if (!rowsRef.current.some((m) => m.id === updated.id)) {
          scheduleReload();
          return;
        }
        setRows((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'matches' }, () => scheduleReload())
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'matches' }, (payload) => {
        const oldId = (payload.old as { id?: string })?.id;
        if (oldId) setRows((prev) => prev.filter((m) => m.id !== oldId));
        else scheduleReload();
      })
      .subscribe();

    // Refresh when the tab regains focus (covers missed realtime events).
    const onFocus = () => scheduleReload();
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('focus', onFocus);
      if (reloadTimer.current) window.clearTimeout(reloadTimer.current);
      void client.removeChannel(channel);
    };
  }, [me, scheduleReload]);

  const markReadLocal = useCallback(
    (matchId: string) => {
      setRows((prev) =>
        prev.map((m) =>
          m.id === matchId && m.last_message_sender_id !== me ? { ...m, is_read: true } : m
        )
      );
    },
    [me]
  );

  const removeLocal = useCallback((matchId: string) => {
    setRows((prev) => prev.filter((m) => m.id !== matchId));
  }, []);

  const matches = useMemo<MatchWithProfile[]>(() => {
    if (!me) return [];
    return rows
      .map((m) => {
        const otherId = otherMemberId(m, me) ?? '';
        return {
          ...m,
          otherId,
          other: profiles.get(otherId) ?? null,
          unread: isMatchUnreadFor(m, me),
        };
      })
      .sort((a, b) => activityTime(b) - activityTime(a));
  }, [rows, profiles, me]);

  const unreadCount = useMemo(() => matches.filter((m) => m.unread).length, [matches]);

  const value: MatchesContextValue = {
    matches,
    loading,
    error,
    unreadCount,
    reload,
    markReadLocal,
    removeLocal,
  };

  return <MatchesContext.Provider value={value}>{children}</MatchesContext.Provider>;
};
