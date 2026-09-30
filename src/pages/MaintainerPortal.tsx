import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';
import { SEO } from '../components/SEO';
import { PageHero, Section } from '../components/marketing/Section';
import { Illustration, PressableButton, Tile } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import type { IllustrationName } from '../lib/illustrations';
import { inView } from '../lib/motion';

const steps: Array<{ art: IllustrationName; title: string; text: string }> = [
  {
    art: 'globe',
    title: 'Choose “Open-source collaborators”',
    text: 'In your GitAlong profile, set what you’re looking for. Developers who want to contribute to open source pick the same intent, so you rank high for each other.',
  },
  {
    art: 'memo',
    title: 'Pitch your project',
    text: 'Use your 280-character pitch to name the project and the help you need (“Looking for a Rust dev to own our CLI”). It appears on your card and in chats.',
  },
  {
    art: 'puzzle_piece',
    title: 'List the skills you need',
    text: 'Add them under “Skills you want in a partner”. People who know them get a boost and see “Looking for Rust, which you know”.',
  },
  {
    art: 'handshake',
    title: 'Match and onboard',
    text: 'When a contributor swipes right on you too, you can chat right away and point them to good first issues.',
  },
];

export const MaintainerPortal: React.FC = () => {
  const { currentUser, loginWithGitHub } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const start = async () => {
    if (currentUser) {
      navigate('/app/settings?tab=profile');
      return;
    }
    try {
      setError(null);
      setBusy(true);
      await loginWithGitHub();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <SEO
        title="For open-source maintainers"
        description="Use GitAlong to find contributors for your open-source project: set your intent, pitch the project and list the skills you need."
        url="/maintainer"
      />
      <PageHero
        eyebrow="For maintainers"
        title="Find contributors for your project"
        intro="There’s no separate maintainer account — maintainers use the same profile as everyone else. Here’s how to set it up so the right contributors find you."
        art={<Illustration name="globe" size={140} priority className="motion-safe:animate-bob" />}
      />

      <Section>
        <ol className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          {steps.map(({ art, title, text }, i) => (
            <motion.li key={title} {...inView(i % 2)}>
              <Tile padding="lg" className="h-full">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green text-[16px] font-black text-white shadow-edge-green">
                    {i + 1}
                  </span>
                  <Illustration name={art} size={40} />
                </div>
                <h2 className="mt-4 text-h2 text-ink">{title}</h2>
                <p className="mt-2 text-body text-ink-muted">{text}</p>
              </Tile>
            </motion.li>
          ))}
        </ol>

        <div className="mx-auto mt-12 max-w-xl text-center">
          <PressableButton
            size="lg"
            variant={currentUser ? 'primary' : 'ink'}
            onClick={() => void start()}
            loading={busy}
            leadingIcon={currentUser ? undefined : <Github strokeWidth={2.5} />}
          >
            {currentUser ? 'Set up my profile' : 'Sign in with GitHub'}
          </PressableButton>
          {error && (
            <p className="mt-4 rounded-md border-2 border-danger bg-danger-tint p-3 text-body-sm font-bold text-ink" role="alert">
              {error}
            </p>
          )}
          <p className="mt-6 text-body-sm text-ink-muted">
            Maintainer-specific tools (project pages, contributor dashboards) don’t exist yet. If you’d use them,{' '}
            <Link to="/contact" className="link">
              tell us what you need
            </Link>
            .
          </p>
        </div>
      </Section>
    </div>
  );
};
