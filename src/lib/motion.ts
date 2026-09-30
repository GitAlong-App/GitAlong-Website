import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';

type Bezier = [number, number, number, number];

/** Default easing (spec §4): easeOutCubic. */
export const EASE_OUT_CUBIC: Bezier = [0.33, 1, 0.68, 1];
/** Delight easing: easeOutBack — celebrations, selection bounces and the mascot only. */
export const EASE_OUT_BACK: Bezier = [0.34, 1.56, 0.64, 1];

/** Entrance: fade + slide up 12 px, 250 ms, staggered by index (40 ms). */
export const fadeUp = (index = 0) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.25, ease: EASE_OUT_CUBIC, delay: index * 0.04 },
});

/** Same as fadeUp but triggered when scrolled into view. */
export const inView = (index = 0) => ({
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.3, ease: EASE_OUT_CUBIC, delay: index * 0.04 },
});

/** Live `matchMedia` result (false during the first render if unsupported). */
export function useMediaQuery(query: string): boolean {
  const get = () => {
    try {
      return window.matchMedia(query).matches;
    } catch {
      return false;
    }
  };
  const [matches, setMatches] = useState(get);
  useEffect(() => {
    let mql: MediaQueryList;
    try {
      mql = window.matchMedia(query);
    } catch {
      return;
    }
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener?.('change', onChange);
    return () => mql.removeEventListener?.('change', onChange);
  }, [query]);
  return matches;
}

/** True when the OS asks for reduced motion (null-safe wrapper). */
export const usePrefersReducedMotion = (): boolean => useReducedMotion() ?? false;

/**
 * Number that ticks up (or down) to `target` over `duration` ms.
 * Reduced motion: jumps straight to the value.
 */
export function useCountUp(target: number, duration = 700, from?: number): number {
  const reduced = usePrefersReducedMotion();
  const [value, setValue] = useState(from ?? target);
  const valueRef = useRef(value);
  valueRef.current = value;

  useEffect(() => {
    if (reduced || duration <= 0) {
      setValue(target);
      return;
    }
    const start = valueRef.current;
    if (start === target) return;
    let raf = 0;
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(start + (target - start) * eased));
      if (t < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, reduced]);

  return value;
}
