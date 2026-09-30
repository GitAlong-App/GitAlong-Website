import React from 'react';

/** LevelBadge (spec §3): purple circle with the level number in white 900. */
export interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE = {
  sm: 'h-7 w-7 text-[13px] shadow-[0_2px_0_0_#5B21B6]',
  md: 'h-9 w-9 text-[16px] shadow-[0_3px_0_0_#5B21B6]',
  lg: 'h-14 w-14 text-[24px] shadow-[0_4px_0_0_#5B21B6]',
  xl: 'h-24 w-24 text-[44px] shadow-[0_6px_0_0_#5B21B6]',
} as const;

export const LevelBadge: React.FC<LevelBadgeProps> = ({ level, size = 'md', className = '' }) => (
  <span
    role="img"
    aria-label={`Level ${level}`}
    title={`Level ${level}`}
    className={`inline-flex shrink-0 select-none items-center justify-center rounded-full bg-purple font-black leading-none text-white ${SIZE[size]} ${className}`}
  >
    {level}
  </span>
);
