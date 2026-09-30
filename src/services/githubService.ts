/**
 * Unauthenticated GitHub REST calls for public data (trending-repo fallback in
 * Discover, public repos on the profile page). No token is ever sent from the
 * browser: GitHub stats for matching are synced by the backend.
 */

export interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  topics: string[];
  updated_at: string;
  visibility: string;
  default_branch: string;
  owner?: {
    login: string;
    avatar_url: string;
  };
}

const GITHUB_API = 'https://api.github.com';

async function githubFetch<T>(path: string): Promise<T> {
  const response = await fetch(`${GITHUB_API}${path}`, {
    headers: { Accept: 'application/vnd.github+json' },
  });

  if (!response.ok) {
    const remaining = response.headers.get('x-ratelimit-remaining');
    if (remaining === '0' || response.status === 429) {
      throw new Error('GitHub API rate limit reached. Please try again in a few minutes.');
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const githubService = {
  async getUserRepositories(username: string): Promise<Repository[]> {
    return githubFetch(`/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=30`);
  },

  /** Popular repositories created in the last three months, optionally for one language. */
  async getTrendingRepositories(language?: string): Promise<Repository[]> {
    const since = new Date();
    since.setMonth(since.getMonth() - 3);
    const dateStr = since.toISOString().split('T')[0];
    const langFilter = language ? `+language:${encodeURIComponent(language)}` : '';
    const data = await githubFetch<{ items: Repository[] }>(
      `/search/repositories?q=created:>${dateStr}${langFilter}&sort=stars&order=desc&per_page=20`
    );
    return data.items ?? [];
  },
};
