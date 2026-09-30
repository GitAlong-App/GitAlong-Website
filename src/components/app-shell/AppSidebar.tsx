import React from 'react';
import { NavLink } from 'react-router-dom';
import { useMatches } from '../../contexts/MatchesContext';
import { useProgress } from '../../contexts/ProgressContext';
import { APP_NAV_ITEMS, APP_SECONDARY_ITEMS } from './navItems';
import { ProgressChips } from './ProgressChips';
import { Wordmark } from '../Wordmark';
import { ProgressBar, ThemeToggle } from '../ui';

const itemClass = (isActive: boolean) =>
  `group flex min-h-[52px] items-center gap-3 rounded-md border-2 px-3 text-[15px] font-extrabold uppercase tracking-[0.8px] transition-colors ${
    isActive
      ? 'border-green/50 bg-green-tint text-green-fg'
      : 'border-transparent text-ink-muted hover:bg-surface hover:text-ink'
  }`;

export const AppSidebar: React.FC = () => {
  const { unreadCount } = useMatches();
  const { progress } = useProgress();

  return (
    <aside className="hidden md:sticky md:top-0 md:flex md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r-2 md:border-border md:bg-bg lg:w-72">
      <div className="px-5 pb-3 pt-5">
        <Wordmark to="/app/discover" />
      </div>

      <div className="px-4">
        <ProgressChips showLevel className="-ml-1" />
        {progress && (
          <div className="mt-3 rounded-lg border-2 border-border bg-card p-3 shadow-edge-tile">
            <div className="mb-2 flex items-center justify-between">
              <span className="type-caption text-ink-muted">Daily goal</span>
              <span className="text-body-sm font-extrabold text-ink">
                {Math.min(progress.todaySwipes, progress.dailyGoal)} / {progress.dailyGoal}
              </span>
            </div>
            <ProgressBar
              value={progress.todaySwipes / progress.dailyGoal}
              size="sm"
              label="Daily goal"
              valueText={`${progress.todaySwipes} of ${progress.dailyGoal} builders reviewed today`}
            />
          </div>
        )}
      </div>

      <nav className="mt-4 flex-1 space-y-1.5 overflow-y-auto px-3" aria-label="App">
        {APP_NAV_ITEMS.map(({ to, label, icon: Icon, badge }) => (
          <NavLink key={to} to={to} className={({ isActive }) => itemClass(isActive)}>
            {({ isActive }) => (
              <>
                <Icon
                  className={`h-6 w-6 shrink-0 ${isActive ? 'fill-green/20' : ''}`}
                  strokeWidth={2.5}
                  aria-hidden
                />
                <span className="flex-1">{label}</span>
                {badge && unreadCount > 0 && (
                  <span
                    className="flex h-6 min-w-[24px] items-center justify-center rounded-pill bg-danger px-1.5 text-[12px] font-black text-white"
                    aria-label={`${unreadCount} unread conversations`}
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="space-y-1.5 border-t-2 border-border px-3 py-3">
        {APP_SECONDARY_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => itemClass(isActive)}>
            <Icon className="h-6 w-6 shrink-0" strokeWidth={2.5} aria-hidden />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}
        <div className="flex items-center justify-between px-1">
          <span className="text-body-sm text-ink-muted">Theme</span>
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
};
