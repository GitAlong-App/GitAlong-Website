import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { inView } from '../lib/motion';
import type { IllustrationName } from '../lib/illustrations';
import { Illustration } from './ui';
import { ExampleMatchCard, IntentPickerDemo, SafeChatDemo, StreakDemo, WhyMatchedDemo } from './marketing/Demos';

interface Feature {
  id: string;
  art: IllustrationName;
  eyebrow: string;
  title: string;
  body: string;
  bullets: string[];
  demo: React.ReactNode;
}

const FEATURES: Feature[] = [
  {
    id: 'why',
    art: 'rocket',
    eyebrow: 'Say why you’re here',
    title: 'Start with what you want to build',
    body: 'Co-founder, side-project partner, open-source collaborators, hackathon teammates — or mentoring, either way. Matching starts from intents that fit together.',
    bullets: ['Six collaboration intents', 'A 280-character pitch', 'Mentors meet mentees, co-founders meet co-founders'],
    demo: <IntentPickerDemo />,
  },
  {
    id: 'work',
    art: 'laptop',
    eyebrow: 'Get matched on real work',
    title: 'GitHub is your proof of work',
    body: 'Sign in with GitHub. Public repos, languages, stars and followers are synced from GitHub, so matching looks at what people have actually shipped — not a self-reported skill list.',
    bullets: ['Profiles built from GitHub sign-in', 'Skills you want in a partner rank higher', 'Their GitHub is one tap away on every card'],
    demo: <ExampleMatchCard />,
  },
  {
    id: 'reasons',
    art: 'light_bulb',
    eyebrow: 'Know why you matched',
    title: 'Every match explains itself',
    body: 'Each card spells out up to three reasons in plain words, with a score breakdown if you want the details. No black box.',
    bullets: ['“You’re both looking for a co-founder”', '“Knows TypeScript — a skill you want”', 'Intent fit, skills, shared tech and activity'],
    demo: <WhyMatchedDemo />,
  },
  {
    id: 'streaks',
    art: 'fire',
    eyebrow: 'Build streaks',
    title: 'A little every day adds up',
    body: 'Review ten builders a day to hit your daily goal, keep your streak alive, and earn XP and achievements for real progress — matches, first messages, real conversations.',
    bullets: ['Daily goal: 10 builders', 'Streaks count swipes and messages', 'The same progress on the web and in the app'],
    demo: <StreakDemo />,
  },
  {
    id: 'safety',
    art: 'shield',
    eyebrow: 'Chat safely',
    title: 'Talk when it’s mutual',
    body: 'When you both swipe right, a real-time chat opens on the web and in the Android app, with icebreakers to get you started. You decide who you talk to.',
    bullets: ['Unmatch, block or report from any chat', 'Your email is never shown to others', 'Export or delete your data anytime'],
    demo: <SafeChatDemo />,
  },
];

/** Alternating illustrated feature sections (spec §8). */
export const FeaturesSection: React.FC = () => (
  <section id="features" aria-labelledby="features-title" className="py-16 md:py-24">
    <div className="gutter mx-auto max-w-6xl">
      <motion.div {...inView()} className="mx-auto max-w-2xl text-center">
        <p className="mb-3 type-caption text-green-fg">Why GitAlong</p>
        <h2 id="features-title" className="text-[30px] font-black leading-[1.1] tracking-[-0.5px] text-ink sm:text-[40px]">
          Matching for a reason
        </h2>
        <p className="mt-4 text-[18px] font-semibold leading-relaxed text-ink-muted">
          GitAlong looks at what you want to build, who you need and what you’ve actually shipped.
        </p>
      </motion.div>

      <div className="mt-14 space-y-20 md:mt-20 md:space-y-28">
        {FEATURES.map((f, i) => (
          <div key={f.id} className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
            <motion.div {...inView()} className={i % 2 === 1 ? 'md:order-2' : ''}>
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-lg border-2 border-border bg-card shadow-edge-tile">
                  <Illustration name={f.art} size={36} />
                </span>
                <p className="type-caption text-green-fg">{f.eyebrow}</p>
              </div>
              <h3 className="text-[28px] font-black leading-[1.15] tracking-[-0.25px] text-ink sm:text-[34px]">{f.title}</h3>
              <p className="mt-4 text-[18px] font-semibold leading-relaxed text-ink-muted">{f.body}</p>
              <ul className="mt-6 space-y-3">
                {f.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-3 text-body font-bold text-ink">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green text-white">
                      <Check className="h-3.5 w-3.5" strokeWidth={4} aria-hidden />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div {...inView(1)} className={i % 2 === 1 ? 'md:order-1' : ''}>
              {f.demo}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
