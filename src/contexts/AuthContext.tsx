import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import toast from 'react-hot-toast';
import { oauthRedirectError, supabase } from '../lib/supabase';
import type { ProfileUpdate, UserProfile } from '../lib/types';
import { ensureUserProfile, updateMyProfile } from '../services/dataService';
import { backendService } from '../services/backendService';

interface AuthContextType {
  /** The Supabase auth user (null when signed out). */
  currentUser: User | null;
  /** The caller's GitAlong profile — their `users` row. */
  profile: UserProfile | null;
  profileLoading: boolean;
  profileError: string | null;
  /** True until the initial session check has finished. */
  loading: boolean;
  loginWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
  /** Re-read the profile via ensure_user_profile. */
  refreshProfile: () => Promise<UserProfile | null>;
  /** Save editable profile fields and update the context. */
  saveProfile: (patch: ProfileUpdate) => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Tokens (and old fake settings) are no longer kept in localStorage; clean up copies left by older builds.
const LEGACY_TOKEN_KEYS = ['supabase_access_token', 'github_access_token', 'savedDevs', 'GitAlong-settings', 'GitAlong-developer-mode'];
const GITHUB_SYNC_INTERVAL_MS = 60 * 60 * 1000;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const loadedForUser = useRef<string | null>(null);

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!supabase) return null;
    setProfileLoading(true);
    try {
      const row = await ensureUserProfile();
      setProfile(row);
      setProfileError(null);
      return row;
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Could not load your profile.');
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const onSignedIn = useCallback(
    async (user: User) => {
      if (loadedForUser.current === user.id) return;
      loadedForUser.current = user.id;
      const row = await refreshProfile();
      // The backend owns GitHub-derived columns. Fire and forget: if GitHub or
      // the backend is unavailable nothing is overwritten. Skip when the stats
      // were synced within the last hour to spare GitHub's rate limit.
      const syncedAt = row?.github_synced_at ? Date.parse(row.github_synced_at) : 0;
      if (Number.isFinite(syncedAt) && Date.now() - syncedAt < GITHUB_SYNC_INTERVAL_MS) return;
      backendService
        .refreshGitHub()
        .then((res) => {
          if (res?.profile) void refreshProfile();
        })
        .catch(() => {
          /* backend cold/offline or GitHub unavailable — keep the current profile */
        });
    },
    [refreshProfile]
  );

  const handleSession = useCallback(
    (session: Session | null) => {
      const user = session?.user ?? null;
      setCurrentUser(user);
      if (user) {
        void onSignedIn(user);
      } else {
        loadedForUser.current = null;
        setProfile(null);
        setProfileError(null);
      }
    },
    [onSignedIn]
  );

  useEffect(() => {
    try {
      LEGACY_TOKEN_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch {
      // storage unavailable
    }

    if (oauthRedirectError) toast.error(oauthRedirectError, { id: 'oauth-error', duration: 8000 });

    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth
      .getSession()
      .then(({ data: { session } }) => handleSession(session))
      .catch(() => {
        // Treat as signed out; onAuthStateChange below still reports the real session.
      })
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session);
    });

    return () => subscription.unsubscribe();
  }, [handleSession]);

  const loginWithGitHub = async () => {
    if (!supabase) throw new Error('Authentication is not configured. Please check your environment setup.');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'read:user user:email',
        // Landing on "/" while signed in redirects to /app/discover.
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  const logout = async () => {
    if (!supabase) throw new Error('Authentication is not configured.');
    // signOut resolves with { error } (it does not throw) and keeps the local
    // session when it fails, e.g. offline — report that instead of pretending.
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error('Could not sign out. Check your connection and try again.');
    loadedForUser.current = null;
    setProfile(null);
  };

  const saveProfile = async (patch: ProfileUpdate): Promise<UserProfile> => {
    if (!currentUser) throw new Error('You are not signed in.');
    const updated = await updateMyProfile(currentUser.id, patch);
    setProfile(updated);
    return updated;
  };

  const value: AuthContextType = {
    currentUser,
    profile,
    profileLoading,
    profileError,
    loading,
    loginWithGitHub,
    logout,
    refreshProfile,
    saveProfile,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};
