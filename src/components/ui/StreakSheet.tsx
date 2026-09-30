import React from 'react';
import { Check } from 'lucide-react';
import { Modal } from './Modal';
import { Illustration } from './Illustration';
import { ProgressBar } from './ProgressBar';
import { PressableLink } from './PressableButton';
import type { MyProgress } from '../../lib/progress';

/** Short weekday labels for the last 7 days, oldest → today. */
const lastSevenDays = (): string[] => {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    return d.toLocaleDateString(undefined, { weekday: 'narrow' });
  });
};

const fullDay = (offsetFromToday: number) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetFromToday);
  return d.toLocaleDateString(undefined, { weekday: 'long' });
};

/** StreakSheet: opened from the StreakChip — this week's activity, best streak and today's goal. */
export const StreakSheet: React.FC<{ open: boolean; onClose: () => void; progress: MyProgress }> = ({ open, onClose, progress }) => {
  const days = lastSevenDays();
  const { streakDays, activeToday, bestStreak, weekActivity, todaySwipes, dailyGoal } = progress;
  const title = streakDays === 1 ? '1-day streak' : `${streakDays}-day streak`;
  const status =
    streakDays === 0
      ? 'Review a builder or send a message today to start a streak.'
      : activeToday
        ? 'You’re on fire! Come back tomorrow to keep it going.'
        : 'Your streak is waiting. Review a builder or send a message today to keep it alive.';

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex items-center gap-4">
        <Illustration name="fire" size={72} className={activeToday ? '' : 'opacity-60 grayscale'} />
        <p className="text-body text-ink">{status}</p>
      </div>

      <ol className="mt-5 grid grid-cols-7 gap-1.5" aria-label="Activity over the last 7 days">
        {weekActivity.map((active, i) => (
          <li key={i} className="flex flex-col items-center gap-1.5">
            <span className="type-caption text-ink-subtle" aria-hidden>
              {days[i]}
            </span>
            <span
              className={`flex h-9 w-9 items-center justify-center rounded-full border-2 ${
                active ? 'border-flame-edge bg-flame text-white' : 'border-border bg-surface text-transparent'
              } ${i === 6 ? 'ring-2 ring-flame/40 ring-offset-2 ring-offset-card' : ''}`}
            >
              <Check className="h-4 w-4" strokeWidth={4} aria-hidden />
            </span>
            <span className="sr-only">
              {i === 6 ? 'Today' : fullDay(6 - i)}: {active ? 'active' : 'no activity'}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-lg border-2 border-border bg-surface p-3">
          <p className="type-caption text-ink-muted">Best streak</p>
          <p className="mt-1 text-h2 text-ink">
            {bestStreak} {bestStreak === 1 ? 'day' : 'days'}
          </p>
        </div>
        <div className="rounded-lg border-2 border-border bg-surface p-3">
          <p className="type-caption text-ink-muted">Today</p>
          <p className="mt-1 text-h2 text-ink">
            {Math.min(todaySwipes, dailyGoal)} / {dailyGoal}
          </p>
        </div>
      </div>
      <div className="mt-4">
        <ProgressBar
          value={todaySwipes / dailyGoal}
          label="Daily goal"
          valueText={`${todaySwipes} of ${dailyGoal} builders reviewed today`}
        />
        <p className="mt-2 text-body-sm text-ink-muted">Daily goal: review {dailyGoal} builders.</p>
      </div>
      <PressableLink to="/app/discover" fullWidth className="mt-6" onClick={onClose}>
        Keep going
      </PressableLink>
    </Modal>
  );
};
