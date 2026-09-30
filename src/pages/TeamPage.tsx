import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Mail } from 'lucide-react';
import { SEO } from '../components/SEO';
import { PageHero, Section } from '../components/marketing/Section';
import { Illustration, PressableLink, Tile, TileLink } from '../components/ui';
import { CONTACT_EMAIL, FOUNDER_GITHUB_URL, GITHUB_REPO_URL, WEBSITE_REPO_URL } from '../lib/links';
import type { IllustrationName } from '../lib/illustrations';
import { inView } from '../lib/motion';

const ways: Array<{ art: IllustrationName; title: string; text: string; href?: string; to?: string }> = [
  { art: 'hammer_and_wrench', title: 'Contribute to the app & backend', text: 'Flutter app, FastAPI service and database migrations.', href: GITHUB_REPO_URL },
  { art: 'laptop', title: 'Contribute to this website', text: 'React + TypeScript + Supabase.', href: WEBSITE_REPO_URL },
  { art: 'test_tube', title: 'Report a bug or suggest a feature', text: 'Open an issue on GitHub.', href: `${GITHUB_REPO_URL}/issues` },
  { art: 'speech_balloon', title: 'Talk to the founder', text: 'Feedback, partnerships or press.', to: '/contact' },
];

export const TeamPage: React.FC = () => (
  <div>
    <SEO
      title="Team"
      description="GitAlong is built in public by Sreevallabh Kakarala (@sreevallabh04). Here is how to contribute or get in touch."
      url="/team"
    />
    <PageHero
      eyebrow="Team"
      title="Who builds GitAlong"
      intro="GitAlong is a small, independent project. There is no big team behind it — just a founder building in public."
      art={<Illustration name="technologist" size={150} priority className="motion-safe:animate-bob" />}
    />

    <Section>
      <div className="mx-auto max-w-4xl space-y-8">
        <motion.div {...inView()}>
          <Tile padding="lg" className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left">
            <img
              src="https://github.com/sreevallabh04.png?size=240"
              alt="Sreevallabh Kakarala's GitHub avatar"
              width={112}
              height={112}
              loading="lazy"
              decoding="async"
              className="h-28 w-28 shrink-0 rounded-full border-4 border-card object-cover shadow-edge-tile"
            />
            <div>
              <h2 className="text-h1 text-ink">Sreevallabh Kakarala</h2>
              <p className="mt-1 type-caption text-green-fg">Founder — design, mobile app, backend and website</p>
              <p className="mt-3 text-body text-ink-muted">
                I started GitAlong because finding people to build with was harder than building. It’s designed, coded and run by me,
                and every part of it — the Flutter app, the FastAPI matching service and this website — is developed in the open.
              </p>
              <PressableLink
                href={FOUNDER_GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="secondary"
                size="sm"
                className="mt-5"
                leadingIcon={<Github strokeWidth={2.5} />}
                trailingIcon={<ExternalLink strokeWidth={2.5} />}
              >
                @sreevallabh04
              </PressableLink>
            </div>
          </Tile>
        </motion.div>

        <motion.div {...inView(1)}>
          <Tile padding="lg" className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Illustration name="seedling" size={72} />
            <div>
              <h2 className="text-h2 text-ink">Building in public</h2>
              <p className="mt-2 text-body text-ink-muted">
                GitAlong is early. The web app and the Android beta are live, iOS is not yet. Features ship when they work — and when
                something isn’t ready, this site says so. If you use GitAlong and something feels off, telling me is the most useful
                thing you can do.
              </p>
            </div>
          </Tile>
        </motion.div>

        <motion.div {...inView(2)}>
          <Tile tone="green" padding="lg">
            <h2 className="text-h2 text-ink">Get involved</h2>
            <p className="mt-2 text-body text-ink">There are no open positions. There are open issues, and contributions are welcome.</p>
            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              {ways.map((w) => {
                const inner = (
                  <span className="flex items-start gap-3">
                    <Illustration name={w.art} size={40} />
                    <span>
                      <span className="block text-h3 text-ink">{w.title}</span>
                      <span className="mt-0.5 block text-body-sm text-ink-muted">{w.text}</span>
                    </span>
                  </span>
                );
                return w.to ? (
                  <TileLink key={w.title} to={w.to} className="h-full" faceClassName="h-full">
                    {inner}
                  </TileLink>
                ) : (
                  <TileLink key={w.title} href={w.href!} target="_blank" rel="noopener noreferrer" className="h-full" faceClassName="h-full">
                    {inner}
                  </TileLink>
                );
              })}
            </div>
            <p className="mt-6 flex flex-wrap items-center gap-2 text-body-sm font-bold text-ink">
              <Mail className="h-4 w-4" strokeWidth={2.5} aria-hidden /> Or email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="link">
                {CONTACT_EMAIL}
              </a>
            </p>
          </Tile>
        </motion.div>
      </div>
    </Section>
  </div>
);
