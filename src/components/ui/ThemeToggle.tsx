import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/** Light/dark switch (48 px). The choice is remembered in this browser. */
export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-surface hover:text-ink ${className}`}
    >
      {dark ? <Sun className="h-5 w-5" strokeWidth={2.5} aria-hidden /> : <Moon className="h-5 w-5" strokeWidth={2.5} aria-hidden />}
    </button>
  );
};
