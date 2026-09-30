import React, { forwardRef, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { animate, motion, MotionValue, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Check, ChevronDown, Github, Heart, MapPin, Star, X } from 'lucide-react';
import type { Recommendation } from '../../services/backendService';
import type { SwipeAction } from '../../services/dataService';
import { INTENT_MATCHES_WITH, SCORE_BREAKDOWN_LABELS, isIntent } from '../../lib/collab';
import { formatCount } from '../../lib/format';
import { EASE_OUT_CUBIC, useMediaQuery, usePrefersReducedMotion } from '../../lib/motion';
import { IntentChips } from '../IntentChips';
import { Avatar, Chip, CircleActionButton, Illustration, PressableLink, ProgressBar, ProgressRing } from '../ui';

/**
 * The Discover card (spec §7): a hero tile with the avatar, name and a match %
 * ring, the pitch in a speech bubble, intent chips, why-you-matched rows,
 * language chips and stats. Drag or use the big round buttons; LIKE / NOPE /
 * SUPER stamps show the decision.
 */
export interface DeveloperCardHandle {
  swipe: (action: SwipeAction) => void;
}

interface DeveloperCardProps {
  dev: Recommendation;
  mySeekingSkills: string[];
  myIntents: string[];
  onSwipe: (dev: Recommendation, action: SwipeAction) => void;
  /** Show a hint of the next card behind this one. */
  hasNext: boolean;
}

const humanizeKey = (key: string) =>
  SCORE_BREAKDOWN_LABELS[key] ?? key.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

/** Decision stamp. Rotation/centring go through framer-motion (it owns `transform` on motion elements). */
const Stamp: React.FC<{
  label: string;
  className: string;
  opacity: number | MotionValue<number>;
  rotate: number;
  centered?: boolean;
}> = ({ label, className, opacity, rotate, centered = false }) => (
  <motion.span
    aria-hidden
    style={{ opacity, rotate, x: centered ? '-50%' : 0 }}
    className={`pointer-events-none absolute z-20 rounded-md border-4 bg-card/90 px-3 py-1 text-[30px] font-black uppercase leading-none tracking-[2px] ${className}`}
  >
    {label}
  </motion.span>
);

const Stat: React.FC<{ art: React.ComponentProps<typeof Illustration>['name']; value: string; label: string }> = ({
  art,
  value,
  label,
}) => (
  <div className="flex items-center gap-2 rounded-md border-2 border-border bg-surface px-2.5 py-2">
    <Illustration name={art} size={24} />
    <div className="min-w-0 leading-tight">
      <div className="text-[16px] font-black text-ink">{value}</div>
      <div className="truncate text-[11px] font-extrabold uppercase tracking-[0.6px] text-ink-muted">{label}</div>
    </div>
  </div>
);

export const DeveloperCard = forwardRef<DeveloperCardHandle, DeveloperCardProps>(function DeveloperCard(
  { dev, mySeekingSkills, myIntents, onSwipe, hasNext },
  ref
) {
  const reduced = usePrefersReducedMotion();
  const roomy = useMediaQuery('(min-width: 640px)');
  const [leaving, setLeaving] = useState(false);
  const [stamp, setStamp] = useState<SwipeAction | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const leavingRef = useRef(false);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const opacity = useMotionValue(1);
  const rotate = useTransform(x, [-320, 0, 320], [-14, 0, 14]);
  const likeOpacity = useTransform(x, [24, 110], [0, 1]);
  const nopeOpacity = useTransform(x, [-110, -24], [1, 0]);

  /** `fromDrag`: the card is already off-centre, so fly right away (no stamp pause). */
  const fly = async (action: SwipeAction, fromDrag = false) => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    setLeaving(true);
    setStamp(action);
    if (reduced) {
      await animate(opacity, 0, { duration: 0.15 });
    } else if (action === 'superLike') {
      if (!fromDrag) await new Promise((r) => setTimeout(r, 160));
      await animate(y, -Math.max(720, window.innerHeight), { duration: 0.38, ease: [0.4, 0, 0.2, 1] });
    } else {
      if (!fromDrag) await new Promise((r) => setTimeout(r, 120));
      const dir = action === 'like' ? 1 : -1;
      await animate(x, dir * (window.innerWidth / 2 + 520), { duration: fromDrag ? 0.26 : 0.34, ease: [0.4, 0, 0.2, 1] });
    }
    onSwipe(dev, action);
  };

  useImperativeHandle(ref, () => ({ swipe: (action) => void fly(action) }));

  const onDragEnd = (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (info.offset.x > 120 || info.velocity.x > 650) void fly('like', true);
    else if (info.offset.x < -120 || info.velocity.x < -650) void fly('dislike', true);
  };

  const name = dev.name || dev.username;
  const githubUrl = dev.github_url || `https://github.com/${dev.username}`;
  const reasons = (dev.match_reasons ?? []).filter(Boolean).slice(0, 3);
  const wanted = useMemo(() => new Set(mySeekingSkills.map((s) => s.toLowerCase())), [mySeekingSkills]);
  const fits = useMemo(() => {
    const mine = new Set(myIntents.filter(isIntent));
    return new Set((dev.looking_for ?? []).filter((i) => isIntent(i) && mine.has(INTENT_MATCHES_WITH[i])));
  }, [dev.looking_for, myIntents]);
  const breakdown = Object.entries(dev.score_breakdown ?? {}).filter(
    (entry): entry is [string, number] => typeof entry[1] === 'number'
  );
  const hasDetails = breakdown.length > 0 || typeof dev.ml_like_prob === 'number' || typeof dev.filter_preference_score === 'number';
  const score = typeof dev.match_score === 'number' ? Math.max(0, Math.min(100, Math.round(dev.match_score))) : null;
  const languages = [...dev.languages].sort((a, b) => Number(wanted.has(b.toLowerCase())) - Number(wanted.has(a.toLowerCase())));

  return (
    <div className="relative mx-auto w-full max-w-[460px]">
      <div className="relative">
        {hasNext && (
          <div aria-hidden className="absolute inset-x-5 -bottom-2.5 top-3 rounded-xl border-2 border-border bg-card shadow-edge-tile" />
        )}
        <motion.article
          aria-label={`${name}${score !== null ? `, ${score}% match` : ''}`}
          drag={leaving ? false : 'x'}
          dragSnapToOrigin
          dragElastic={0.9}
          onDragEnd={onDragEnd}
          style={{ x, y, rotate, opacity }}
          initial={reduced ? { opacity: 0 } : { scale: 0.96, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT_CUBIC }}
          whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
          className="relative cursor-grab touch-pan-y select-none overflow-hidden rounded-xl border-2 border-border bg-card shadow-edge-tile"
        >
          <Stamp label="Like" className="left-5 top-6 border-green text-green-fg" rotate={-12} opacity={stamp === 'like' ? 1 : likeOpacity} />
          <Stamp label="Nope" className="right-5 top-6 border-danger text-danger-fg" rotate={12} opacity={stamp === 'dislike' ? 1 : nopeOpacity} />
          <Stamp label="Super" className="left-1/2 top-1/3 border-purple text-purple-fg" rotate={-6} centered opacity={stamp === 'superLike' ? 1 : 0} />

          {/* Hero */}
          <div className="relative bg-gradient-to-b from-green-tint/70 to-transparent px-5 pb-3 pt-5">
            <div className="flex items-start gap-4">
              <Avatar src={dev.avatar_url} name={name} size={84} className="border-4 border-card shadow-edge-tile" />
              <div className="min-w-0 flex-1 pt-1">
                <h2 className="truncate text-h2 text-ink">{name}</h2>
                <p className="truncate text-body-sm text-ink-muted">@{dev.username}</p>
                {dev.location && (
                  <p className="mt-1 flex items-center gap-1 truncate text-body-sm text-ink-muted">
                    <MapPin className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                    <span className="truncate">{dev.location}</span>
                  </p>
                )}
              </div>
              {score !== null && (
                <ProgressRing value={score / 100} size={68} label="Match score" valueText={`${score}% match`}>
                  <span className="flex flex-col items-center leading-none">
                    <span className="text-[17px] font-black text-green-fg">{score}%</span>
                    <span className="mt-0.5 text-[9px] font-black uppercase tracking-[0.8px] text-ink-muted">match</span>
                  </span>
                </ProgressRing>
              )}
            </div>
            {dev.bio && <p className="mt-3 line-clamp-2 text-body-sm text-ink-muted">{dev.bio}</p>}
          </div>

          <div className="space-y-4 px-5 pb-5">
            {/* Pitch bubble */}
            {dev.pitch && (
              <div className="relative mt-1 rounded-lg border-2 border-border bg-surface px-4 py-3">
                <span aria-hidden className="absolute -top-[9px] left-8 h-4 w-4 rotate-45 border-l-2 border-t-2 border-border bg-surface" />
                <p className="relative type-caption text-ink-muted">Building</p>
                <p className="relative mt-1 line-clamp-4 text-body text-ink">{dev.pitch}</p>
              </div>
            )}

            {(dev.looking_for?.length ?? 0) > 0 && (
              <div>
                <p className="mb-2 type-caption text-ink-muted">Looking for</p>
                <IntentChips values={dev.looking_for} highlight={fits} />
              </div>
            )}

            {reasons.length > 0 && (
              <div className="rounded-lg border-2 border-green/40 bg-green-tint/60 p-3.5">
                <p className="mb-2 flex items-center gap-2 type-caption text-green-fg">
                  <Illustration name="light_bulb" size={20} /> Why you matched
                </p>
                <ul className="space-y-2">
                  {reasons.map((reason) => (
                    <li key={reason} className="flex items-start gap-2.5 text-body-sm text-ink">
                      <span className="mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green text-white">
                        <Check className="h-3 w-3" strokeWidth={4} aria-hidden />
                      </span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {languages.length > 0 && (
              <div>
                <p className="mb-2 type-caption text-ink-muted">Languages</p>
                <div className="flex flex-wrap gap-1.5">
                  {languages.slice(0, 8).map((lang) => {
                    const isWanted = wanted.has(lang.toLowerCase());
                    return (
                      <Chip
                        key={lang}
                        size="sm"
                        tone={isWanted ? 'green' : 'neutral'}
                        icon={isWanted ? <Check className="-ml-0.5 h-3 w-3" strokeWidth={4} aria-hidden /> : undefined}
                        title={isWanted ? 'A skill you’re looking for' : undefined}
                      >
                        {lang}
                      </Chip>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="grid grid-cols-3 gap-2">
              <Stat art="glowing_star" value={formatCount(dev.total_stars ?? 0)} label="Stars" />
              <Stat art="books" value={formatCount(dev.public_repos)} label="Repos" />
              <Stat art="busts" value={formatCount(dev.followers)} label="Followers" />
            </div>

            {(dev.seeking_skills?.length ?? 0) > 0 && (
              <p className="text-body-sm text-ink-muted">
                <span className="font-extrabold text-ink">Wants a partner who knows:</span> {dev.seeking_skills!.slice(0, 6).join(', ')}
              </p>
            )}

            {hasDetails && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowDetails((v) => !v)}
                  onPointerDownCapture={(e) => e.stopPropagation()}
                  className="-ml-2 inline-flex min-h-[48px] items-center gap-1.5 rounded-md px-2 type-caption text-ink-muted hover:bg-surface hover:text-ink"
                  aria-expanded={showDetails}
                >
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`} strokeWidth={3} aria-hidden />
                  {showDetails ? 'Hide score details' : 'Score details'}
                </button>
                {showDetails && (
                  <div className="mt-2 grid animate-fade-up grid-cols-1 gap-x-5 gap-y-2.5 sm:grid-cols-2">
                    {breakdown.map(([key, value]) => (
                      <div key={key}>
                        <div className="mb-1 flex items-center justify-between text-[13px] font-bold">
                          <span className="truncate text-ink-muted">{humanizeKey(key)}</span>
                          <span className="text-ink">{Math.round(value)}%</span>
                        </div>
                        <ProgressBar value={value / 100} size="sm" label={humanizeKey(key)} valueText={`${Math.round(value)}%`} />
                      </div>
                    ))}
                    {typeof dev.ml_like_prob === 'number' && (
                      <div className="flex items-center justify-between text-[13px] font-bold">
                        <span className="text-ink-muted">Predicted interest</span>
                        <span className="text-ink">{Math.round(dev.ml_like_prob * 100)}%</span>
                      </div>
                    )}
                    {typeof dev.filter_preference_score === 'number' && (
                      <div className="flex items-center justify-between text-[13px] font-bold">
                        <span className="text-ink-muted">Filter fit</span>
                        <span className="text-ink">{Math.round(dev.filter_preference_score * 100)}%</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            <PressableLink
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              size="sm"
              fullWidth
              leadingIcon={<Github strokeWidth={2.5} />}
              onPointerDownCapture={(e) => e.stopPropagation()}
            >
              See their work on GitHub
            </PressableLink>
          </div>
        </motion.article>
      </div>

      {/* Big round 3D buttons — they stay reachable while you read a long card. */}
      <div className="sticky bottom-[calc(80px+env(safe-area-inset-bottom))] z-20 mt-6 md:bottom-4">
        <div className="mx-auto flex w-max items-center justify-center gap-5 rounded-[40px] border-2 border-border bg-bg/85 px-4 py-1.5 shadow-edge-tile backdrop-blur-md sm:items-end sm:gap-7 sm:px-6 sm:pb-1 sm:pt-2.5">
          <CircleActionButton
            variant="danger"
            label="Nope"
            size={roomy ? 64 : 56}
            captionClassName="hidden sm:block"
            icon={<X className="h-8 w-8" strokeWidth={3.5} />}
            onClick={() => void fly('dislike')}
            disabled={leaving}
            aria-keyshortcuts="ArrowLeft"
          />
          <CircleActionButton
            variant="purple"
            label="Super"
            size={roomy ? 56 : 48}
            captionClassName="hidden sm:block"
            icon={<Star className="h-7 w-7 fill-white" strokeWidth={2.5} />}
            onClick={() => void fly('superLike')}
            disabled={leaving}
            aria-keyshortcuts="ArrowUp"
          />
          <CircleActionButton
            variant="green"
            label="Like"
            size={roomy ? 72 : 64}
            captionClassName="hidden sm:block"
            icon={<Heart className="h-9 w-9 fill-white" strokeWidth={2.5} />}
            onClick={() => void fly('like')}
            disabled={leaving}
            aria-keyshortcuts="ArrowRight"
          />
        </div>
      </div>
    </div>
  );
});
