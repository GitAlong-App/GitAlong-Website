import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, LogOut, MessageCircle, Settings, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from './ui/Avatar';
import { EASE_OUT_CUBIC } from '../lib/motion';

/** Avatar button with the account menu (a tile dropdown). */
export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { currentUser, profile, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const onDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen]);

  if (!currentUser) return null;

  const meta = (currentUser.user_metadata ?? {}) as Record<string, string | undefined>;
  const username = profile?.username || meta.user_name || meta.preferred_username || currentUser.email?.split('@')[0] || 'you';
  const name = profile?.name || meta.full_name || meta.name || username;
  const avatar = profile?.avatar_url || meta.avatar_url || null;

  const go = (path: string) => {
    setIsOpen(false);
    navigate(path);
  };

  const handleSignOut = async () => {
    try {
      await logout();
      setIsOpen(false);
      navigate('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Sign out failed.');
    }
  };

  const itemClass =
    'flex w-full min-h-[48px] items-center gap-3 rounded-md px-3 text-left text-body font-bold text-ink transition-colors hover:bg-surface';

  return (
    <div className="relative" ref={menuRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Account menu for ${name}`}
      >
        <Avatar src={avatar} name={name} size={40} className="border-2 border-border" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: EASE_OUT_CUBIC }}
            className="absolute right-0 z-50 mt-2 w-64 rounded-lg border-2 border-border bg-card p-2 shadow-edge-tile"
            role="menu"
            aria-label="Account"
          >
            <div className="flex items-center gap-3 border-b-2 border-border px-2 pb-3 pt-1">
              <Avatar src={avatar} name={name} size={40} />
              <div className="min-w-0">
                <p className="truncate text-body font-extrabold text-ink">{name}</p>
                <p className="truncate text-body-sm text-ink-muted">@{username}</p>
              </div>
            </div>
            <div className="py-1.5">
              <button onClick={() => go('/app/discover')} className={itemClass} role="menuitem">
                <Compass className="h-5 w-5 text-ink-muted" strokeWidth={2.5} aria-hidden /> Discover
              </button>
              <button onClick={() => go('/app/messages')} className={itemClass} role="menuitem">
                <MessageCircle className="h-5 w-5 text-ink-muted" strokeWidth={2.5} aria-hidden /> Messages
              </button>
              <button onClick={() => go('/app/profile')} className={itemClass} role="menuitem">
                <User className="h-5 w-5 text-ink-muted" strokeWidth={2.5} aria-hidden /> Profile
              </button>
              <button onClick={() => go('/app/settings')} className={itemClass} role="menuitem">
                <Settings className="h-5 w-5 text-ink-muted" strokeWidth={2.5} aria-hidden /> Settings
              </button>
            </div>
            <div className="border-t-2 border-border pt-1.5">
              <button
                onClick={() => void handleSignOut()}
                className={`${itemClass} text-danger-fg hover:bg-danger-tint`}
                role="menuitem"
              >
                <LogOut className="h-5 w-5" strokeWidth={2.5} aria-hidden /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
