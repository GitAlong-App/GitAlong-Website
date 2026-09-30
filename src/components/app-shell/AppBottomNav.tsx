import React from 'react';
import { NavLink } from 'react-router-dom';
import { useMatches } from '../../contexts/MatchesContext';
import { APP_NAV_ITEMS } from './navItems';

/**
 * BottomNav (spec §3): 4 tabs. The active tab shows a filled icon in green on
 * a green-tint rounded rect with a subtle bounce; unread badges are danger pills.
 */
export const AppBottomNav: React.FC = () => {
  const { unreadCount } = useMatches();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-border bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      aria-label="App"
    >
      <div className="mx-auto grid max-w-lg grid-cols-4 px-2 pt-1.5">
        {APP_NAV_ITEMS.map(({ to, label, icon: Icon, badge }) => (
          <NavLink key={to} to={to} className="group flex min-h-[60px] flex-col items-center justify-center gap-0.5 tap-transparent">
            {({ isActive }) => (
              <>
                <span
                  className={`relative flex h-9 w-14 items-center justify-center rounded-md border-2 transition-colors ${
                    isActive ? 'animate-pop border-green/40 bg-green-tint text-green-fg' : 'border-transparent text-ink-subtle group-hover:text-ink-muted'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? 'fill-green/25' : ''}`} strokeWidth={2.5} aria-hidden />
                  {badge && unreadCount > 0 && (
                    <span
                      className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-pill border-2 border-bg bg-danger px-1 text-[11px] font-black text-white"
                      aria-label={`${unreadCount} unread conversations`}
                    >
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </span>
                <span className={`text-[11px] font-extrabold uppercase tracking-[0.6px] ${isActive ? 'text-green-fg' : 'text-ink-subtle'}`}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
