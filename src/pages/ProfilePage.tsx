import React, { useEffect, useState } from 'react';
import { Building2, Check, ExternalLink, GitFork, Github, Globe, MapPin, Pencil, Settings2, Star } from 'lucide-react';
import { SEO } from '../components/SEO';
import { IntentChips } from '../components/IntentChips';
import {
  AchievementTile,
  Avatar,
  Chip,
  EmptyState,
  Illustration,
  LevelBadge,
  LoadingLabel,
  PressableButton,
  PressableLink,
  ProgressBar,
  ProgressRing,
  Skeleton,
  Tile,
  TileLink,
} from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { useMatches } from '../contexts/MatchesContext';
import { useProgress } from '../contexts/ProgressContext';
import { useProfileSetup } from '../contexts/ProfileSetupContext';
import { ACHIEVEMENTS } from '../lib/achievements';
import { missingProfileFields } from '../lib/collab';
import { displayName } from '../lib/types';
import { formatCount } from '../lib/format';
import { levelProgress, profileChecks } from '../lib/progress';
import type { IllustrationName } from '../lib/illustrations';
import { githubService, Repository } from '../services/githubService';

/** http(s) link for a stored website (the mobile app saves it verbatim, often without a scheme); null for other schemes. */
const websiteHref = (raw: string): string | null => {
  const v = raw.trim();
  if (/^https?:\/\//i.test(v)) return v;
  return /^[a-z][a-z\d+.-]*:(?!\d)/i.test(v) ? null : `https://${v}`;
};

const StatTile: React.FC<{ art: IllustrationName; value: string; label: string; tone?: string }> = ({ art, value, label, tone = 'text-ink' }) => (
  <Tile padding="sm" className="flex items-center gap-3 !p-3.5">
    <Illustration name={art} size={36} />
    <div className="min-w-0">
      <div className={`text-[22px] font-black leading-none ${tone}`}>{value}</div>
      <div className="mt-1 truncate type-caption text-ink-muted">{label}</div>
    </div>
  </Tile>
);

const ChipList: React.FC<{ items: string[]; tone?: 'neutral' | 'green' }> = ({ items, tone = 'neutral' }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map((item) => (
      <Chip key={item} size="sm" tone={tone}>
        {item}
      </Chip>
    ))}
  </div>
);

