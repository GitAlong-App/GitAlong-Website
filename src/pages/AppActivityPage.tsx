import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, X } from 'lucide-react';
import { SEO } from '../components/SEO';
import { IntentChips } from '../components/IntentChips';
import { Avatar, Chip, EmptyState, Illustration, LoadingLabel, PressableLink, SkeletonRow, Tile } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useMatches } from '../contexts/MatchesContext';
import { PublicProfile, displayName } from '../lib/types';
import { formatRelativeTime } from '../lib/format';
import type { IllustrationName } from '../lib/illustrations';
import { RepoSwipeRow, SwipeRow, fetchPublicProfiles, getRepoSwipeHistory, getSwipeHistory } from '../services/dataService';

const actionChip: Record<SwipeRow['action'], { label: string; tone: 'green' | 'purple' | 'danger'; icon: React.ReactNode }> = {
  like: { label: 'Liked', tone: 'green', icon: <Heart className="h-3 w-3 fill-current" aria-hidden /> },
  superLike: { label: 'Super', tone: 'purple', icon: <Star className="h-3 w-3 fill-current" aria-hidden /> },
  dislike: { label: 'Skipped', tone: 'danger', icon: <X className="h-3 w-3" strokeWidth={4} aria-hidden /> },
};

const Section: React.FC<{ title: string; count: number; art: IllustrationName; children: React.ReactNode }> = ({
  title,
  count,
  art,
  children,
}) => (
  <Tile as="section" padding="md" className="flex min-h-[260px] flex-col" aria-label={title}>
    <header className="mb-3 flex items-center gap-2.5">
      <Illustration name={art} size={32} />
      <h2 className="flex-1 text-h3 text-ink">{title}</h2>
      <span className="rounded-pill bg-surface px-2.5 py-1 text-[13px] font-black text-ink-muted">{count}</span>
    </header>
    <div className="-mr-1 max-h-[60vh] flex-1 space-y-2 overflow-y-auto pr-1">{children}</div>
  </Tile>
);

const rowClass = 'flex items-center gap-3 rounded-md border-2 border-border bg-surface p-2.5 transition-colors hover:border-border-strong';
const repoRowClass = 'block rounded-md border-2 border-border bg-surface p-2.5 transition-colors hover:border-border-strong';

