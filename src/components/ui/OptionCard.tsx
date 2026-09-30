import React, { useEffect, useRef } from 'react';
import { motion, useAnimationControls } from 'framer-motion';
import { Check } from 'lucide-react';
import { Illustration } from './Illustration';
import type { IllustrationName } from '../../lib/illustrations';
import { EASE_OUT_BACK, usePrefersReducedMotion } from '../../lib/motion';
import { haptics } from '../../lib/haptics';

/**
 * OptionCard (spec §3): a selectable tile with a 40–48 px illustration, a title
 * and an optional subtitle. Selected: green border, green-tint fill,
 * green-edge bottom edge, check badge top-right, and a slight bounce.
 */
export interface OptionCardProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  illustration?: IllustrationName;
  selected: boolean;
  onSelect: () => void;
  /** `multi` → checkbox semantics, `single` → radio semantics, `action` → plain button (no check). */
  mode?: 'multi' | 'single' | 'action';
  layout?: 'row' | 'column';
  illustrationSize?: number;
  /** Body-size title for sentence-length options (e.g. icebreakers). */
  compact?: boolean;
  disabled?: boolean;
  className?: string;
}

export const OptionCard: React.FC<OptionCardProps> = ({
  title,
  subtitle,
  illustration,
  selected,
  onSelect,
  mode = 'multi',
  layout = 'row',
  illustrationSize = 44,
  compact = false,
  disabled = false,
  className = '',
}) => {
  const controls = useAnimationControls();
  const reduced = usePrefersReducedMotion();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (selected && !reduced) {
      void controls.start({ scale: [1, 1.03, 1], transition: { duration: 0.3, ease: EASE_OUT_BACK } });
    }
  }, [selected, reduced, controls]);

  const role = mode === 'multi' ? 'checkbox' : mode === 'single' ? 'radio' : undefined;
  const on = mode !== 'action' && selected;

  return (
    <motion.button
      type="button"
      role={role}
      aria-checked={role ? selected : undefined}
      disabled={disabled}
      animate={controls}
      onClick={() => {
        haptics.select();
        onSelect();
      }}
      className={`group relative block w-full select-none rounded-lg pb-[3px] text-left tap-transparent disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <span
        aria-hidden
        className={`absolute inset-x-0 bottom-0 top-[3px] rounded-lg ${on ? 'bg-green-edge' : 'bg-border-strong'}`}
      />
      <span
        className={`relative flex h-full min-h-[56px] rounded-lg border-2 transition-[transform,background-color,border-color] duration-90 ease-out group-active:translate-y-[3px] group-disabled:translate-y-0 ${
          on ? 'border-green bg-green-tint' : 'border-border bg-card group-hover:border-border-strong'
        } ${layout === 'row' ? `items-center gap-3.5 p-3.5 ${mode === 'action' ? 'pr-4' : 'pr-11'}` : 'flex-col items-center gap-2 p-4 pt-5 text-center'}`}
      >
        {illustration && <Illustration name={illustration} size={illustrationSize} />}
        <span className="min-w-0">
          <span className={`block ${compact ? 'text-body font-bold' : 'text-h3'} ${on ? 'text-green-fg' : 'text-ink'}`}>{title}</span>
          {subtitle && <span className="mt-0.5 block text-body-sm text-ink-muted">{subtitle}</span>}
        </span>
        {mode !== 'action' && (
          <span
            aria-hidden
            className={`absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-[transform,opacity] duration-200 ${
              on ? 'scale-100 border-green bg-green text-white opacity-100' : 'scale-90 border-border-strong bg-card opacity-100'
            }`}
          >
            {on && <Check className="h-3.5 w-3.5" strokeWidth={4} />}
          </span>
        )}
      </span>
    </motion.button>
  );
};
