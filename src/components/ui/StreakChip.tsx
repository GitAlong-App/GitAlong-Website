import React from 'react';
import { Illustration } from './Illustration';
import { useCountUp } from '../../lib/motion';

/** Shared look of the header stat chips (StreakChip, XpChip). */
export const statChipClass =
  'relative inline-flex h-10 select-none items-center gap-1.5 rounded-pill border-2 border-transparent px-2 font-black tabular-nums leading-none tap-transparent';

export const statChipButtonClass =
  "px-2.5 transition-[transform,background-color,border-color] duration-150 hover:border-border hover:bg-surface active:scale-95 before:absolute before:-inset-1 before:content-['']";

/**
 * StreakChip (spec §3): 🔥 `fire.png` 20 px + a bold number in `flame`. Grey
 * (desaturated fire) when not active today — the streak is "at risk".
 * Tapping it opens the StreakSheet.
 */
export interface StreakChipProps {
  days: number;
  activeToday: boolean;
  onClick?: () => void;
  size?: 'md' | 'lg';
  className?: string;
}

export const StreakChip: React.FC<StreakChipProps> = ({ days, activeToday, onClick, size = 'md', className = '' }) => {
  const shown = useCountUp(days);
  const label = `${days}-day streak${activeToday ? '' : ', not active today yet'}`;
  const content = (
    <>
      <Illustration
        name="fire"
        size={size === 'lg' ? 28 : 20}
        className={`transition-[filter,opacity] duration-300 ${activeToday ? '' : 'opacity-60 grayscale'}`}
      />
      <span className={`${size === 'lg' ? 'text-[22px]' : 'text-[18px]'} ${activeToday ? 'text-flame-fg' : 'text-ink-subtle'}`}>
        {shown}
      </span>
    </>
  );

  if (!onClick) {
    return (
      <span role="img" aria-label={label} title={label} className={`${statChipClass} ${className}`}>
        {content}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}. Show streak details`}
      title={label}
      className={`${statChipClass} ${statChipButtonClass} ${className}`}
    >
      {content}
    </button>
  );
};
