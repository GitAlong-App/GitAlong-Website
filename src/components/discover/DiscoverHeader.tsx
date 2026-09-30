import React from 'react';
import type { MyProgress } from '../../lib/progress';
import { Illustration, ProgressBar, Tile } from '../ui';

/** Daily goal (spec §7 Discover header): "6 / 10 builders today". */
export const DailyGoalTile: React.FC<{ progress: MyProgress }> = ({ progress }) => {
  const { todaySwipes, dailyGoal } = progress;
  const done = todaySwipes >= dailyGoal;
  const left = Math.max(0, dailyGoal - todaySwipes);
  return (
    <Tile padding="sm" className="flex items-center gap-3 !p-3.5">
      <Illustration name={done ? 'trophy' : 'sports_medal'} size={40} className={done ? 'animate-pop' : ''} />
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <span className="type-caption text-ink-muted">Daily goal</span>
          <span className="text-body-sm font-extrabold text-ink">
            {Math.min(todaySwipes, dailyGoal)} / {dailyGoal} builders today
          </span>
        </div>
        <ProgressBar
          value={todaySwipes / dailyGoal}
          variant={done ? 'gold' : 'green'}
          label="Daily goal"
          valueText={`${todaySwipes} of ${dailyGoal} builders reviewed today`}
        />
        <p className="mt-1.5 hidden text-[13px] font-bold text-ink-muted sm:block">
          {done ? 'Goal reached — anything more is a bonus!' : `${left} more to reach today’s goal.`}
        </p>
      </div>
    </Tile>
  );
};

/** Likes teaser (spec §7): a gold banner tile. Never reveals who. */
export const LikesTeaser: React.FC<{ count: number }> = ({ count }) => (
  <Tile tone="gold" padding="sm" className="flex items-center gap-3 !p-3.5">
    <Illustration name="sparkling_heart" size={40} />
    <p className="text-body-sm font-bold text-ink">
      {count === 1
        ? 'Someone already wants to build with you — keep swiping to find them.'
        : `${count} builders already want to build with you — keep swiping to find them.`}
    </p>
  </Tile>
);
