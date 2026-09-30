import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { EASE_OUT_BACK, EASE_OUT_CUBIC, usePrefersReducedMotion } from '../lib/motion';
import type { IllustrationName } from '../lib/illustrations';
import { Illustration, PressableButton } from './ui';

interface HeroSectionProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

const Orbit: React.FC<{ art: IllustrationName; className: string; delay: number; label: string }> = ({ art, className, delay, label }) => {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.div
      className={`absolute ${className}`}
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={reduced ? { duration: 0.2 } : { duration: 0.5, delay: 0.35 + delay, ease: EASE_OUT_BACK }}
    >
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-card shadow-edge-tile motion-safe:animate-bob sm:h-[72px] sm:w-[72px]"
        style={{ animationDelay: `${delay * 2}s` }}
        title={label}
      >
        <Illustration name={art} size={40} priority />
      </div>
    </motion.div>
  );
};

/** Landing hero (spec §8): Octo, the promise in Display type, GET STARTED / I HAVE AN ACCOUNT. */
export const HeroSection: React.FC<HeroSectionProps> = ({ onGetStarted, onSignIn }) => {
  const reduced = usePrefersReducedMotion();
  return (
    <section className="relative overflow-hidden" aria-labelledby="hero-title">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-full bg-gradient-to-b from-green-tint/50 via-bg to-bg" />
      <div className="gutter relative mx-auto grid max-w-6xl items-center gap-8 pb-16 pt-8 md:grid-cols-[1.1fr_0.9fr] md:gap-12 md:pb-24 md:pt-16">
        <div className="order-2 text-center md:order-1 md:text-left">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT_CUBIC }}
            className="mb-4 inline-flex items-center gap-2 rounded-pill border-2 border-green/40 bg-card px-3 py-1.5 type-caption text-green-fg"
          >
            <Illustration name="sparkles" size={18} priority /> Collaborator matching for developers
          </motion.p>
          <motion.h1
            id="hero-title"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05, ease: EASE_OUT_CUBIC }}
            className="text-[40px] font-black leading-[1.04] tracking-[-0.5px] text-ink sm:text-[54px] lg:text-[64px] lg:tracking-[-1px]"
          >
            Find the developer your project is <span className="text-green-fg">missing.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: EASE_OUT_CUBIC }}
            className="mx-auto mt-5 max-w-xl text-[18px] font-semibold leading-relaxed text-ink-muted md:mx-0 md:text-[20px]"
          >
            Say what you’re building and who you need — a co-founder, contributors, a hackathon team or a mentor. GitAlong matches you
            on real GitHub work and tells you why.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.16, ease: EASE_OUT_CUBIC }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start"
          >
            <PressableButton size="lg" onClick={onGetStarted} className="sm:min-w-[220px]">
              Get started
            </PressableButton>
            <PressableButton size="lg" variant="secondary" onClick={onSignIn} className="sm:min-w-[220px]">
              I have an account
            </PressableButton>
          </motion.div>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-body-sm font-bold text-ink-muted md:justify-start">
            {['Free to use', 'Sign in with GitHub', 'Web app + Android beta'].map((t) => (
              <li key={t} className="flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green text-white">
                  <Check className="h-3 w-3" strokeWidth={4} aria-hidden />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        <div className="relative order-1 mx-auto flex h-[300px] w-[300px] items-center justify-center sm:h-[380px] sm:w-[380px] md:order-2">
          <div aria-hidden className="absolute inset-6 rounded-full bg-green-tint sm:inset-4" />
          <div aria-hidden className="absolute inset-16 rounded-full border-2 border-dashed border-green/30 sm:inset-14" />
          <motion.div
            className="relative"
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.3, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={reduced ? { duration: 0.2 } : { type: 'spring', stiffness: 220, damping: 12, delay: 0.1 }}
          >
            <Illustration name="octopus" size={176} priority alt="Octo, the GitAlong octopus" className="motion-safe:animate-bob sm:!h-[208px] sm:!w-[208px]" />
          </motion.div>
          {/* Static wrapper does the centring; the inner element animates (framer owns its transform). */}
          <div className="absolute -top-1 left-1/2 w-max max-w-[230px] -translate-x-1/2 sm:top-0">
            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.6, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={reduced ? { duration: 0.2 } : { duration: 0.4, delay: 0.55, ease: EASE_OUT_BACK }}
              className="relative rounded-lg border-2 border-border bg-card px-4 py-2.5 text-center text-body-sm font-extrabold text-ink shadow-edge-tile"
            >
              Hi! I’m Octo. Let’s find your people.
              <span aria-hidden className="absolute -bottom-[9px] left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 border-b-2 border-r-2 border-border bg-card" />
            </motion.div>
          </div>
          <Orbit art="rocket" label="Co-founders" className="left-0 top-[38%] sm:left-1" delay={0} />
          <Orbit art="globe" label="Open source" className="right-0 top-[30%] sm:right-1" delay={0.12} />
          <Orbit art="handshake" label="Matches" className="bottom-3 left-[14%]" delay={0.24} />
          <Orbit art="fire" label="Streaks" className="bottom-6 right-[12%]" delay={0.36} />
        </div>
      </div>
    </section>
  );
};
