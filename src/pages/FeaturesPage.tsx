import React from 'react';
import { motion } from 'framer-motion';
import { Check, Minus } from 'lucide-react';
import { SEO } from '../components/SEO';
import { AppStoreButton } from '../components/AppStoreButton';
import { PageHero, Section, SectionHeading } from '../components/marketing/Section';
import { Chip, Illustration, Tile } from '../components/ui';
import { INTENTS, INTENT_LABELS } from '../lib/collab';
import { INTENT_ART, type IllustrationName } from '../lib/illustrations';
import { inView } from '../lib/motion';

const features: Array<{ art: IllustrationName; title: string; description: string; details: string[] }> = [
  {
    art: 'rocket',
    title: 'Intent-based matching',
    description: 'Tell GitAlong why you’re here. Compatible intents rank first: co-founders with co-founders, mentors with mentees.',
    details: ['Six collaboration intents', '280-character project pitch', 'Filter Discover by what people are looking for'],
  },
  {
    art: 'light_bulb',
    title: 'Why you matched',
    description: 'Up to three plain-language reasons on every recommendation, with a score breakdown if you want the details.',
    details: ['“You’re both looking for a co-founder”', '“Knows TypeScript — a skill you want”', 'Intent fit, skills, activity and more'],
  },
  {
    art: 'laptop',
    title: 'GitHub proof of work',
    description: 'Profiles are built from GitHub sign-in and kept in sync with public repository data.',
    details: ['Languages and topics from public repos', 'Stars, repos and followers', 'Link to their GitHub on every card'],
  },
  {
    art: 'puzzle_piece',
    title: 'Complementary skills',
    description: 'List the skills you want in a partner. People who have them get a boost — and so do you, for people who need yours.',
    details: ['“Skills you want” on your profile', 'Highlighted on candidate cards', 'Works in both directions'],
  },
  {
    art: 'fire',
    title: 'Streaks, XP and achievements',
    description: 'A daily goal of ten builders, streaks for showing up, and achievements for real milestones like your first match.',
    details: ['Daily goal and streak', 'XP and levels from real activity', 'Ten achievements to unlock'],
  },
  {
    art: 'speech_balloon',
    title: 'Real-time chat',
    description: 'Mutual right-swipes open a chat that syncs in real time between the website and the Android app.',
    details: ['Unread badges', 'Icebreaker suggestions for new matches', 'Code-friendly: messages are kept verbatim'],
  },
  {
    art: 'shield',
    title: 'Safety and privacy',
    description: 'You decide who you talk to, and your contact details stay private.',
    details: ['Unmatch, block and report', 'Email never shown to other users', 'Export or delete your data anytime'],
  },
];

const platformRows: Array<[string, boolean, boolean]> = [
  ['Intent-based recommendations with reasons', true, true],
  ['Edit profile, intents, pitch and skills', true, true],
  ['Real-time chat, unmatch, block, report', true, true],
  ['Trending-repository discovery', true, false],
  ['Account deletion', true, true],
];

const Yes = () => (
  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-green text-white" role="img" aria-label="Yes">
    <Check className="h-4 w-4" strokeWidth={4} aria-hidden />
  </span>
);
const No = () => (
  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-surface text-ink-subtle" role="img" aria-label="No">
    <Minus className="h-4 w-4" strokeWidth={4} aria-hidden />
  </span>
);

export const FeaturesPage: React.FC = () => (
  <div>
    <SEO
      title="Features"
      description="Intent-based matching, match explanations, GitHub proof of work, complementary skills, real-time chat and safety tools — on the web and Android."
      url="/features"
    />
    <PageHero
      eyebrow="Features"
      title={
        <>
          Built to find the <span className="text-green-fg">right</span> collaborator
        </>
      }
      intro="Everything here works today on the website, and the core of it in the Android beta."
      art={<Illustration name="hammer_and_wrench" size={150} priority className="motion-safe:animate-bob" />}
    >
      <div className="mt-6 flex flex-wrap justify-center gap-2 md:justify-start">
        {INTENTS.map((intent) => (
          <Chip key={intent} illustration={INTENT_ART[intent]}>
            {INTENT_LABELS[intent]}
          </Chip>
        ))}
      </div>
    </PageHero>

    <Section>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {features.map(({ art, title, description, details }, index) => (
          <motion.div key={title} {...inView(index % 3)}>
            <Tile padding="lg" className="h-full">
              <Illustration name={art} size={56} />
              <h2 className="mt-4 text-h2 text-ink">{title}</h2>
              <p className="mt-2 text-body text-ink-muted">{description}</p>
              <ul className="mt-4 space-y-2">
                {details.map((detail) => (
                  <li key={detail} className="flex items-start gap-2.5 text-body-sm font-bold text-ink">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-tint text-green-fg">
                      <Check className="h-3 w-3" strokeWidth={4} aria-hidden />
                    </span>
                    {detail}
                  </li>
                ))}
              </ul>
            </Tile>
          </motion.div>
        ))}
      </div>
    </Section>

    <Section className="border-t-2 border-border bg-surface">
      <SectionHeading eyebrow="Platforms" title="Where it runs" intro="The web app is live, the Android app is in beta, and iOS is coming later." />
      <motion.div {...inView()} className="mx-auto mt-10 max-w-3xl">
        <Tile padding="none" className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="border-b-2 border-border">
                <th scope="col" className="px-5 py-4 type-caption text-ink-muted">Feature</th>
                <th scope="col" className="px-3 py-4 text-center type-caption text-ink-muted">Web</th>
                <th scope="col" className="px-3 py-4 text-center type-caption text-ink-muted">Android beta</th>
                <th scope="col" className="px-5 py-4 text-center type-caption text-ink-muted">iOS</th>
              </tr>
            </thead>
            <tbody>
              {platformRows.map(([label, web, android]) => (
                <tr key={label} className="border-b-2 border-border last:border-0">
                  <th scope="row" className="px-5 py-4 text-body font-bold text-ink">{label}</th>
                  <td className="px-3 py-4 text-center">{web ? <Yes /> : <No />}</td>
                  <td className="px-3 py-4 text-center">{android ? <Yes /> : <No />}</td>
                  <td className="px-5 py-4 text-center text-body-sm font-bold text-ink-subtle">Coming soon</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tile>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <AppStoreButton platform="android" />
          <AppStoreButton platform="ios" />
        </div>
      </motion.div>
    </Section>
  </div>
);