export const ProfilePage: React.FC = () => {
  const { profile, profileLoading } = useAuth();
  const { matches } = useMatches();
  const { progress, recentUnlocks } = useProgress();
  const { openProfileSetup } = useProfileSetup();
  const [repos, setRepos] = useState<Repository[]>([]);
  const [reposLoading, setReposLoading] = useState(false);

  useEffect(() => {
    if (!profile?.username) return;
    let cancelled = false;
    setReposLoading(true);
    githubService
      .getUserRepositories(profile.username)
      .then((data) => {
        if (!cancelled) setRepos([...data].sort((a, b) => b.stargazers_count - a.stargazers_count).slice(0, 6));
      })
      .catch(() => {
        if (!cancelled) setRepos([]);
      })
      .finally(() => {
        if (!cancelled) setReposLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profile?.username]);

  if (!profile) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 pt-5 sm:px-6 md:px-8 md:pt-8">
        <SEO title="Your Profile – GitAlong" description="Your GitAlong profile." url="/app/profile" type="profile" noIndex />
        {profileLoading ? (
          <div className="space-y-4" aria-hidden>
            <LoadingLabel>Loading your profile…</LoadingLabel>
            <Skeleton className="h-44 w-full" rounded="lg" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20" rounded="lg" />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState illustration="thinking_face" title="Your profile could not be loaded" message="Refresh the page to try again." />
        )}
      </div>
    );
  }

  const name = displayName(profile);
  const githubUrl = profile.github_url || `https://github.com/${profile.username}`;
  const checks = profileChecks(profile);
  const passed = checks.filter((c) => c.done).length;
  const strength = passed / checks.length;
  const strengthPct = Math.round(strength * 100);
  const gateMissing = missingProfileFields(profile).length > 0;
  const website = profile.website_url ? websiteHref(profile.website_url) : null;
  const unlocked = new Set(progress?.achievements ?? []);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-5 sm:px-6 md:px-8 md:pt-8">
      <SEO title="Your Profile – GitAlong" description="Your GitAlong profile." url="/app/profile" type="profile" noIndex />

      {/* Header */}
      <Tile padding="lg" className="relative">
        <PressableLink
          to="/app/settings"
          variant="ghost"
          size="sm"
          fullWidth={false}
          className="!absolute right-3 top-3 md:hidden"
          aria-label="Settings"
          leadingIcon={<Settings2 strokeWidth={2.75} />}
        >
          <span className="sr-only">Settings</span>
        </PressableLink>
        <div className="flex flex-col items-center gap-5 text-center md:flex-row md:items-center md:text-left">
          <ProgressRing value={strength} size={128} label="Profile strength" valueText={`${strengthPct}% complete`}>
            <Avatar src={profile.avatar_url} name={name} size={104} priority />
          </ProgressRing>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-center gap-2.5 md:justify-start">
              <h1 className="truncate text-h1 text-ink">{name}</h1>
              {progress && <LevelBadge level={progress.level} />}
            </div>
            <p className="text-body text-ink-muted">@{profile.username}</p>
            <p className="mt-1.5 type-caption text-green-fg">Profile {strengthPct}% complete</p>
            {profile.bio && <p className="mt-3 max-w-xl text-body text-ink">{profile.bio}</p>}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-body-sm text-ink-muted md:justify-start">
              {profile.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" strokeWidth={2.5} aria-hidden /> {profile.location}
                </span>
              )}
              {profile.company && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-4 w-4" strokeWidth={2.5} aria-hidden /> {profile.company}
                </span>
              )}
              {website && profile.website_url && (
                <a href={website} target="_blank" rel="noopener noreferrer" className="link flex items-center gap-1.5">
                  <Globe className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                  <span className="max-w-[16rem] truncate">{profile.website_url.replace(/^https?:\/\//, '')}</span>
                </a>
              )}
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto">
            <PressableLink to="/app/settings?tab=profile" variant="secondary" leadingIcon={<Pencil strokeWidth={2.75} />}>
              Edit profile
            </PressableLink>
            <PressableLink href={githubUrl} target="_blank" rel="noopener noreferrer" variant="ghost" leadingIcon={<Github strokeWidth={2.5} />}>
              View on GitHub
            </PressableLink>
          </div>
        </div>
      </Tile>

      {/* Level */}
      {progress && (
        <Tile tone="purple" padding="sm" className="mt-5 flex items-center gap-4 !p-4">
          <LevelBadge level={progress.level} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3">
              <span className="text-h3 text-ink">Level {progress.level}</span>
              <span className="text-body-sm font-bold text-ink-muted">
                {Math.max(0, progress.nextLevelXp - progress.xp).toLocaleString()} XP to level {progress.level + 1}
              </span>
            </div>
            <ProgressBar
              value={levelProgress(progress)}
              variant="purple"
              label={`Progress to level ${progress.level + 1}`}
              valueText={`${progress.xp} of ${progress.nextLevelXp} XP`}
            />
          </div>
        </Tile>
      )}

      {/* Stats */}
      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {progress ? (
          <>
            <StatTile art="fire" value={String(progress.streakDays)} label="Day streak" tone="text-flame-fg" />
            <StatTile art="high_voltage" value={progress.xp.toLocaleString()} label="Total XP" tone="text-gold-fg" />
            <StatTile art="handshake" value={String(progress.matches)} label="Matches" />
          </>
        ) : (
          <>
            <StatTile art="handshake" value={String(matches.length)} label="Matches" />
            <StatTile art="books" value={formatCount(profile.public_repos)} label="Public repos" />
            <StatTile art="busts" value={formatCount(profile.followers)} label="Followers" />
          </>
        )}
        <StatTile art="glowing_star" value={formatCount(profile.total_stars)} label="Stars earned" />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-3">
          {/* Pitch */}
          <Tile>
            <p className="type-caption text-ink-muted">What I’m building</p>
            {profile.pitch ? (
              <p className="mt-2 text-[18px] font-bold leading-relaxed text-ink">{profile.pitch}</p>
            ) : (
              <p className="mt-2 text-body text-ink-muted">
                No pitch yet. A one-line pitch helps the right people say yes.{' '}
                <button type="button" onClick={openProfileSetup} className="link">
                  Add one
                </button>
              </p>
            )}
          </Tile>

          {/* Tech stack & intents */}
          <Tile className="space-y-5">
            <div>
              <p className="mb-2 type-caption text-ink-muted">Looking for</p>
              {profile.looking_for.length ? <IntentChips values={profile.looking_for} /> : <p className="text-body-sm text-ink-muted">Not set yet.</p>}
            </div>
            <div>
              <p className="mb-2 type-caption text-ink-muted">Languages</p>
              {profile.languages.length ? <ChipList items={profile.languages} /> : <p className="text-body-sm text-ink-muted">Not set yet.</p>}
            </div>
            <div>
              <p className="mb-2 type-caption text-ink-muted">Interests</p>
              {profile.interests.length ? <ChipList items={profile.interests} /> : <p className="text-body-sm text-ink-muted">Not set yet.</p>}
            </div>
            {profile.seeking_skills.length > 0 && (
              <div>
                <p className="mb-2 type-caption text-ink-muted">Wants a partner who knows</p>
                <ChipList items={profile.seeking_skills} tone="green" />
              </div>
            )}
          </Tile>
        </div>

        {/* Checklist (only while incomplete) */}
        <div className="lg:col-span-2">
          {passed < checks.length ? (
            <Tile tone="green" className="lg:sticky lg:top-24">
              <div className="flex items-center gap-3">
                <Illustration name="memo" size={40} />
                <div>
                  <h2 className="text-h3 text-ink">Complete your profile</h2>
                  <p className="text-body-sm text-ink-muted">
                    {passed} of {checks.length} done{progress && !progress.profileComplete ? ' · +50 XP when you finish' : ''}
                  </p>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {checks.map((c) => (
                  <li key={c.key} className="flex items-center gap-2.5 text-body-sm">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                        c.done ? 'border-green bg-green text-white' : 'border-border-strong bg-card text-transparent'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5" strokeWidth={4} aria-hidden />
                    </span>
                    <span className={c.done ? 'text-ink-muted line-through decoration-2' : 'font-bold text-ink'}>{c.label}</span>
                    <span className="sr-only">{c.done ? '(done)' : '(to do)'}</span>
                  </li>
                ))}
              </ul>
              {gateMissing ? (
                <PressableButton fullWidth className="mt-5" onClick={openProfileSetup}>
                  Answer 5 quick questions
                </PressableButton>
              ) : (
                <PressableLink to="/app/settings?tab=profile" fullWidth className="mt-5">
                  Finish in settings
                </PressableLink>
              )}
            </Tile>
          ) : (
            <Tile tone="green" className="flex items-center gap-3">
              <Illustration name="hundred_points" size={48} />
              <div>
                <h2 className="text-h3 text-ink">Profile complete</h2>
                <p className="text-body-sm text-ink-muted">All 8 checks done. Nice!</p>
              </div>
            </Tile>
          )}
        </div>
      </div>

      {/* Achievements */}
      {progress && (
        <section className="mt-8" aria-labelledby="achievements-heading">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="achievements-heading" className="text-h2 text-ink">
              Achievements
            </h2>
            <span className="text-body-sm font-extrabold text-ink-muted">
              {unlocked.size} / {ACHIEVEMENTS.length}
            </span>
          </div>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {ACHIEVEMENTS.map((a) => (
              <li key={a.key}>
                <AchievementTile achievement={a} unlocked={unlocked.has(a.key)} isNew={recentUnlocks.has(a.key)} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Repositories */}
      <section className="mt-8" aria-labelledby="repos-heading">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="repos-heading" className="text-h2 text-ink">
            Top repositories
          </h2>
          <a
            href={`https://github.com/${profile.username}?tab=repositories`}
            target="_blank"
            rel="noopener noreferrer"
            className="link inline-flex min-h-[48px] items-center gap-1.5 text-body-sm"
          >
            All on GitHub <ExternalLink className="h-4 w-4" aria-hidden />
          </a>
        </div>
        {reposLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3" aria-hidden>
            <LoadingLabel>Loading repositories…</LoadingLabel>
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-32" rounded="lg" />
            ))}
          </div>
        ) : repos.length ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {repos.map((repo) => (
              <li key={repo.id}>
                <TileLink href={repo.html_url} target="_blank" rel="noopener noreferrer" className="h-full" faceClassName="flex h-full flex-col">
                  <span className="truncate text-h3 text-ink">{repo.name}</span>
                  <span className="mt-1 line-clamp-2 min-h-[2.6rem] text-body-sm text-ink-muted">{repo.description || 'No description'}</span>
                  <span className="mt-3 flex items-center gap-3 text-[13px] font-bold text-ink-muted">
                    {repo.language && <span className="text-sky-fg">{repo.language}</span>}
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-current text-gold" aria-hidden />
                      {repo.stargazers_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <GitFork className="h-3.5 w-3.5" aria-hidden />
                      {repo.forks_count}
                    </span>
                  </span>
                </TileLink>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState size="sm" illustration="laptop" title="No public repositories found" message="Public repos you publish on GitHub show up here." />
        )}
      </section>
    </div>
  );
};
