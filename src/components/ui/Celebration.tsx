import React, { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Confetti } from './Confetti';
import { Illustration } from './Illustration';
import { PressableButton } from './PressableButton';
import type { IllustrationName } from '../../lib/illustrations';
import { EASE_OUT_CUBIC, useCountUp, usePrefersReducedMotion } from '../../lib/motion';
import { useDialog } from '../../lib/useDialog';

/**
 * Celebration (spec §3): full-screen overlay with a confetti burst, a big
 * illustration that scales in elastically, a Display title, an XP counter
 * ticking up and a primary CTA. Reduced motion: no confetti, no elastic
 * motion, a plain cross-fade.
 */
export interface CelebrationProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message?: React.ReactNode;
  illustration?: IllustrationName;
  /** Custom art instead of a single illustration (e.g. two avatars + handshake). */
  art?: React.ReactNode;
  /** XP gained; shows a "+N XP" pill that ticks up. */
  xp?: number;
  primaryLabel: string;
  onPrimary?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  confetti?: boolean;
}

const XpGain: React.FC<{ xp: number }> = ({ xp }) => {
  const shown = useCountUp(xp, 900, 0);
  return (
    <div
      className="mt-5 inline-flex items-center gap-2 rounded-pill border-2 border-gold bg-gold-tint px-4 py-2 shadow-edge-tile-gold"
      aria-label={`Plus ${xp} XP`}
      role="img"
    >
      <Illustration name="high_voltage" size={24} />
      <span className="text-[20px] font-black tabular-nums text-gold-fg">+{shown} XP</span>
    </div>
  );
};

export const Celebration: React.FC<CelebrationProps> = ({
  open,
  onClose,
  title,
  message,
  illustration = 'party_popper',
  art,
  xp,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  confetti = true,
}) => {
  const reduced = usePrefersReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const primaryRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  useDialog(panelRef, open, { onEscape: onSecondary ?? onClose, initialFocus: primaryRef });

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="celebration"
          className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-bg/95 px-5 py-10 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: EASE_OUT_CUBIC }}
        >
          {confetti && <Confetti className="z-[82]" />}
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            className="relative z-[81] flex w-full max-w-md flex-col items-center text-center outline-none"
          >
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.3, rotate: -8 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={reduced ? { duration: 0.2 } : { type: 'spring', stiffness: 260, damping: 11, mass: 0.9 }}
            >
              {art ?? <Illustration name={illustration} size={160} priority />}
            </motion.div>
            <motion.h2
              id={titleId}
              className="mt-6 text-[34px] font-black leading-tight tracking-[-0.5px] text-ink sm:text-[40px]"
              initial={{ opacity: 0, y: reduced ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: reduced ? 0 : 0.15, ease: EASE_OUT_CUBIC }}
            >
              {title}
            </motion.h2>
            {message && (
              <motion.div
                className="mt-2 text-body text-ink-muted"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: reduced ? 0 : 0.25 }}
              >
                {message}
              </motion.div>
            )}
            {typeof xp === 'number' && xp > 0 && <XpGain xp={xp} />}
            <motion.div
              className="mt-8 flex w-full flex-col gap-3"
              initial={{ opacity: 0, y: reduced ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: reduced ? 0 : 0.35, ease: EASE_OUT_CUBIC }}
            >
              <PressableButton ref={primaryRef} fullWidth size="lg" onClick={onPrimary ?? onClose}>
                {primaryLabel}
              </PressableButton>
              {secondaryLabel && (
                <PressableButton fullWidth variant="ghost" onClick={onSecondary ?? onClose}>
                  {secondaryLabel}
                </PressableButton>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};
