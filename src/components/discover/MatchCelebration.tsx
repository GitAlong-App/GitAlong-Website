import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Avatar, Celebration, Illustration } from '../ui';
import { usePrefersReducedMotion } from '../../lib/motion';
import { useProgress } from '../../contexts/ProgressContext';
import { haptics } from '../../lib/haptics';

/**
 * Match (spec §7): a full Celebration with both avatars sliding together,
 * `handshake`, "It's a match!", "+10 XP", SAY HI (primary) and KEEP SWIPING (ghost).
 */
export interface MatchInfo {
  name: string;
  avatarUrl: string | null;
  matchId: string | null;
}

export const MatchCelebration: React.FC<{
  match: MatchInfo | null;
  me: { name: string; avatarUrl: string | null };
  onSayHi: () => void;
  onClose: () => void;
}> = ({ match, me, onSayHi, onClose }) => {
  const reduced = usePrefersReducedMotion();
  const { holdCelebrations } = useProgress();
  const open = !!match;

  // Keep achievement toasts (e.g. "It's a match!") for after this overlay.
  useEffect(() => {
    if (!open) return;
    haptics.match();
    return holdCelebrations();
  }, [open, holdCelebrations]);

  const spring = reduced ? { duration: 0.2 } : { type: 'spring' as const, stiffness: 240, damping: 16 };

  return (
    <Celebration
      open={open}
      onClose={onClose}
      title="It’s a match!"
      message={match ? `You and ${match.name} both want to build together. Say hi while it’s fresh!` : undefined}
      xp={10}
      art={
        <div className="relative flex h-40 w-72 items-center justify-center" aria-hidden>
          <motion.div
            className="absolute"
            initial={reduced ? { opacity: 0, x: -56 } : { opacity: 0, x: -150, rotate: -18 }}
            animate={{ opacity: 1, x: -56, rotate: -6 }}
            transition={spring}
          >
            <Avatar src={me.avatarUrl} name={me.name} size={112} className="border-4 border-card shadow-edge-tile-green" />
          </motion.div>
          <motion.div
            className="absolute"
            initial={reduced ? { opacity: 0, x: 56 } : { opacity: 0, x: 150, rotate: 18 }}
            animate={{ opacity: 1, x: 56, rotate: 6 }}
            transition={spring}
          >
            <Avatar src={match?.avatarUrl} name={match?.name ?? ''} size={112} className="border-4 border-card shadow-edge-tile-green" />
          </motion.div>
          <motion.div
            className="absolute bottom-0 rounded-full border-4 border-card bg-green-tint p-2"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduced ? { duration: 0.2 } : { type: 'spring', stiffness: 380, damping: 12, delay: 0.3 }}
          >
            <Illustration name="handshake" size={56} priority />
          </motion.div>
        </div>
      }
      primaryLabel="Say hi"
      onPrimary={onSayHi}
      secondaryLabel="Keep swiping"
      onSecondary={onClose}
    />
  );
};
