import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserMenu } from './UserMenu';
import { AuthModal } from './AuthModal';
import { Wordmark } from './Wordmark';
import { PressableButton, PressableLink, ThemeToggle } from './ui';
import { EASE_OUT_CUBIC } from '../lib/motion';

const NAV_ITEMS = [
  { path: '/features', label: 'Features' },
  { path: '/about', label: 'About' },
  { path: '/faq', label: 'FAQ' },
  { path: '/team', label: 'Team' },
  { path: '/contact', label: 'Contact' },
];

/** Marketing header: light, sticky, with the Octo wordmark. */
export const Navigation: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [auth, setAuth] = useState<null | 'signup' | 'signin'>(null);
  const location = useLocation();
  const { currentUser } = useAuth();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex min-h-[48px] items-center rounded-md px-3 text-[15px] font-extrabold transition-colors ${
      isActive ? 'bg-green-tint text-green-fg' : 'text-ink-muted hover:bg-surface hover:text-ink'
    }`;

  return (
    <>
      <header className="sticky top-0 z-40 border-b-2 border-border bg-bg/90 backdrop-blur supports-[backdrop-filter]:bg-bg/80">
        <div className="gutter mx-auto flex h-[72px] max-w-6xl items-center justify-between gap-3">
          <Wordmark priority />

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.path} to={item.path} className={linkClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            {currentUser ? (
              <>
                <PressableLink to="/app/discover" size="sm" fullWidth={false}>
                  Open app
                </PressableLink>
                <UserMenu />
              </>
            ) : (
              <>
                <PressableButton variant="ghost" size="sm" fullWidth={false} onClick={() => setAuth('signin')}>
                  Sign in
                </PressableButton>
                <PressableButton size="sm" fullWidth={false} onClick={() => setAuth('signup')}>
                  Get started
                </PressableButton>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              className="inline-flex h-12 w-12 items-center justify-center rounded-full text-ink hover:bg-surface"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X className="h-6 w-6" strokeWidth={3} aria-hidden /> : <Menu className="h-6 w-6" strokeWidth={3} aria-hidden />}
            </button>
          </div>
        </div>

        {/* Tablet: links row under the bar */}
        <nav className="gutter mx-auto hidden max-w-6xl items-center gap-1 pb-2 md:flex lg:hidden" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.path} to={item.path} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              id="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: EASE_OUT_CUBIC }}
              className="border-t-2 border-border bg-bg md:hidden"
            >
              <nav className="gutter space-y-1 py-4" aria-label="Main">
                {NAV_ITEMS.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex min-h-[52px] items-center rounded-md px-4 text-[17px] font-extrabold ${
                        isActive ? 'bg-green-tint text-green-fg' : 'text-ink hover:bg-surface'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
                <NavLink
                  to="/maintainer"
                  className={({ isActive }) =>
                    `flex min-h-[52px] items-center rounded-md px-4 text-[17px] font-extrabold ${
                      isActive ? 'bg-green-tint text-green-fg' : 'text-ink hover:bg-surface'
                    }`
                  }
                >
                  For maintainers
                </NavLink>
              </nav>
              <div className="gutter flex flex-col gap-3 border-t-2 border-border py-4">
                {currentUser ? (
                  <PressableLink to="/app/discover" fullWidth>
                    Open the app
                  </PressableLink>
                ) : (
                  <>
                    <PressableButton fullWidth onClick={() => setAuth('signup')}>
                      Get started
                    </PressableButton>
                    <PressableButton variant="secondary" fullWidth onClick={() => setAuth('signin')}>
                      I have an account
                    </PressableButton>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AuthModal isOpen={auth !== null} mode={auth ?? 'signup'} onClose={() => setAuth(null)} />
    </>
  );
};
