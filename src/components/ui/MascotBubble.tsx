import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Illustration } from './Illustration';
import type { IllustrationName } from '../../lib/illustrations';
import { EASE_OUT_BACK, usePrefersReducedMotion } from '../../lib/motion';

/**
 * MascotBubble (spec §3): Octo (72–96 px) beside a speech bubble (tile style,
 * tail pointing at Octo). The text types on quickly (≤ 600 ms). Screen readers
 * get the full text at once.
 */
export interface MascotBubbleProps {
  text: string;
  size?: number;
  illustration?: IllustrationName;
  /** Where Octo sits relative to the bubble. */
  side?: 'left' | 'right';
  typing?: boolean;
  /** Extra content under the text (buttons, links). */
  children?: React.ReactNode;
  /** Gentle idle bob. */
  bob?: boolean;
  priority?: boolean;
  className?: string;
  bubbleClassName?: string;
}

export const MascotBubble: React.FC<MascotBubbleProps> = ({
  text,
  size = 80,
  illustration = 'octopus',
  side = 'left',
  typing = true,
  children,
  bob = true,
  priority = false,
  className = '',
  bubbleClassName = '',
}) => {
  const reduced = usePrefersReducedMotion();
  const animate = typing && !reduced;
  const [count, setCount] = useState(animate ? 0 : text.length);

  useEffect(() => {
    if (!animate) {
      setCount(text.length);
      return;
    }
    setCount(0);
    const total = Math.min(600, Math.max(250, text.length * 14));
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / total);
      setCount(Math.ceil(text.length * t));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [text, animate]);

  const tail =
    side === 'left'
      ? '-left-[9px] border-b-2 border-l-2'
      : '-right-[9px] border-r-2 border-t-2';

  return (
    <div className={`flex items-end gap-3 ${side === 'right' ? 'flex-row-reverse' : ''} ${className}`}>
      <motion.div
        initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={reduced ? { duration: 0.2 } : { duration: 0.5, ease: EASE_OUT_BACK }}
        className="shrink-0"
      >
        <Illustration name={illustration} size={size} priority={priority} className={bob && !reduced ? 'animate-bob' : ''} />
      </motion.div>
      <div
        className={`relative mb-3 min-w-0 flex-1 rounded-lg border-2 border-border bg-card px-4 py-3 shadow-edge-tile ${bubbleClassName}`}
      >
        <span aria-hidden className={`absolute bottom-5 h-4 w-4 rotate-45 border-border bg-card ${tail}`} />
        <p className="relative text-body text-ink">
          <span className="sr-only">{text}</span>
          <span aria-hidden>
            {text.slice(0, count)}
            <span className="invisible">{text.slice(count)}</span>
          </span>
        </p>
        {children && <div className="relative mt-3">{children}</div>}
      </div>
    </div>
  );
};
