import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { Ban, Check, Flag, Lock, UserX } from 'lucide-react';
import { INTENT_LABELS, type Intent } from '../../lib/collab';
import { INTENT_ART } from '../../lib/illustrations';
import { INTENT_BLURBS } from '../../lib/intentCopy';
import { EASE_OUT_CUBIC } from '../../lib/motion';
import { Chip, Illustration, OptionCard, ProgressBar, ProgressRing, StreakChip, XpChip } from '../ui';

/**
 * Small, honest product previews for the landing page. They show how the app
 * works with example content (labelled as such) — never real people, numbers
 * about usage, or testimonials.
 */

const ExampleTag: React.FC<{ label?: string }> = ({ label = 'Example' }) => (
  <span className="absolute right-3 top-3 z-10 rounded-pill border-2 border-border bg-surface px-2 py-0.5 text-[11px] font-black uppercase tracking-[0.8px] text-ink-subtle">
    {label}
  </span>
);

const Frame: React.FC<{ children: React.ReactNode; className?: string; tag?: string }> = ({ children, className = '', tag }) => (
  <div className={`relative rounded-xl border-2 border-border bg-card p-5 shadow-edge-tile sm:p-6 ${className}`}>
    {tag && <ExampleTag label={tag} />}
    {children}
  </div>
);

/** 1 · Say why you're here — tap the intents. */
export const IntentPickerDemo: React.FC = () => {
  const options: Intent[] = ['cofounder', 'open_source', 'hackathon', 'mentee'];
  const [picked, setPicked] = useState<Intent[]>(['cofounder', 'open_source']);
  return (
    <Frame tag="Try it">
      <p className="mb-4 pr-16 text-h3 text-ink">What brings you here?</p>
      <div role="group" aria-label="Example: what brings you here" className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((intent) => {
          const on = picked.includes(intent);
          return (
            <OptionCard
              key={intent}
              title={INTENT_LABELS[intent]}
              subtitle={INTENT_BLURBS[intent]}
              illustration={INTENT_ART[intent]}
              illustrationSize={40}
              selected={on}
              onSelect={() => setPicked(on ? picked.filter((p) => p !== intent) : [...picked, intent])}
            />
          );
        })}
      </div>
    </Frame>
  );
};

/** 2 · Get matched on real work — an example card. */
export const ExampleMatchCard: React.FC = () => (
  <Frame className="mx-auto max-w-md" tag="Example">
    <div className="flex items-center gap-4 pr-14">
      <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 border-card bg-sky-tint shadow-edge-tile">
        <Illustration name="technologist" size={56} />
      </span>
      <div className="min-w-0">
        <p className="text-h2 text-ink">Your next collaborator</p>
        <p className="text-body-sm text-ink-muted">Profile built from GitHub</p>
      </div>
    </div>
    <div className="relative mt-5 rounded-lg border-2 border-border bg-surface px-4 py-3">
      <span aria-hidden className="absolute -top-[9px] left-8 h-4 w-4 rotate-45 border-l-2 border-t-2 border-border bg-surface" />
      <p className="relative type-caption text-ink-muted">Building</p>
      <p className="relative mt-1 text-body text-ink">An open-source CLI for API testing — looking for a Rust dev to own the parser.</p>
    </div>
    <p className="mb-2 mt-4 type-caption text-ink-muted">Languages</p>
    <div className="flex flex-wrap gap-1.5">
      <Chip size="sm" tone="green" icon={<Check className="-ml-0.5 h-3 w-3" strokeWidth={4} aria-hidden />}>
        Rust
      </Chip>
      <Chip size="sm">TypeScript</Chip>
      <Chip size="sm">Go</Chip>
    </div>
    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
      {[
        { art: 'books', label: 'Public repos' },
        { art: 'glowing_star', label: 'Stars' },
        { art: 'busts', label: 'Followers' },
      ].map(({ art, label }) => (
        <div key={label} className="rounded-md border-2 border-border bg-surface px-2 py-2.5">
          <Illustration name={art as 'books'} size={24} className="mx-auto" />
          <p className="mt-1 text-[11px] font-black uppercase tracking-[0.6px] text-ink-muted">{label}</p>
        </div>
      ))}
    </div>
    <p className="mt-3 text-center text-[13px] font-semibold text-ink-subtle">Synced from GitHub, not self-reported.</p>
  </Frame>
);

