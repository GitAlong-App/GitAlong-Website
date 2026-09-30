import React from 'react';
import { Illustration } from './Illustration';
import { useCountUp } from '../../lib/motion';
import { statChipButtonClass, statChipClass } from './StreakChip';

/** XpChip (spec §3): ⚡ `high_voltage.png` 20 px + "120 XP" in `gold-edge`. Numbers tick up. */
export interface XpChipProps {
  xp: number;
  onClick?: () => void;
  size?: 'md' | 'lg';
  className?: string;
}

export const XpChip: React.FC<XpChipProps> = ({ xp, onClick, size = 'md', className = '' }) => {
  const shown = useCountUp(xp);
  const label = `${xp.toLocaleString()} XP`;
  const content = (
    <>
      <Illustration name="high_voltage" size={size === 'lg' ? 28 : 20} />
      <span className={`${size === 'lg' ? 'text-[22px]' : 'text-[18px]'} text-gold-fg`}>
        {shown.toLocaleString()} <span className="text-[0.78em]">XP</span>
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
    <button type="button" onClick={onClick} aria-label={label} className={`${statChipClass} ${statChipButtonClass} ${className}`}>
      {content}
    </button>
  );
};
