import React from 'react';
import { motion } from 'framer-motion';
import toast, { Toaster, resolveValue, type Toast as HotToast, type ToastOptions } from 'react-hot-toast';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { Illustration } from './Illustration';
import { Confetti } from './Confetti';
import type { AchievementDef } from '../../lib/achievements';
import type { IllustrationName } from '../../lib/illustrations';
import { usePrefersReducedMotion } from '../../lib/motion';

/**
 * Toast / AchievementToast (spec §3): a tile that slides down from the top
 * with a bounce, holds for 3 s and slides up. Built on react-hot-toast, so the
 * existing `toast.success()` / `toast.error()` calls keep working.
 */

/** Slide-down-with-bounce wrapper driven by the toast's `visible` flag. */
export const ToastMotion: React.FC<{ visible: boolean; children: React.ReactNode }> = ({ visible, children }) => {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -32, scale: 0.96 }}
      animate={
        visible
          ? { opacity: 1, y: 0, scale: 1, transition: reduced ? { duration: 0.15 } : { type: 'spring', stiffness: 420, damping: 22 } }
          : { opacity: 0, y: reduced ? 0 : -24, transition: { duration: 0.2, ease: 'easeIn' } }
      }
      className="pointer-events-auto w-[min(92vw,420px)]"
    >
      {children}
    </motion.div>
  );
};

const ToastTile: React.FC<{
  t: HotToast;
  icon: React.ReactNode;
  tone?: 'default' | 'danger';
  children: React.ReactNode;
}> = ({ t, icon, tone = 'default', children }) => (
  <div
    {...t.ariaProps}
    className={`flex items-center gap-3 rounded-lg border-2 bg-card px-4 py-3 ${
      tone === 'danger' ? 'border-danger shadow-edge-tile-danger' : 'border-border shadow-edge-tile'
    }`}
  >
    <span className="flex shrink-0 items-center">{icon}</span>
    <div className="min-w-0 flex-1 text-body-sm font-bold text-ink">{children}</div>
    <button
      type="button"
      onClick={() => toast.dismiss(t.id)}
      aria-label="Dismiss notification"
      className="-my-1 -mr-3 inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink-subtle hover:bg-surface hover:text-ink"
    >
      <X className="h-4 w-4" strokeWidth={3} aria-hidden />
    </button>
  </div>
);

/** Renders every non-custom toast as a tile. */
export const ToastView: React.FC<{ t: HotToast }> = ({ t }) => {
  const message = resolveValue(t.message, t);
  let icon: React.ReactNode;
  if (t.icon) icon = <span className="text-xl leading-none">{t.icon}</span>;
  else if (t.type === 'success') icon = <Illustration name="check_mark" size={28} />;
  else if (t.type === 'error')
    icon = (
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-danger-tint text-danger-fg">
        <AlertTriangle className="h-4 w-4" strokeWidth={2.75} aria-hidden />
      </span>
    );
  else if (t.type === 'loading') icon = <Loader2 className="h-6 w-6 animate-spin text-green-fg" aria-hidden />;
  else icon = <Illustration name="octopus" size={28} />;

  return (
    <ToastMotion visible={t.visible}>
      <ToastTile t={t} icon={icon} tone={t.type === 'error' ? 'danger' : 'default'}>
        {message}
      </ToastTile>
    </ToastMotion>
  );
};

/** The app-wide toaster (top-centre, tiles). Mount once. */
export const AppToaster: React.FC = () => (
  <Toaster
    position="top-center"
    gutter={10}
    containerStyle={{ top: 12, zIndex: 90 }}
    toastOptions={{ duration: 3000, error: { duration: 5000 }, success: { duration: 3000 } }}
  >
    {(t) => <ToastView t={t} />}
  </Toaster>
);

/** A custom toast body with the same slide-down animation. */
export function showCustomToast(render: (t: HotToast) => React.ReactNode, options: ToastOptions = {}): string {
  return toast.custom((t) => <ToastMotion visible={t.visible}>{render(t)}</ToastMotion>, { duration: 3000, ...options });
}

/** AchievementToast: gold tile announcing a newly unlocked achievement. */
export const AchievementToast: React.FC<{ achievement: AchievementDef; t?: HotToast }> = ({ achievement, t }) => (
  <div
    role="status"
    aria-live="polite"
    className="relative flex items-center gap-3 overflow-hidden rounded-lg border-2 border-gold bg-card px-4 py-3 shadow-edge-tile-gold"
  >
    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-gold-tint ring-4 ring-gold/40">
      <Illustration name={achievement.art} size={40} />
    </span>
    <div className="min-w-0 flex-1">
      <p className="type-caption text-gold-fg">Achievement unlocked</p>
      <p className="text-h3 text-ink">{achievement.title}</p>
      <p className="text-body-sm text-ink-muted">{achievement.description}</p>
    </div>
    {t && (
      <button
        type="button"
        onClick={() => toast.dismiss(t.id)}
        aria-label="Dismiss"
        className="-my-1 -mr-3 inline-flex h-12 w-12 shrink-0 items-center justify-center self-start rounded-full text-ink-subtle hover:bg-surface hover:text-ink"
      >
        <X className="h-4 w-4" strokeWidth={3} aria-hidden />
      </button>
    )}
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shine-once bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/15"
    />
  </div>
);

export const showAchievementToast = (achievement: AchievementDef) =>
  showCustomToast((t) => <AchievementToast achievement={achievement} t={t} />, { id: `achievement-${achievement.key}` });

/** A celebratory toast (e.g. daily goal reached) with a small confetti burst. */
export const CelebrationToast: React.FC<{
  illustration: IllustrationName;
  title: string;
  message?: string;
  t?: HotToast;
}> = ({ illustration, title, message, t }) => (
  <>
    <Confetti portal particleCount={60} origin={{ x: 0.5, y: 0.08 }} />
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-lg border-2 border-green bg-card px-4 py-3 shadow-edge-tile-green"
    >
      <Illustration name={illustration} size={44} />
      <div className="min-w-0 flex-1">
        <p className="text-h3 text-ink">{title}</p>
        {message && <p className="text-body-sm text-ink-muted">{message}</p>}
      </div>
      {t && (
        <button
          type="button"
          onClick={() => toast.dismiss(t.id)}
          aria-label="Dismiss"
          className="-my-1 -mr-3 inline-flex h-12 w-12 shrink-0 items-center justify-center self-start rounded-full text-ink-subtle hover:bg-surface hover:text-ink"
        >
          <X className="h-4 w-4" strokeWidth={3} aria-hidden />
        </button>
      )}
    </div>
  </>
);

export const showCelebrationToast = (props: { illustration: IllustrationName; title: string; message?: string; id?: string }) =>
  showCustomToast((t) => <CelebrationToast {...props} t={t} />, { id: props.id, duration: 4000 });
