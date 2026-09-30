import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserMenu } from '../UserMenu';
import { ProgressChips } from './ProgressChips';
import { Illustration } from '../ui';
import { useProgress } from '../../contexts/ProgressContext';

const titles: Array<[string, string, string]> = [
  ['/app/discover', 'Discover', 'Builders matched on intent, skills and real GitHub work'],
  ['/app/messages', 'Messages', 'Talk to your matches'],
  ['/app/activity', 'Activity', 'Your matches, likes and saved repositories'],
  ['/app/profile', 'Profile', 'How other builders see you'],
  ['/app/settings', 'Settings', 'Your GitAlong profile and account'],
];

export const AppTopbar: React.FC = () => {
  const location = useLocation();
  const { progress } = useProgress();
  const [, title, subtitle] = titles.find(([prefix]) => location.pathname.startsWith(prefix)) ?? ['', 'GitAlong', ''];
  // On phones the streak/XP chips need the room; the bottom nav already names the page.
  const titleClass = progress ? 'sr-only sm:not-sr-only' : '';

  return (
    <header className="sticky top-0 z-30 border-b-2 border-border bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
      <div className="flex h-16 items-center justify-between gap-2 px-4 md:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <Link to="/app/discover" className="-ml-1 flex h-12 w-12 shrink-0 items-center justify-center md:hidden" aria-label="GitAlong home">
            <Illustration name="octopus" size={36} priority />
          </Link>
          <div className="min-w-0">
            <h1 className={`truncate text-h3 text-ink md:text-h2 ${titleClass}`}>{title}</h1>
            {subtitle && <p className="hidden truncate text-body-sm text-ink-muted md:block">{subtitle}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <ProgressChips className="md:hidden" />
          <UserMenu />
        </div>
      </div>
    </header>
  );
};
