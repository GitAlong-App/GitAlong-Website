import React from 'react';
import { Link } from 'react-router-dom';
import { Illustration } from './ui/Illustration';

/** Octo + "GitAlong" in green 900. */
export const Wordmark: React.FC<{ to?: string; size?: 'sm' | 'md' | 'lg'; className?: string; priority?: boolean }> = ({
  to = '/',
  size = 'md',
  className = '',
  priority = false,
}) => {
  const art = size === 'lg' ? 48 : size === 'sm' ? 32 : 40;
  const text = size === 'lg' ? 'text-[30px]' : size === 'sm' ? 'text-[22px]' : 'text-[26px]';
  return (
    <Link
      to={to}
      className={`group inline-flex min-h-[48px] items-center gap-2 rounded-md pr-1 ${className}`}
      aria-label="GitAlong home"
    >
      <Illustration
        name="octopus"
        size={art}
        priority={priority}
        className="transition-transform duration-300 ease-out-back group-hover:-rotate-6 group-hover:scale-110"
      />
      <span className={`${text} font-black leading-none tracking-[-0.5px] text-green-fg`}>GitAlong</span>
    </Link>
  );
};
