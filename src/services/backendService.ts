/**
 * Client for the GitAlong FastAPI backend (deployed on Render).
 *
 * Contract: docs/API_AND_DATA_CONTRACT.md (§5) in the main GitAlong repo.
 * Every authenticated call reads the Supabase access token from the live
 * session right before the request (see getAccessToken) — tokens expire
 * hourly, so they are never cached or passed around by callers.
 */

import { getAccessToken, refreshAccessToken } from '../lib/supabase';

const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');

// ─── Response types (mirror backend Pydantic models) ─────────────────────────

export interface ScoreBreakdown {
  intent_fit?: number;
  skill_complement?: number;
  tech_match?: number;
  interest_match?: number;
  activity_level?: number;
  community_popularity?: number;
  recency_boost?: number;
  location_bonus?: number;
  [key: string]: number | undefined;
}

export interface Recommendation {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatar_url: string | null;
  location: string | null;
  company?: string | null;
  website_url?: string | null;
  github_url?: string | null;
  followers: number;
  following?: number;
  public_repos: number;
  total_stars?: number;
  languages: string[];
  interests: string[];
  github_topics?: string[];
  looking_for?: string[];
  seeking_skills?: string[];
  pitch?: string | null;
  created_at?: string;
  last_active_at?: string | null;
  match_score: number | null;
  match_reasons?: string[];
  score_breakdown?: ScoreBreakdown;
  ml_like_prob?: number;
  filter_preference_score?: number;
}

export interface RecommendationResponse {
  user_id: string;
  recommendations: Recommendation[];
  total: number;
  algorithm: string;
}

export interface RecommendationFilters {
  languages?: string[];
  interests?: string[];
  looking_for?: string[];
  location?: string;
  min_followers?: number;
  min_public_repos?: number;
  active_within_days?: number;
  filter_mode?: 'soft' | 'strict';
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | string;
  database?: string;
}

export class BackendError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'BackendError';
  }
}

export class NotSignedInError extends Error {
  constructor() {
    super('You are not signed in.');
    this.name = 'NotSignedInError';
  }
}

// ─── HTTP helper ──────────────────────────────────────────────────────────────

async function backendFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const method = options.method?.toUpperCase() ?? 'GET';

  const send = async (token: string) => {
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (method !== 'GET' && method !== 'HEAD' && options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    return fetch(`${BACKEND_URL}${path}`, {
      ...options,
      headers: { ...headers, ...(options.headers as Record<string, string> | undefined) },
    });
  };

  const token = await getAccessToken();
  if (!token) throw new NotSignedInError();

  let response = await send(token);
  if (response.status === 401) {
    // The session may have expired between reads; refresh once and retry.
    const fresh = await refreshAccessToken();
    if (!fresh) throw new NotSignedInError();
    response = await send(fresh);
  }

  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = await response.json();
      if (body && typeof body.detail === 'string') detail = body.detail;
    } catch {
      // non-JSON error body
    }
    throw new BackendError(response.status, detail || `Request failed (${response.status})`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const backendService = {
  /** Whether the backend is reachable (no auth). Render free instances can take ~30s to wake. */
  async isHealthy(timeoutMs = 30000): Promise<boolean> {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/health`, { signal: controller.signal });
      if (!response.ok) return false;
      const data: HealthResponse = await response.json();
      return data.status === 'ok' || data.status === 'degraded';
    } catch {
      return false;
    } finally {
      window.clearTimeout(timeout);
    }
  },

  /** Ranked collaborator recommendations with match reasons. */
  async getRecommendations(limit = 20, filters: RecommendationFilters = {}): Promise<RecommendationResponse> {
    const params = new URLSearchParams({ limit: String(Math.max(1, Math.min(100, limit))) });
    for (const lang of filters.languages ?? []) {
      if (lang.trim()) params.append('languages', lang.trim());
    }
    for (const topic of filters.interests ?? []) {
      if (topic.trim()) params.append('interests', topic.trim());
    }
    for (const intent of filters.looking_for ?? []) {
      if (intent.trim()) params.append('looking_for', intent.trim());
    }
    if (filters.location?.trim()) params.set('location', filters.location.trim());
    if (typeof filters.min_followers === 'number') params.set('min_followers', String(filters.min_followers));
    if (typeof filters.min_public_repos === 'number') params.set('min_public_repos', String(filters.min_public_repos));
    if (typeof filters.active_within_days === 'number') params.set('active_within_days', String(filters.active_within_days));
    if (filters.filter_mode) params.set('filter_mode', filters.filter_mode);

    return backendFetch<RecommendationResponse>(`/api/v1/recommendations?${params.toString()}`);
  },

  /** Ask the backend to re-sync GitHub stats (the backend owns GitHub-derived columns). */
  async refreshGitHub(): Promise<{ status: string; profile: Record<string, unknown> | null }> {
    return backendFetch('/api/v1/users/me/refresh-github', { method: 'POST' });
  },

  /** Permanently delete the caller's account. */
  async deleteMyAccount(): Promise<{ status: string }> {
    return backendFetch('/api/v1/users/me', { method: 'DELETE' });
  },
};
