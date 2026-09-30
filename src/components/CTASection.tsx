import React from 'react';
import { motion } from 'framer-motion';
import { inView } from '../lib/motion';
import { AppStoreButton } from './AppStoreButton';
import { Illustration, PressableButton } from './ui';

interface CTASectionProps {
  onGetStarted: () => void;
}

/** CTA band (spec §8). */
export const CTASection: React.FC<CTASectionProps> = ({ onGetStarted }) => (
  <section className="py-16 md:py-24" aria-labelledby="cta-title">
    <div className="gutter mx-auto max-w-6xl">
      <motion.div
        {...inView()}
        className="relative overflow-hidden rounded-xl border-2 border-green-edge bg-green px-6 py-12 text-center shadow-edge-green sm:px-10 md:py-16"
      >
        <div aria-hidden className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div aria-hidden className="pointer-events-none absolute -bottom-20 -right-10 h-64 w-64 rounded-full bg-white/10" />
        <div className="relative mx-auto flex w-max items-end gap-1">
          <Illustration name="octopus" size={104} className="motion-safe:animate-bob" />
          <Illustration name="waving_hand" size={48} className="mb-8 -rotate-12" />
        </div>
        <h2 id="cta-title" className="relative mt-4 text-[32px] font-black leading-[1.1] tracking-[-0.5px] text-white sm:text-[44px]">
          Who is your project missing?
        </h2>
        <p className="relative mx-auto mt-3 max-w-xl text-[18px] font-bold text-white/90">
          Tell GitAlong what you’re building and who you need. It’s free, and it takes a minute with your GitHub account.
        </p>
        <div className="relative mt-8 flex justify-center">
          <PressableButton variant="inverse" size="lg" onClick={onGetStarted} className="sm:min-w-[260px]">
            Get started
          </PressableButton>
        </div>
        <div className="relative mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <AppStoreButton platform="android" />
          <AppStoreButton platform="ios" />
        </div>
      </motion.div>
    </div>
  </section>
);
