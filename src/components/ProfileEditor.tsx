import React, { useEffect, useMemo, useState } from 'react';
import { Building2, ExternalLink, Github, Globe, MapPin, RefreshCw, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useProgress } from '../contexts/ProgressContext';
import { ChipSelect } from './ChipSelect';
import { INTENTS, INTENT_LABELS, INTEREST_OPTIONS, LANGUAGE_OPTIONS, PITCH_MAX, missingProfileFields } from '../lib/collab';
import { INTENT_ART } from '../lib/illustrations';
import { INTENT_BLURBS } from '../lib/intentCopy';
import { ProfileUpdate, UserProfile } from '../lib/types';
import { formatCount, formatRelativeTime } from '../lib/format';
import { BackendError, backendService } from '../services/backendService';
import { Avatar, Illustration, LoadingLabel, OptionCard, PressableButton, Skeleton, Tile } from './ui';

interface FormState {
  name: string;
  bio: string;
  location: string;
  company: string;
  website_url: string;
  looking_for: string[];
  languages: string[];
  interests: string[];
  seeking_skills: string[];
  pitch: string;
}

const toForm = (p: UserProfile | null): FormState => ({
  name: p?.name ?? '',
  bio: p?.bio ?? '',
  location: p?.location ?? '',
  company: p?.company ?? '',
  website_url: p?.website_url ?? '',
  looking_for: p?.looking_for ?? [],
  languages: p?.languages ?? [],
  interests: p?.interests ?? [],
  seeking_skills: p?.seeking_skills ?? [],
  pitch: p?.pitch ?? '',
});

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i]);

const normalizeUrl = (raw: string): string | null => {
  const v = raw.trim();
  if (!v) return '';
  const withScheme = /^https?:\/\//i.test(v) ? v : `https://${v}`;
  try {
    const url = new URL(withScheme);
    return url.hostname.includes('.') ? url.toString() : null;
  } catch {
    return null;
  }
};

const Section: React.FC<{ title: string; hint?: string; required?: boolean; children: React.ReactNode }> = ({
  title,
  hint,
  required,
  children,
}) => (
  <Tile as="section" aria-label={title}>
    <div className="mb-4">
      <h3 className="flex flex-wrap items-center gap-2 text-h3 text-ink">
        {title}
        {required && (
          <span className="rounded-pill border-2 border-green bg-green-tint px-2 py-0.5 text-[11px] font-black uppercase tracking-[0.6px] text-green-fg">
            Needed for matching
          </span>
        )}
      </h3>
      {hint && <p className="mt-1 text-body-sm text-ink-muted">{hint}</p>}
    </div>
    {children}
  </Tile>
);

