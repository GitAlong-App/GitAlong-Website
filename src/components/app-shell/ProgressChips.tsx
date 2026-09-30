import React, { useState } from 'react';
import { useProgress } from '../../contexts/ProgressContext';
import { LevelBadge, Skeleton, StreakChip, StreakSheet, XpChip } from '../ui';

/**
 * Streak + XP (+ level) chips for the app chrome. Hidden entirely when the
 * progress RPC is unavailable (spec §6: never block the core flows).
 */
export const ProgressChips: React.FC<{ showLevel?: boolean; className?: string }> = ({ showLevel = false, className = '' }) => {
  const { progress, status } = useProgress();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (status === 'loading' && !progress) {
    return (
      <div className={`flex items-center gap-2 ${className}`} aria-hidden>
        <Skeleton className="h-8 w-14" rounded="pill" />
        <Skeleton className="h-8 w-20" rounded="pill" />
      </div>
    );
  }
  if (!progress) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <StreakChip days={progress.streakDays} activeToday={progress.activeToday} onClick={() => setSheetOpen(true)} />
      <XpChip xp={progress.xp} />
      {showLevel && <LevelBadge level={progress.level} size="sm" className="ml-1" />}
      <StreakSheet open={sheetOpen} onClose={() => setSheetOpen(false)} progress={progress} />
    </div>
  );
};
