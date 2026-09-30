import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';
import { Breadcrumbs, BreadcrumbStructuredData } from '../components/Breadcrumbs';
import { AppStoreButton } from '../components/AppStoreButton';
import { PageHero, Section, SectionHeading } from '../components/marketing/Section';
import { Illustration, PressableLink, Tile } from '../components/ui';
import type { IllustrationName } from '../lib/illustrations';
import { inView } from '../lib/motion';

const principles: Array<{ art: IllustrationName; title: string; description: string }> = [
  {
    art: 'rocket',
    title: 'Match for a reason',
    description: 'You say what you want — a co-founder, contributors, a hackathon team, a mentor — and matching starts there.',
  },
  {
    art: 'laptop',
    title: 'Work over words',
    description: 'Profiles are anchored in real GitHub activity, so you can see what someone has actually built.',
  },
  {
    art: 'light_bulb',
    title: 'Explain every match',
    description: 'No black box: each recommendation tells you why it was made.',
  },
];

const steps: Array<{ art: IllustrationName; title: string; description: string }> = [
  { art: 'key', title: 'Connect GitHub', description: 'Sign in with GitHub. Your public repos, languages and stars form your profile.' },
  { art: 'memo', title: 'Say what you need', description: 'Pick your intent, pitch what you’re building and list the skills you want in a partner.' },
  { art: 'handshake', title: 'Match and talk', description: 'Swipe with context, match when it’s mutual, and chat in real time.' },
];

export const AboutPage: React.FC = () => (
  <div>
    <SEO
      title="About"
      description="Why GitAlong exists: finding the right people to build with is harder than building. GitAlong matches developers on intent, complementary skills and real GitHub work."
      url="/about"
    />
    <BreadcrumbStructuredData items={[{ label: 'About', href: '/about' }]} />

    <PageHero
      eyebrow="About GitAlong"
      title="Finding people to build with shouldn’t be harder than building."
      art={<Illustration name="octopus" size={160} priority className="motion-safe:animate-bob" />}
    >
      <Breadcrumbs items={[{ label: 'About', isActive: true }]} className="mt-6 justify-center md:justify-start" />
    </PageHero>

    <Section>
      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <motion.div {...inView()}>
          <p className="mb-3 type-caption text-green-fg">From the founder</p>
          <h2 className="text-[30px] font-black leading-[1.1] text-ink sm:text-[36px]">Why I built it</h2>
          <div className="mt-5 space-y-5 text-[18px] font-semibold leading-relaxed text-ink-muted">
            <p>
              As a computer science student I kept running into the same wall: I had ideas, but finding people to build them with was
              hard. Classmates were busy, friends weren’t into coding, and cold-messaging developers on GitHub felt awkward and rarely
              worked.
            </p>
            <p>
              The first version of GitAlong was “swipe on developers who use the same languages as you”. It turned out that similarity
              isn’t what makes a good collaborator — a project needs people who want the same thing and bring the skills it’s missing.
            </p>
            <p>
              So GitAlong now asks why you’re here and what you’re building, matches you with people whose goals fit and whose GitHub
              work shows the skills you need, and tells you why each match was made.
            </p>
          </div>
          <p className="mt-6 text-body font-bold text-ink">
            — Sreevallabh Kakarala,{' '}
            <Link to="/team" className="link">
              founder
            </Link>
          </p>
        </motion.div>

        <motion.div {...inView(1)}>
          <Tile tone="green" padding="lg">
            <Illustration name="globe" size={64} />
            <h3 className="mt-4 text-h2 text-ink">The mission</h3>
            <p className="mt-2 text-body text-ink">
              Help every developer find the people their project is missing — whether that’s a co-founder, contributors, a hackathon team
              or a mentor — regardless of who they already know.
            </p>
          </Tile>
        </motion.div>
      </div>
    </Section>

    <Section className="border-y-2 border-border bg-surface">
      <SectionHeading eyebrow="What we believe" title="Principles" />
      <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
        {principles.map(({ art, title, description }, index) => (
          <motion.div key={title} {...inView(index)}>
            <Tile padding="lg" className="h-full text-center">
              <Illustration name={art} size={72} className="mx-auto" />
              <h3 className="mt-4 text-h2 text-ink">{title}</h3>
              <p className="mt-2 text-body text-ink-muted">{description}</p>
            </Tile>
          </motion.div>
        ))}
      </div>
    </Section>

    <Section>
      <SectionHeading eyebrow="How it works" title="Three steps to your people" />
      <ol className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {steps.map(({ art, title, description }, index) => (
          <motion.li key={title} {...inView(index)} className="relative rounded-xl border-2 border-border bg-card p-6 pt-8 text-center shadow-edge-tile">
            <span className="absolute -top-5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-green text-[18px] font-black text-white shadow-edge-green">
              {index + 1}
            </span>
            <Illustration name={art} size={72} className="mx-auto" />
            <h3 className="mt-4 text-h2 text-ink">{title}</h3>
            <p className="mt-2 text-body text-ink-muted">{description}</p>
          </motion.li>
        ))}
      </ol>
    </Section>

    <Section className="border-t-2 border-border bg-surface">
      <motion.div {...inView()} className="mx-auto max-w-2xl text-center">
        <Illustration name="waving_hand" size={72} className="mx-auto" />
        <h2 className="mt-4 text-[30px] font-black leading-[1.1] text-ink sm:text-[36px]">Try it</h2>
        <p className="mt-3 text-[18px] font-semibold text-ink-muted">Use GitAlong on the web right now, or grab the Android beta.</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <PressableLink to="/">Get started on the web</PressableLink>
          <AppStoreButton platform="android" />
          <AppStoreButton platform="ios" />
        </div>
      </motion.div>
    </Section>
  </div>
);
