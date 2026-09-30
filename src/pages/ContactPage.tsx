import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { useForm, ValidationError } from '@formspree/react';
import { SEO } from '../components/SEO';
import { AppStoreButton } from '../components/AppStoreButton';
import { PageHero, Section } from '../components/marketing/Section';
import { Celebration, Illustration, PressableButton, Tile } from '../components/ui';
import { CONTACT_EMAIL, GITHUB_REPO_URL } from '../lib/links';
import { inView } from '../lib/motion';

export const ContactPage: React.FC = () => {
  const [state, handleSubmit, reset] = useForm('xwpbjove');
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the fields once Formspree has the message.
  useEffect(() => {
    if (state.succeeded) formRef.current?.reset();
  }, [state.succeeded]);

  return (
    <div>
      <SEO title="Contact" description="Questions, feedback, bug reports or data requests — get in touch with GitAlong." url="/contact" />
      <PageHero
        eyebrow="Contact"
        title="Get in touch"
        intro="Questions, feedback, a bug or a privacy request? Messages go straight to the founder."
        art={<Illustration name="envelope" size={140} priority className="motion-safe:animate-bob" />}
      />

      <Section>
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <motion.div {...inView()}>
            <Tile padding="lg">
              <h2 className="text-h2 text-ink">Send a message</h2>
              <form ref={formRef} onSubmit={handleSubmit} className="mt-5 space-y-5">
                <div>
                  <label htmlFor="name" className="mb-1.5 block type-caption text-ink-muted">
                    Name
                  </label>
                  <input type="text" id="name" name="name" required autoComplete="name" className="field" placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="email" className="mb-1.5 block type-caption text-ink-muted">
                    Email
                  </label>
                  <input type="email" id="email" name="email" required autoComplete="email" className="field" placeholder="you@example.com" />
                  <ValidationError prefix="Email" field="email" errors={state.errors} className="mt-1 block text-body-sm font-bold text-danger-fg" />
                </div>
                <div>
                  <label htmlFor="message" className="mb-1.5 block type-caption text-ink-muted">
                    Message
                  </label>
                  <textarea id="message" name="message" required rows={5} className="field resize-none" placeholder="Your question or feedback…" />
                  <ValidationError prefix="Message" field="message" errors={state.errors} className="mt-1 block text-body-sm font-bold text-danger-fg" />
                </div>
                <PressableButton type="submit" fullWidth loading={state.submitting} leadingIcon={<Send strokeWidth={2.75} />}>
                  {state.submitting ? 'Sending…' : 'Send message'}
                </PressableButton>
                <p className="text-[13px] font-semibold text-ink-muted">
                  The form is delivered via Formspree. See the{' '}
                  <Link to="/privacy" className="link">
                    privacy policy
                  </Link>
                  .
                </p>
              </form>
            </Tile>
          </motion.div>

          <motion.div {...inView(1)} className="space-y-5">
            <h2 className="text-h2 text-ink">Other ways to reach us</h2>
            <Tile className="flex items-start gap-4">
              <Illustration name="envelope" size={44} />
              <div className="min-w-0">
                <h3 className="text-h3 text-ink">Email</h3>
                <a href={`mailto:${CONTACT_EMAIL}`} className="link break-all">
                  {CONTACT_EMAIL}
                </a>
                <p className="mt-1 text-body-sm text-ink-muted">For data or deletion requests, write from the email on your GitHub account.</p>
              </div>
            </Tile>
            <Tile className="flex items-start gap-4">
              <Illustration name="test_tube" size={44} />
              <div>
                <h3 className="text-h3 text-ink">Bugs & feature ideas</h3>
                <a href={`${GITHUB_REPO_URL}/issues`} target="_blank" rel="noopener noreferrer" className="link">
                  Open an issue on GitHub
                </a>
              </div>
            </Tile>
            <Tile className="flex items-start gap-4">
              <Illustration name="mobile_phone" size={44} />
              <div>
                <h3 className="text-h3 text-ink">Get the app</h3>
                <p className="mb-4 text-body-sm text-ink-muted">Android beta now; iOS is coming later.</p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <AppStoreButton platform="android" />
                  <AppStoreButton platform="ios" />
                </div>
              </div>
            </Tile>
            <Tile tone="sky">
              <h3 className="text-h3 text-ink">Quick answers</h3>
              <div className="mt-3 space-y-3 text-body-sm text-ink">
                <p>
                  <strong className="font-extrabold">How does GitAlong work?</strong> Sign in with GitHub, say what you’re building and who
                  you need, and swipe through developers matched on intent, complementary skills and real GitHub work. Each card tells you
                  why you matched.
                </p>
                <p>
                  <strong className="font-extrabold">How do I delete my account?</strong> On the website: Settings → Account → Delete
                  account. You can also delete it from the Android app.
                </p>
                <Link to="/faq" className="link inline-block">
                  More in the FAQ →
                </Link>
              </div>
            </Tile>
          </motion.div>
        </div>
      </Section>

      <Celebration
        open={state.succeeded}
        onClose={reset}
        illustration="envelope"
        title="Message sent!"
        message="Thanks for writing. You’ll get a reply by email."
        primaryLabel="Send another"
        onPrimary={reset}
      />
    </div>
  );
};