/** 3 · Know why you matched — reasons in plain words. */
export const WhyMatchedDemo: React.FC = () => {
  const reasons = ['You’re both looking for a co-founder', 'Knows TypeScript — a skill you want', 'Looking for Dart, which you know'];
  const bars: Array<[string, number]> = [
    ['Intent fit', 1],
    ['Skills you want', 0.85],
    ['Shared tech', 0.55],
  ];
  return (
    <Frame className="mx-auto max-w-md" tag="Example">
      <div className="flex items-center gap-3 pr-16">
        <ProgressRing value={0.9} size={60}>
          <Illustration name="sparkles" size={28} />
        </ProgressRing>
        <p className="text-h3 text-ink">Why you matched</p>
      </div>
      <ul className="mt-4 space-y-2.5">
        {reasons.map((r, i) => (
          <motion.li
            key={r}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + i * 0.12, duration: 0.3, ease: EASE_OUT_CUBIC }}
            className="flex items-start gap-2.5 rounded-md border-2 border-green/40 bg-green-tint/60 px-3 py-2.5 text-body-sm font-bold text-ink"
          >
            <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green text-white">
              <Check className="h-3 w-3" strokeWidth={4} aria-hidden />
            </span>
            {r}
          </motion.li>
        ))}
      </ul>
      <div className="mt-5 space-y-3">
        {bars.map(([label, v]) => (
          <div key={label}>
            <p className="mb-1 text-[13px] font-bold text-ink-muted">{label}</p>
            <ProgressBar value={v} size="sm" label={label} />
          </div>
        ))}
      </div>
    </Frame>
  );
};

/** 4 · Build streaks — the daily goal and streak mechanics. */
export const StreakDemo: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, margin: '-80px' });
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (!seen) return;
    const t = window.setTimeout(() => setStep(1), 350);
    return () => window.clearTimeout(t);
  }, [seen]);
  const week = [true, true, false, true, true, true, step > 0];
  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  return (
    <div ref={ref}>
      <Frame className="mx-auto max-w-md" tag="Preview">
        <div className="flex items-center gap-1 pr-16">
          <StreakChip days={step > 0 ? 4 : 3} activeToday={step > 0} size="lg" />
          <XpChip xp={step > 0 ? 120 : 110} size="lg" />
        </div>
        <ol className="mt-5 grid grid-cols-7 gap-1.5" aria-label="Example week">
          {week.map((on, i) => (
            <li key={i} className="flex flex-col items-center gap-1.5">
              <span className="type-caption text-ink-subtle">{days[i]}</span>
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                  on ? 'border-flame-edge bg-flame text-white' : 'border-border bg-surface text-transparent'
                }`}
              >
                <Check className="h-4 w-4" strokeWidth={4} aria-hidden />
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-5 rounded-lg border-2 border-border bg-surface p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="type-caption text-ink-muted">Daily goal</span>
            <span className="text-body-sm font-extrabold text-ink">{step > 0 ? 7 : 6} / 10 builders today</span>
          </div>
          <ProgressBar value={step > 0 ? 0.7 : 0.6} label="Example daily goal" animateOnMount={false} />
        </div>
      </Frame>
    </div>
  );
};

/** 5 · Chat safely — real-time chat with safety tools. */
export const SafeChatDemo: React.FC = () => (
  <Frame className="mx-auto max-w-md" tag="Example">
    <div className="space-y-3 pt-6">
      <div className="flex justify-start">
        <div className="max-w-[85%] rounded-[20px] rounded-bl-md border-2 border-border bg-card px-4 py-2.5 text-body text-ink shadow-edge-tile">
          Your pitch caught my eye — where is the project at right now?
        </div>
      </div>
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-[20px] rounded-br-md bg-green px-4 py-2.5 text-body text-white shadow-[0_2px_0_0_#117A38]">
          Early MVP! Want a look at the repo?
        </div>
      </div>
    </div>
    <div className="mt-5 rounded-lg border-2 border-border bg-surface p-3">
      <div className="flex items-center gap-2">
        <Illustration name="shield" size={28} />
        <p className="text-body-sm font-extrabold text-ink">You’re in control</p>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip size="sm" icon={<UserX className="h-3 w-3" aria-hidden />}>
          Unmatch
        </Chip>
        <Chip size="sm" tone="danger" icon={<Ban className="h-3 w-3" aria-hidden />}>
          Block
        </Chip>
        <Chip size="sm" tone="danger" icon={<Flag className="h-3 w-3" aria-hidden />}>
          Report
        </Chip>
        <Chip size="sm" tone="sky" icon={<Lock className="h-3 w-3" aria-hidden />}>
          Email never shown
        </Chip>
      </div>
    </div>
  </Frame>
);
