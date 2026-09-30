import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, GitFork, RefreshCw, SlidersHorizontal, Star, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { SEO } from '../components/SEO';
import { ChipSelect } from '../components/ChipSelect';
import { DeveloperCard, DeveloperCardHandle } from '../components/discover/DeveloperCard';
import { RepoCard } from '../components/discover/RepoCard';
import { MatchCelebration, MatchInfo } from '../components/discover/MatchCelebration';
import { DailyGoalTile, LikesTeaser } from '../components/discover/DiscoverHeader';
import {
  Avatar,
  Chip,
  EmptyState,
  Illustration,
  LoadingLabel,
  PressableButton,
  PressableLink,
  Skeleton,
  Switch,
  Tile,
} from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useMatches } from '../contexts/MatchesContext';
import { useProgress } from '../contexts/ProgressContext';
import { githubService, Repository } from '../services/githubService';
import { backendService, Recommendation, RecommendationFilters } from '../services/backendService';
import {
  RepoSwipeRow,
  SwipeAction,
  getLikesReceivedCount,
  getRepoSwipeHistory,
  recordRepoSwipe,
  recordSwipe,
} from '../services/dataService';
import { INTENTS, INTEREST_OPTIONS, LANGUAGE_OPTIONS, intentLabel } from '../lib/collab';
import { intentArt } from '../lib/illustrations';
import { DEFAULT_AVATAR, displayName } from '../lib/types';
import { EASE_OUT_CUBIC } from '../lib/motion';

type DiscoverMode = 'developers' | 'repos';

/** An integer filter value within the backend's bounds, or undefined when empty/invalid (the backend would 422). */
const toIntParam = (raw: string, min: number, max = Number.MAX_SAFE_INTEGER): number | undefined => {
  if (!raw.trim()) return undefined;
  const n = Math.floor(Number(raw));
  return Number.isFinite(n) ? Math.min(Math.max(n, min), max) : undefined;
};

interface FilterOverrides {
  lookingFor?: string[];
}

const mapRepoSwipeToRepo = (item: RepoSwipeRow): Repository => ({
  id: item.repo_id,
  name: item.repo_name,
  full_name: item.repo_full_name,
  html_url: item.repo_url,
  description: item.repo_description || '',
  stargazers_count: item.repo_stars,
  forks_count: item.repo_forks,
  language: item.repo_language || '',
  topics: [],
  updated_at: item.swiped_at,
  visibility: 'public',
  default_branch: 'main',
  owner: {
    login: item.repo_owner,
    avatar_url: item.repo_owner ? `https://github.com/${encodeURIComponent(item.repo_owner)}.png?size=96` : DEFAULT_AVATAR,
  },
});

const isTypingTarget = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName));

