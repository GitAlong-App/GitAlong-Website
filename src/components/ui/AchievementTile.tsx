import React from 'react';
import { Illustration } from './Illustration';
import type { AchievementDef } from '../../lib/achievements';

/**
 * AchievementTile (spec §3): illustration 56 px, title, description. Locked:
 * grayscale, 40% opacity, 🔒 overlay. New unlock: gold glow ring + a shimmer once.
 */
export interface AchievementTileProps {
  achievement: AchievementDef;
  unlocked: boolean;
  /** Just unlocked: gold ring and one shimmer pass. */
  isNew?: boolean;
  className?: string;
}

export const AchievementTile: React.FC<AchievementTileProps> = ({ achievement, unlocked, isNew = false, className = '' }) => (
  <div
    role="group"
    aria-label={`${achievement.title}, ${unlocked ? 'unlocked' : 'locked'}. ${achievement.description}`}
    className={`relative flex h-full flex-col items-center overflow-hidden rounded-lg border-2 p-4 text-center ${
      unlocked ? 'border-border bg-card shadow-edge-tile' : 'border-border bg-surface'
    } ${isNew ? 'ring-4 ring-gold/60 ring-offset-2 ring-offset-bg' : ''} ${className}`}
  >
    <div className="relative">
      <Illustration name={achievement.art} size={56} className={unlocked ? '' : 'opacity-40 grayscale'} />
      {!unlocked && (
        <Illustration name="locked" size={24} className="absolute -bottom-1 -right-2 drop-shadow-sm" />
      )}
    </div>
    <p className={`mt-2 text-[15px] font-extrabold leading-tight ${unlocked ? 'text-ink' : 'text-ink-muted'}`}>
      {achievement.title}
    </p>
    <p className="mt-1 text-[13px] font-semibold leading-snug text-ink-muted">{achievement.description}</p>
    {isNew && (
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2 animate-shine-once bg-gradient-to-r from-transparent via-white/60 to-transparent dark:via-white/20"
      />
    )}
  </div>
);