/** Edits the GitAlong profile (the user's `users` row). */
export const ProfileEditor: React.FC = () => {
  const { profile, profileLoading, saveProfile, refreshProfile } = useAuth();
  const { refresh: refreshProgress } = useProgress();
  const [form, setForm] = useState<FormState>(() => toForm(profile));
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Load the profile into the form when it first arrives (or changes while the form is pristine).
  const baseline = useMemo(() => toForm(profile), [profile]);
  const dirty = useMemo(
    () =>
      (Object.keys(baseline) as (keyof FormState)[]).some((k) => {
        const a = baseline[k];
        const b = form[k];
        return Array.isArray(a) && Array.isArray(b) ? !sameList(a, b) : a !== b;
      }),
    [baseline, form]
  );

  // Whether the user has typed anything since the last load/save/discard.
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!touched) setForm(baseline);
  }, [baseline]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setTouched(true);
    setForm((f) => ({ ...f, [key]: value }));
  };

  const discard = () => {
    setTouched(false);
    setForm(baseline);
    setUrlError(null);
  };

  const missing = missingProfileFields({ looking_for: form.looking_for, languages: form.languages, interests: form.interests });

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = normalizeUrl(form.website_url);
    if (url === null) {
      setUrlError('Enter a valid website address, e.g. https://example.com');
      return;
    }
    setUrlError(null);
    const patch: ProfileUpdate = {
      name: form.name,
      bio: form.bio,
      location: form.location,
      company: form.company,
      website_url: url,
      looking_for: form.looking_for,
      languages: form.languages,
      interests: form.interests,
      seeking_skills: form.seeking_skills,
      pitch: form.pitch,
    };
    setSaving(true);
    try {
      const saved = await saveProfile(patch);
      setForm(toForm(saved));
      setTouched(false);
      await refreshProfile();
      refreshProgress();
      toast.success('Profile saved. Your matches will reflect it on the next refresh.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  };

  const onSyncGitHub = async () => {
    setSyncing(true);
    try {
      await backendService.refreshGitHub();
      await refreshProfile();
      toast.success('GitHub stats refreshed.');
    } catch (err) {
      if (err instanceof BackendError && err.status === 503) {
        toast.error('GitHub is unavailable right now. Nothing was changed — try again later.');
      } else {
        toast.error('Could not reach the GitHub sync service. Try again in a minute.');
      }
    } finally {
      setSyncing(false);
    }
  };

  if (!profile) {
    return profileLoading ? (
      <div className="space-y-4" aria-hidden>
        <LoadingLabel>Loading your profile…</LoadingLabel>
        <Skeleton className="h-28 w-full" rounded="lg" />
        <Skeleton className="h-56 w-full" rounded="lg" />
      </div>
    ) : (
      <Tile className="flex items-center gap-3">
        <Illustration name="thinking_face" size={40} />
        <p className="text-body text-ink">Your profile could not be loaded. Refresh the page to try again.</p>
      </Tile>
    );
  }

  const githubUrl = profile.github_url || `https://github.com/${profile.username}`;

  return (
    <form onSubmit={onSave} className="space-y-5">
      {/* GitHub-derived (read-only) */}
      <Tile className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Avatar src={profile.avatar_url} name={profile.name || profile.username} size={64} />
        <div className="min-w-0 flex-1">
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center gap-2 text-h3 text-ink hover:text-green-fg"
          >
            <Github className="h-5 w-5" strokeWidth={2.5} aria-hidden />@{profile.username}
            <ExternalLink className="h-4 w-4 text-ink-subtle" aria-hidden />
          </a>
          <p className="mt-1 text-body-sm text-ink-muted">
            {formatCount(profile.followers)} followers · {profile.public_repos} public repos · {formatCount(profile.total_stars)} stars
          </p>
          <p className="mt-1 text-[13px] font-semibold text-ink-subtle">
            GitHub stats are synced by GitAlong{profile.github_synced_at ? ` · last synced ${formatRelativeTime(profile.github_synced_at)} ago` : ''}.
          </p>
        </div>
        <PressableButton
          variant="secondary"
          size="sm"
          onClick={() => void onSyncGitHub()}
          loading={syncing}
          leadingIcon={<RefreshCw strokeWidth={2.75} />}
        >
          Refresh from GitHub
        </PressableButton>
      </Tile>

      {missing.length > 0 && (
        <Tile tone="green" padding="sm" className="flex items-center gap-3">
          <Illustration name="octopus" size={40} />
          <p className="text-body-sm font-bold text-ink">To get good matches, add {missing.join(', ')}.</p>
        </Tile>
      )}

      <Section
        title="Why are you here?"
        hint="Pick everything that applies. We match you with people whose intent fits yours (mentors ↔ mentees, co-founders ↔ co-founders)."
        required
      >
        <div role="group" aria-label="Looking for" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {INTENTS.map((intent) => {
            const on = form.looking_for.includes(intent);
            return (
              <OptionCard
                key={intent}
                title={INTENT_LABELS[intent]}
                subtitle={INTENT_BLURBS[intent]}
                illustration={INTENT_ART[intent]}
                illustrationSize={40}
                selected={on}
                onSelect={() => set('looking_for', on ? form.looking_for.filter((v) => v !== intent) : [...form.looking_for, intent])}
              />
            );
          })}
        </div>
      </Section>

      <Section title="What are you building?" hint="A short pitch shown on your card and in chats.">
        <textarea
          value={form.pitch}
          onChange={(e) => set('pitch', e.target.value.slice(0, PITCH_MAX))}
          rows={3}
          maxLength={PITCH_MAX}
          aria-label="Your pitch"
          placeholder="e.g. An offline-first habit tracker in Flutter — looking for a backend dev to own sync."
          className="field resize-none"
        />
        <div className={`mt-1.5 text-right text-body-sm ${form.pitch.length >= PITCH_MAX ? 'text-gold-fg' : 'text-ink-muted'}`}>
          {form.pitch.length}/{PITCH_MAX}
        </div>
      </Section>

      <Section title="Skills you want in a partner" hint="We boost people who know these, and tell you when they do.">
        <ChipSelect
          options={LANGUAGE_OPTIONS}
          value={form.seeking_skills}
          onChange={(v) => set('seeking_skills', v)}
          allowCustom
          customPlaceholder="Add a skill (e.g. Figma, Kubernetes)"
          ariaLabel="Skills you want"
        />
      </Section>

      <Section title="Languages you work in" required>
        <ChipSelect
          options={LANGUAGE_OPTIONS}
          value={form.languages}
          onChange={(v) => set('languages', v)}
          allowCustom
          customPlaceholder="Add another language"
          ariaLabel="Languages"
        />
      </Section>

      <Section title="Interests" required>
        <ChipSelect
          options={INTEREST_OPTIONS}
          value={form.interests}
          onChange={(v) => set('interests', v)}
          allowCustom
          customPlaceholder="Add another interest"
          ariaLabel="Interests"
        />
      </Section>

      <Section title="About you">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block type-caption text-ink-muted">Display name</span>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} maxLength={100} placeholder={profile.username} className="field" />
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1 type-caption text-ink-muted">
              <MapPin className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
              Location
            </span>
            <input
              value={form.location}
              onChange={(e) => set('location', e.target.value)}
              maxLength={100}
              placeholder="City, country or Remote"
              className="field"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1 type-caption text-ink-muted">
              <Building2 className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
              Company / school
            </span>
            <input value={form.company} onChange={(e) => set('company', e.target.value)} maxLength={100} className="field" />
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1 type-caption text-ink-muted">
              <Globe className="h-3.5 w-3.5" strokeWidth={3} aria-hidden />
              Website
            </span>
            <input
              value={form.website_url}
              onChange={(e) => {
                set('website_url', e.target.value);
                setUrlError(null);
              }}
              maxLength={300}
              placeholder="https://"
              inputMode="url"
              aria-invalid={!!urlError}
              aria-describedby={urlError ? 'website-error' : undefined}
              className={`field ${urlError ? 'field-invalid' : ''}`}
            />
            {urlError && (
              <span id="website-error" className="mt-1 block text-body-sm font-bold text-danger-fg">
                {urlError}
              </span>
            )}
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1.5 block type-caption text-ink-muted">Bio</span>
            <textarea
              value={form.bio}
              onChange={(e) => set('bio', e.target.value.slice(0, 500))}
              rows={3}
              maxLength={500}
              placeholder="A line or two about you"
              className="field resize-none"
            />
          </label>
        </div>
      </Section>

      <div className="sticky bottom-24 z-10 md:bottom-4">
        <div className="flex flex-col gap-3 rounded-lg border-2 border-border bg-card/95 p-3 shadow-edge-tile backdrop-blur sm:flex-row sm:items-center">
          <span className="text-body-sm font-bold text-ink-muted sm:mr-auto">
            {dirty ? 'You have unsaved changes.' : 'Changes sync to the mobile app too.'}
          </span>
          <div className="flex gap-2">
            {dirty && (
              <PressableButton variant="ghost" size="sm" onClick={discard} disabled={saving}>
                Discard
              </PressableButton>
            )}
            <PressableButton type="submit" size="sm" disabled={!dirty} loading={saving} leadingIcon={<Save strokeWidth={2.75} />}>
              Save profile
            </PressableButton>
          </div>
        </div>
      </div>
    </form>
  );
};