export const AppActivityPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { matches, loading: matchesLoading } = useMatches();
  const me = currentUser?.id ?? '';
  const [swipes, setSwipes] = useState<SwipeRow[]>([]);
  const [profiles, setProfiles] = useState<Map<string, PublicProfile>>(new Map());
  const [savedRepos, setSavedRepos] = useState<RepoSwipeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!me) return;
    let cancelled = false;
    (async () => {
      try {
        const [history, repoSaves] = await Promise.all([
          getSwipeHistory(me, 100),
          getRepoSwipeHistory(me, 100, 'save').catch(() => [] as RepoSwipeRow[]),
        ]);
        // One batched read from public_profiles instead of one request per person.
        const people = await fetchPublicProfiles(history.map((h) => h.swiped_user_id));
        if (cancelled) return;
        setSwipes(history);
        setProfiles(people);
        setSavedRepos(repoSaves);
        setError(null);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Could not load your activity.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [me]);

  const liked = swipes.filter((s) => s.action === 'like' || s.action === 'superLike');
  const likedUnique = liked.filter((s, i) => liked.findIndex((x) => x.swiped_user_id === s.swiped_user_id) === i);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-5 sm:px-6 md:px-8 md:pt-8">
      <SEO title="Activity – GitAlong" description="Your likes, matches and saved repositories." url="/app/activity" noIndex />
      {error && (
        <Tile tone="danger" padding="sm" className="mb-5 flex items-center gap-3">
          <Illustration name="thinking_face" size={32} />
          <p className="text-body-sm font-bold text-ink">{error}</p>
        </Tile>
      )}
      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <LoadingLabel>Loading your activity…</LoadingLabel>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="space-y-2 rounded-lg border-2 border-border bg-card p-4" aria-hidden>
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Section title="Matches" count={matches.length} art="handshake">
            {matchesLoading ? (
              <SkeletonRow />
            ) : matches.length === 0 ? (
              <EmptyState size="sm" illustration="eyes" title="No matches yet" message="When someone you liked likes you back, they show up here." />
            ) : (
              matches.map((match) => (
                <Link key={match.id} to={`/app/messages/${match.id}`} className={rowClass}>
                  <Avatar src={match.other?.avatar_url} name={displayName(match.other)} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className={`truncate text-body-sm ${match.unread ? 'font-black text-ink' : 'font-extrabold text-ink'}`}>
                      {displayName(match.other)}
                    </div>
                    <div className="truncate text-[13px] font-semibold text-ink-muted">{match.last_message ? match.last_message : 'Say hi →'}</div>
                  </div>
                  {match.unread && (
                    <span className="rounded-pill bg-danger px-2 py-0.5 text-[11px] font-black uppercase text-white">
                      New<span className="sr-only"> message</span>
                    </span>
                  )}
                </Link>
              ))
            )}
          </Section>

          <Section title="Liked builders" count={likedUnique.length} art="sparkling_heart">
            {likedUnique.length === 0 ? (
              <EmptyState
                size="sm"
                illustration="compass"
                title="No likes yet"
                message="Builders you like appear here."
                action={
                  <PressableLink to="/app/discover" size="sm">
                    Discover
                  </PressableLink>
                }
              />
            ) : (
              likedUnique.map((swipe) => {
                const p = profiles.get(swipe.swiped_user_id);
                const href = p?.github_url || (p?.username ? `https://github.com/${p.username}` : undefined);
                return (
                  <a key={swipe.id} href={href} target="_blank" rel="noopener noreferrer" className={rowClass}>
                    <Avatar src={p?.avatar_url} name={p ? displayName(p) : '?'} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-body-sm font-extrabold text-ink">{p ? displayName(p) : 'Profile unavailable'}</div>
                      {p?.username && <div className="truncate text-[13px] font-semibold text-ink-muted">@{p.username}</div>}
                      <IntentChips values={p?.looking_for} size="xs" className="mt-1" />
                    </div>
                  </a>
                );
              })
            )}
          </Section>

          <Section title="Recent swipes" count={swipes.length} art="compass">
            {swipes.length === 0 ? (
              <EmptyState size="sm" illustration="sleeping_face" title="Nothing yet" message="Your swipes show up here." />
            ) : (
              swipes.map((swipe) => {
                const p = profiles.get(swipe.swiped_user_id);
                const chip = actionChip[swipe.action] ?? actionChip.like;
                return (
                  <div key={swipe.id} className={rowClass}>
                    <Avatar src={p?.avatar_url} name={p ? displayName(p) : '?'} size={40} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-body-sm font-extrabold text-ink">{p ? displayName(p) : 'Profile unavailable'}</div>
                      <div className="text-[12px] font-bold text-ink-subtle">{formatRelativeTime(swipe.swiped_at)}</div>
                    </div>
                    <Chip size="sm" tone={chip.tone} icon={chip.icon}>
                      {chip.label}
                    </Chip>
                  </div>
                );
              })
            )}
          </Section>

          <Section title="Saved repos" count={savedRepos.length} art="books">
            {savedRepos.length === 0 ? (
              <EmptyState size="sm" illustration="magnifying_glass" title="No saved repos" message="Repositories you save in project discovery land here." />
            ) : (
              savedRepos.map((repo) => (
                <a key={repo.id} href={repo.repo_url} target="_blank" rel="noopener noreferrer" className={repoRowClass}>
                  <div className="truncate text-body-sm font-extrabold text-ink">{repo.repo_full_name}</div>
                  <div className="mt-1 flex items-center justify-between text-[12px] font-bold text-ink-muted">
                    <span className="truncate pr-2">{repo.repo_language || 'Unknown'}</span>
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current text-gold" aria-hidden /> {repo.repo_stars}
                    </span>
                  </div>
                </a>
              ))
            )}
          </Section>
        </div>
      )}
    </div>
  );
};
