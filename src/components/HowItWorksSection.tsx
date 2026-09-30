import React from 'react';
import { motion } from 'framer-motion';
import { inView } from '../lib/motion';
import type { IllustrationName } from '../lib/illustrations';
import { Illustration } from './ui';

const steps: Array<{ art: IllustrationName; title: string; description: string }> = [
  {
    art: 'key',
    title: 'Sign in with GitHub',
    description: 'Your public profile, repositories, languages and stars become your proof of work. No passwords, no CV.',
  },
  {
    art: 'memo',
    title: 'Say what you’re building',
    description: 'Answer a few quick questions: why you’re here, your pitch, and the skills you want in a partner.',
  },
  {
    art: 'handshake',
    title: 'Swipe, match and chat',
    description: 'Each card shows their pitch and why you matched. When it’s mutual, chat in real time — icebreakers included.',
  },
];

/** How it works (spec §8): 3 steps. */
export const HowItWorksSection: React.FC = () => (
  <section className="border-y-2 border-border bg-surface py-16 md:py-24" id="how-it-works" aria-labelledby="how-title">
    <div className="gutter mx-auto max-w-6xl">
      <motion.div {...inView()} className="mx-auto max-w-2xl text-center">
        <p className="mb-3 type-caption text-green-fg">How it works</p>
        <h2 id="how-title" className="text-[30px] font-black leading-[1.1] tracking-[-0.5px] text-ink sm:text-[40px]">
          From “I need a backend dev” to a conversation
        </h2>
      </motion.div>

      <ol className="mt-12 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <motion.li
            key={step.title}
            {...inView(index)}
            className="relative rounded-xl border-2 border-border bg-card p-6 pt-8 text-center shadow-edge-tile"
          >
            <span className="absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-green text-[18px] font-black text-white shadow-edge-green">
              {index + 1}
            </span>
            <Illustration name={step.art} size={88} className="mx-auto" />
            <h3 className="mt-4 text-h2 text-ink">{step.title}</h3>
            <p className="mt-2 text-body text-ink-muted">{step.description}</p>
          </motion.li>
        ))}
      </ol>
    </div>
  </section>
);
