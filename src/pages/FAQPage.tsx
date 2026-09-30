import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SEO } from '../components/SEO';
import { FAQStructuredData } from '../components/StructuredData';
import { AppStoreButton } from '../components/AppStoreButton';
import { FaqAccordion } from '../components/marketing/FaqAccordion';
import { PageHero, Section } from '../components/marketing/Section';
import { Illustration, Tile } from '../components/ui';
import { FAQS } from '../lib/faqs';
import { inView } from '../lib/motion';

export const FAQPage: React.FC = () => (
  <div>
    <SEO
      title="FAQ"
      description="How GitAlong’s intent-based matching works, what data it uses from GitHub, the Android beta, safety tools and account deletion."
      url="/faq"
    />
    <FAQStructuredData items={FAQS} />

    <PageHero
      eyebrow="Help & FAQ"
      title="Everything you need to know"
      intro="How matching works, what we store, and how to stay in control."
      art={<Illustration name="thinking_face" size={150} priority className="motion-safe:animate-bob" />}
    />

    <Section>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1.4fr_0.6fr]">
        <motion.div {...inView()}>
          <FaqAccordion items={FAQS} defaultOpen={0} />
        </motion.div>
        <div className="space-y-5">
          <Tile>
            <div className="flex items-center gap-3">
              <Illustration name="key" size={36} />
              <h2 className="text-h3 text-ink">GitHub sign-in</h2>
            </div>
            <p className="mt-2 text-body-sm text-ink-muted">You can revoke GitAlong’s access anytime in your GitHub settings → Applications.</p>
          </Tile>
          <Tile>
            <div className="flex items-center gap-3">
              <Illustration name="shield" size={36} />
              <h2 className="text-h3 text-ink">Your data, your call</h2>
            </div>
            <p className="mt-2 text-body-sm text-ink-muted">
              Export or delete your data from Settings. Details in the{' '}
              <Link to="/privacy" className="link">
                privacy policy
              </Link>
              .
            </p>
          </Tile>
          <Tile>
            <div className="flex items-center gap-3">
              <Illustration name="mobile_phone" size={36} />
              <h2 className="text-h3 text-ink">On your phone</h2>
            </div>
            <p className="mb-4 mt-2 text-body-sm text-ink-muted">Android beta now, iOS later.</p>
            <AppStoreButton platform="android" className="w-full" />
          </Tile>
          <Tile tone="sky">
            <p className="text-body-sm font-bold text-ink">
              Still wondering about something?{' '}
              <Link to="/contact" className="link">
                Ask the founder
              </Link>
              .
            </p>
          </Tile>
        </div>
      </div>
    </Section>
  </div>
);