export const DiscoverPage: React.FC = () => {
  const { currentUser, profile } = useAuth();
  const { reload: reloadMatches } = useMatches();
  const { progress, noteSwipe } = useProgress();
  const navigate = useNavigate();
  const me = currentUser?.id ?? '';

  const [mode, setMode] = useState<DiscoverMode>('developers');
  const [backendStatus, setBackendStatus] = useState<'online' | 'offline' | 'no-users'>('online');
  const [developers, setDevelopers] = useState<Recommendation[]>([]);
  const [repos, setRepos] = useState<Repository[]>([]);
  const [savedRepos, setSavedRepos] = useState<Repository[]>([]);
  const [swipedRepoIds, setSwipedRepoIds] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSaved, setShowSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fallbackRateLimited, setFallbackRateLimited] = useState(false);
  const [likesReceived, setLikesReceived] = useState(0);
  const [match, setMatch] = useState<MatchInfo | null>(null);

  // Filters
  const [lookingFor, setLookingFor] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [locationFilter, setLocationFilter] = useState('');
  const [minFollowers, setMinFollowers] = useState('');
  const [minRepos, setMinRepos] = useState('');
  const [activeWithinDays, setActiveWithinDays] = useState('');
  const [strict, setStrict] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const cardRef = useRef<DeveloperCardHandle>(null);
  const swipedRepoIdsRef = useRef<number[]>([]);
  swipedRepoIdsRef.current = swipedRepoIds;
  const didInitialLoadRef = useRef(false);
  // The profile loads asynchronously; read the latest one when the fallback runs.
  const profileRef = useRef(profile);
  profileRef.current = profile;
  // Only the most recent fetchContent call may update the page (filters can change mid-request).
  const fetchSeqRef = useRef(0);

  const loadLikesReceived = useCallback(() => {
    getLikesReceivedCount()
      .then(setLikesReceived)
      .catch(() => setLikesReceived(0));
  }, []);

  const loadRepoSwipes = useCallback(async () => {
    if (!me) return;
    try {
      const history = await getRepoSwipeHistory(me, 500);
      const seen = new Set<number>();
      const saved: Repository[] = [];
      for (const row of history) {
        if (seen.has(row.repo_id)) continue;
        seen.add(row.repo_id);
        if (row.action === 'save') saved.push(mapRepoSwipeToRepo(row));
      }
      setSavedRepos(saved);
      setSwipedRepoIds(Array.from(seen));
      swipedRepoIdsRef.current = Array.from(seen);
    } catch {
      // Saved repos are a convenience; Discover still works without them.
    }
  }, [me]);

  const fetchContent = async (overrides: FilterOverrides = {}) => {
    if (!currentUser) return;
    const seq = ++fetchSeqRef.current;
    const isStale = () => seq !== fetchSeqRef.current;
    setLoading(true);
    setError(null);
    setFallbackRateLimited(false);
    setCurrentIndex(0);
    setShowSaved(false);

    const intents = overrides.lookingFor ?? lookingFor;
    const minFollowersParam = toIntParam(minFollowers, 0);
    const minReposParam = toIntParam(minRepos, 0);
    const activeDaysParam = toIntParam(activeWithinDays, 1, 3650);
    const hasFilters = Boolean(
      intents.length ||
      languages.length ||
      interests.length ||
      locationFilter.trim() ||
      minFollowersParam !== undefined ||
      minReposParam !== undefined ||
      activeDaysParam !== undefined,
    );
    const filters: RecommendationFilters = {
      looking_for: intents,
      languages,
      interests,
      location: locationFilter.trim() || undefined,
      min_followers: minFollowersParam,
      min_public_repos: minReposParam,
      active_within_days: activeDaysParam,
      filter_mode: hasFilters ? (strict ? 'strict' : 'soft') : undefined,
    };

    // 1. Ranked collaborators from the backend.
    const healthy = await backendService.isHealthy();
    if (isStale()) return;
    if (healthy) {
      try {
        const result = await backendService.getRecommendations(20, filters);
        if (isStale()) return;
        if (result.recommendations.length > 0) {
          setDevelopers(result.recommendations);
          setMode('developers');
          setBackendStatus('online');
          setLoading(false);
          return;
        }
        setBackendStatus('no-users');
      } catch {
        if (isStale()) return;
        setBackendStatus('offline');
      }
    } else {
      setBackendStatus('offline');
    }

    // 2. Fallback: trending GitHub repositories, personalised by language.
    try {
      const myProfile = profileRef.current;
      const preferred = languages.length
        ? languages
        : Array.from(new Set([...(myProfile?.seeking_skills ?? []), ...(myProfile?.languages ?? [])]));
      const languageCandidates = preferred.slice(0, 3);
      const batches = await Promise.all(
        (languageCandidates.length ? languageCandidates : [undefined]).map((lang) => githubService.getTrendingRepositories(lang)),
      );
      if (isStale()) return;

      const byId = new Map<number, Repository>();
      for (const batch of batches) for (const repo of batch) if (!byId.has(repo.id)) byId.set(repo.id, repo);
      let personalised = Array.from(byId.values());

      const terms = interests.map((v) => v.toLowerCase().replace(/\s*\/\s*/g, ' '));
      if (terms.length) {
        const filtered = personalised.filter((repo) => {
          const haystack = `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();
          return terms.some((term) => haystack.includes(term));
        });
        if (filtered.length) personalised = filtered;
      }

      const swiped = new Set(swipedRepoIdsRef.current);
      setRepos(personalised.filter((r) => !swiped.has(r.id)));
      setMode('repos');
    } catch (err) {
      if (isStale()) return;
      const message = err instanceof Error ? err.message : 'Failed to load content.';
      if (message.toLowerCase().includes('rate limit')) {
        setFallbackRateLimited(true);
        setRepos([]);
        setMode('repos');
      } else {
        setError(message);
      }
    } finally {
      if (!isStale()) setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUser) {
      didInitialLoadRef.current = false;
      return;
    }
    if (didInitialLoadRef.current) return;
    didInitialLoadRef.current = true;
    loadLikesReceived();
    void (async () => {
      await loadRepoSwipes();
      await fetchContent();
    })();
  }, [currentUser]);

  // ── Handlers ──
  const handleDevSwipe = async (dev: Recommendation, action: SwipeAction) => {
    setCurrentIndex((prev) => prev + 1);
    if (!me) return;
    try {
      const { matched, matchId } = await recordSwipe(me, dev.id, action);
      noteSwipe();
      const name = dev.name || dev.username;
      if (matched) {
        void reloadMatches();
        setMatch({ name, avatarUrl: dev.avatar_url, matchId });
        loadLikesReceived();
      } else if (action === 'superLike') {
        toast.success(`Super liked ${name}!`);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save your swipe.');
    }
  };

  const persistRepoSwipe = (repo: Repository, action: 'save' | 'skip') => {
    if (!me) return;
    recordRepoSwipe(me, {
      repo_id: repo.id,
      action,
      repo_full_name: repo.full_name,
      repo_name: repo.name,
      repo_owner: repo.owner?.login || repo.full_name.split('/')[0],
      repo_url: repo.html_url,
      repo_description: repo.description,
      repo_language: repo.language,
      repo_stars: repo.stargazers_count,
      repo_forks: repo.forks_count,
    }).catch(() => toast.error('Could not save that to your account.'));
  };

  const markRepoSwiped = (repo: Repository) => {
    setSwipedRepoIds((prev) => (prev.includes(repo.id) ? prev : [...prev, repo.id]));
  };

  const handleRepoSwipeRight = (repo: Repository) => {
    persistRepoSwipe(repo, 'save');
    if (!savedRepos.find((r) => r.id === repo.id)) {
      setSavedRepos((prev) => [repo, ...prev]);
      toast.success(`Saved ${repo.name}`);
    }
    markRepoSwiped(repo);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRepoSwipeLeft = (repo: Repository) => {
    persistRepoSwipe(repo, 'skip');
    markRepoSwiped(repo);
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRepoSwipeUp = (repo: Repository) => {
    window.open(repo.html_url, '_blank', 'noopener,noreferrer');
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSavedRepoRemove = (repo: Repository) => {
    setSavedRepos((prev) => prev.filter((r) => r.id !== repo.id));
    persistRepoSwipe(repo, 'skip');
  };

  const onLookingForChange = (next: string[]) => {
    setLookingFor(next);
    void fetchContent({ lookingFor: next });
  };

  const clearFilters = () => {
    setLanguages([]);
    setInterests([]);
    setLocationFilter('');
    setMinFollowers('');
    setMinRepos('');
    setActiveWithinDays('');
    setStrict(false);
  };

  const items = mode === 'developers' ? developers : repos;
  const allExplored = currentIndex >= items.length && items.length > 0;
  const currentDev = mode === 'developers' ? developers[currentIndex] : undefined;
  const currentRepo = mode === 'repos' ? repos[currentIndex] : undefined;
  const activeFilterCount =
    languages.length +
    interests.length +
    (locationFilter.trim() ? 1 : 0) +
    (minFollowers ? 1 : 0) +
    (minRepos ? 1 : 0) +
    (activeWithinDays ? 1 : 0);

  // Keyboard: ← nope, → like, ↑ super (desktop nicety; never while typing or in a dialog).
  useEffect(() => {
    if (!currentDev || match) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey || isTypingTarget(e.target)) return;
      if (document.querySelector('[aria-modal="true"]')) return;
      const action: SwipeAction | null =
        e.key === 'ArrowRight' ? 'like' : e.key === 'ArrowLeft' ? 'dislike' : e.key === 'ArrowUp' ? 'superLike' : null;
      if (!action) return;
      e.preventDefault();
      cardRef.current?.swipe(action);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentDev, match]);

  const myName = displayName(profile);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 md:px-8 md:pt-8">
      <SEO
        title="Discover – GitAlong"
        description="Collaborator recommendations matched on intent, complementary skills and real GitHub work."
        url="/app/discover"
        noIndex
      />

      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-10">
        {/* Daily goal, likes teaser and filters: above the card on phones, a side panel on desktop. */}
        <aside className="mx-auto max-w-[460px] lg:order-2 lg:mx-0 lg:max-w-none" aria-label="Daily goal and filters">
          <div className="space-y-3">
            {progress && <DailyGoalTile progress={progress} />}
            {likesReceived > 0 && <LikesTeaser count={likesReceived} />}
          </div>

          {/* Looking-for filter + tools */}
          <div className="mt-5">
            <div className="mb-1 flex items-center justify-between gap-3">
              <p className="type-caption text-ink-muted">Show builders looking for</p>
              {lookingFor.length > 0 && (
                <button
                  type="button"
                  onClick={() => onLookingForChange([])}
                  className="min-h-[48px] rounded-md px-2 type-caption text-sky-fg hover:bg-sky-tint"
                >
                  Anyone
                </button>
              )}
            </div>
            <div
              role="group"
              aria-label="Filter by what people are looking for"
              className="-mx-4 flex gap-2 overflow-x-auto px-4 py-1.5 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 [&>*]:shrink-0"
            >
              {INTENTS.map((intent) => {
                const on = lookingFor.includes(intent);
                return (
                  <Chip
                    key={intent}
                    selected={on}
                    illustration={intentArt(intent)}
                    onToggle={() => onLookingForChange(on ? lookingFor.filter((v) => v !== intent) : [...lookingFor, intent])}
                  >
                    {intentLabel(intent)}
                  </Chip>
                );
              })}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <PressableButton
                variant="secondary"
                size="sm"
                fullWidth={false}
                leadingIcon={<SlidersHorizontal strokeWidth={2.75} />}
                onClick={() => setShowFilters((v) => !v)}
                aria-expanded={showFilters}
                aria-controls="discover-filters"
              >
                Filters{activeFilterCount > 0 ? ` · ${activeFilterCount}` : ''}
              </PressableButton>
              <PressableButton
                variant="secondary"
                size="sm"
                fullWidth={false}
                leadingIcon={<RefreshCw className={loading ? 'animate-spin' : ''} strokeWidth={2.75} />}
                onClick={() => void fetchContent()}
                disabled={loading}
                aria-label="Refresh recommendations"
              >
                <span className="hidden sm:inline">Refresh</span>
              </PressableButton>
              {mode === 'developers' ? (
                <PressableLink to="/app/activity" variant="ghost" size="sm" fullWidth={false} className="hidden sm:inline-flex">
                  Likes & matches
                </PressableLink>
              ) : (
                savedRepos.length > 0 && (
                  <PressableButton variant="ghost" size="sm" fullWidth={false} onClick={() => setShowSaved(!showSaved)}>
                    {showSaved ? 'Back to swiping' : `Saved · ${savedRepos.length}`}
                  </PressableButton>
                )
              )}
            </div>

            <AnimatePresence initial={false}>
              {showFilters && (
                <motion.div
                  id="discover-filters"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2, ease: EASE_OUT_CUBIC }}
                >
                  <Tile className="mt-4 space-y-5" padding="md">
                    <p className="text-body-sm text-ink-muted">
                      Filters are soft by default: matching people rank higher, others still appear. In the trending-repo fallback,
                      languages and interests personalise the repositories.
                    </p>
                    <div>
                      <p className="mb-2 type-caption text-ink-muted">Languages</p>
                      <ChipSelect options={LANGUAGE_OPTIONS} value={languages} onChange={setLanguages} ariaLabel="Languages" />
                    </div>
                    <div>
                      <p className="mb-2 type-caption text-ink-muted">Interests</p>
                      <ChipSelect options={INTEREST_OPTIONS} value={interests} onChange={setInterests} ariaLabel="Interests" />
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block type-caption text-ink-muted">Location contains</span>
                        <input
                          value={locationFilter}
                          onChange={(e) => setLocationFilter(e.target.value)}
                          placeholder="e.g. Berlin or Remote"
                          className="field"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block type-caption text-ink-muted">Active within (days)</span>
                        <input
                          type="number"
                          min={1}
                          value={activeWithinDays}
                          onChange={(e) => setActiveWithinDays(e.target.value)}
                          placeholder="Any"
                          className="field"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block type-caption text-ink-muted">Min followers</span>
                        <input
                          type="number"
                          min={0}
                          value={minFollowers}
                          onChange={(e) => setMinFollowers(e.target.value)}
                          placeholder="Any"
                          className="field"
                        />
                      </label>
                      <label className="block">
                        <span className="mb-1 block type-caption text-ink-muted">Min public repos</span>
                        <input
                          type="number"
                          min={0}
                          value={minRepos}
                          onChange={(e) => setMinRepos(e.target.value)}
                          placeholder="Any"
                          className="field"
                        />
                      </label>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <Switch checked={strict} onChange={setStrict} label="Only show exact matches" />
                        <span className="text-body-sm font-bold text-ink">Only show exact matches</span>
                      </div>
                      <div className="flex gap-2">
                        <PressableButton variant="secondary" size="sm" onClick={clearFilters}>
                          Clear
                        </PressableButton>
                        <PressableButton
                          size="sm"
                          onClick={() => {
                            setShowFilters(false);
                            void fetchContent();
                          }}
                        >
                          Apply filters
                        </PressableButton>
                      </div>
                    </div>
                  </Tile>
                </motion.div>
              )}
            </AnimatePresence>

            {mode === 'repos' && !loading && backendStatus !== 'online' && (
              <Tile tone={backendStatus === 'offline' ? 'gold' : 'sky'} padding="sm" className="mt-4 flex items-center gap-3 !p-3">
                <Illustration name={backendStatus === 'offline' ? 'hourglass' : 'compass'} size={32} />
                <p className="text-body-sm font-bold text-ink">
                  {backendStatus === 'offline'
                    ? 'The matching service is waking up or unavailable, so here are trending repositories meanwhile.'
                    : 'No new builder matches right now, so here are trending repositories.'}
                </p>
              </Tile>
            )}
          </div>
        </aside>

        <div className="min-w-0 lg:order-1">
          {/* ── Saved repositories ── */}
          {showSaved && mode === 'repos' ? (
            <section className="mt-8 lg:mt-0" aria-labelledby="saved-heading">
              <h2 id="saved-heading" className="mb-4 text-h2 text-ink">
                Saved repositories
              </h2>
              <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {savedRepos.map((repo, i) => (
                  <motion.li key={repo.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Tile className="flex h-full flex-col">
                      <div className="mb-3 flex items-center gap-3">
                        <Avatar src={repo.owner?.avatar_url} name={repo.owner?.login || repo.name} size={44} className="rounded-md" />
                        <div className="min-w-0">
                          <h3 className="truncate text-h3 text-ink">{repo.name}</h3>
                          <p className="truncate text-body-sm text-ink-muted">{repo.owner?.login}</p>
                        </div>
                      </div>
                      <p className="mb-3 line-clamp-2 flex-1 text-body-sm text-ink-muted">{repo.description || 'No description yet.'}</p>
                      <div className="mb-4 flex flex-wrap gap-1.5">
                        <Chip size="sm" tone="gold" icon={<Star className="h-3 w-3 fill-current" aria-hidden />}>
                          {repo.stargazers_count.toLocaleString()}
                        </Chip>
                        <Chip size="sm" icon={<GitFork className="h-3 w-3" aria-hidden />}>
                          {repo.forks_count.toLocaleString()}
                        </Chip>
                        {repo.language && (
                          <Chip size="sm" tone="sky">
                            {repo.language}
                          </Chip>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <PressableLink
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="sm"
                          fullWidth
                          className="flex-1"
                          leadingIcon={<ExternalLink strokeWidth={2.75} />}
                        >
                          View
                        </PressableLink>
                        <PressableButton
                          variant="secondary"
                          size="sm"
                          fullWidth={false}
                          onClick={() => handleSavedRepoRemove(repo)}
                          aria-label={`Remove ${repo.name} from saved`}
                          leadingIcon={<Trash2 strokeWidth={2.75} />}
                        >
                          Remove
                        </PressableButton>
                      </div>
                    </Tile>
                  </motion.li>
                ))}
              </ul>
            </section>
          ) : (
            <section className="mt-6 pb-6 lg:mt-0" aria-label={mode === 'developers' ? 'Builder recommendations' : 'Trending repositories'}>
              {loading ? (
                <div className="mx-auto w-full max-w-[460px]">
                  <LoadingLabel>Finding builders for you…</LoadingLabel>
                  <div className="rounded-xl border-2 border-border bg-card p-5 shadow-edge-tile" aria-hidden>
                    <div className="flex items-center gap-4">
                      <Skeleton rounded="full" className="h-20 w-20" />
                      <div className="flex-1 space-y-2.5">
                        <Skeleton className="h-5 w-3/5" rounded="pill" />
                        <Skeleton className="h-4 w-2/5" rounded="pill" />
                      </div>
                    </div>
                    <Skeleton className="mt-5 h-24 w-full" rounded="lg" />
                    <div className="mt-4 flex gap-2">
                      <Skeleton className="h-8 w-28" rounded="pill" />
                      <Skeleton className="h-8 w-24" rounded="pill" />
                    </div>
                    <Skeleton className="mt-4 h-20 w-full" rounded="lg" />
                  </div>
                  <p className="mt-5 flex items-center justify-center gap-2 text-center text-body-sm text-ink-muted">
                    <Illustration name="hourglass" size={20} />
                    Finding builders… the matching service can take up to 30 s to wake up.
                  </p>
                </div>
              ) : error ? (
                <EmptyState
                  illustration="thinking_face"
                  title="Something went wrong"
                  message={error}
                  action={<PressableButton onClick={() => void fetchContent()}>Try again</PressableButton>}
                />
              ) : fallbackRateLimited ? (
                <EmptyState
                  illustration="hourglass"
                  title="GitHub needs a breather"
                  message="The trending-repository fallback is rate-limited right now. Try again in a minute."
                  action={<PressableButton onClick={() => void fetchContent()}>Try again</PressableButton>}
                />
              ) : items.length === 0 ? (
                <EmptyState
                  illustration="magnifying_glass"
                  title="No one here yet"
                  message="Nobody matches these filters right now. Want to widen them?"
                  action={
                    <>
                      {(lookingFor.length > 0 || activeFilterCount > 0) && (
                        <PressableButton
                          variant="secondary"
                          onClick={() => {
                            clearFilters();
                            onLookingForChange([]);
                          }}
                        >
                          Clear filters
                        </PressableButton>
                      )}
                      <PressableButton onClick={() => void fetchContent()} leadingIcon={<RefreshCw strokeWidth={2.75} />}>
                        Refresh
                      </PressableButton>
                    </>
                  }
                />
              ) : allExplored ? (
                <EmptyState
                  illustration="compass"
                  title="You’re all caught up!"
                  message={
                    mode === 'developers'
                      ? 'You’ve seen everyone in this batch. Load more, or say hi to your matches.'
                      : 'You’ve explored all trending repositories for now.'
                  }
                  action={
                    <>
                      <PressableButton onClick={() => void fetchContent()} leadingIcon={<RefreshCw strokeWidth={2.75} />}>
                        Load more
                      </PressableButton>
                      {mode === 'developers' && (
                        <PressableLink to="/app/messages" variant="secondary">
                          Open messages
                        </PressableLink>
                      )}
                    </>
                  }
                />
              ) : currentDev ? (
                <>
                  <DeveloperCard
                    ref={cardRef}
                    key={currentDev.id}
                    dev={currentDev}
                    mySeekingSkills={profile?.seeking_skills ?? []}
                    myIntents={profile?.looking_for ?? []}
                    hasNext={currentIndex + 1 < developers.length}
                    onSwipe={(dev, action) => void handleDevSwipe(dev, action)}
                  />
                  <p className="mt-5 text-center text-body-sm text-ink-muted">
                    <span className="hidden md:inline">Drag the card or use ← → ↑ · </span>
                    {currentIndex + 1} of {developers.length}
                  </p>
                </>
              ) : currentRepo ? (
                <>
                  <RepoCard
                    key={currentRepo.id}
                    repo={currentRepo}
                    hasNext={currentIndex + 1 < repos.length}
                    onSwipeRight={handleRepoSwipeRight}
                    onSwipeLeft={handleRepoSwipeLeft}
                    onSwipeUp={handleRepoSwipeUp}
                  />
                  <p className="mt-5 text-center text-body-sm text-ink-muted">
                    Right to save · left to skip · up to open · {currentIndex + 1} of {repos.length}
                  </p>
                </>
              ) : null}
            </section>
          )}
        </div>
      </div>

      <MatchCelebration
        match={match}
        me={{ name: myName, avatarUrl: profile?.avatar_url ?? null }}
        onClose={() => setMatch(null)}
        onSayHi={() => {
          const id = match?.matchId;
          setMatch(null);
          navigate(id ? `/app/messages/${id}` : '/app/messages');
        }}
      />
    </div>
  );
};
