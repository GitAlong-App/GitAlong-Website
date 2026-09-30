import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Linkedin, Mail, Twitter } from 'lucide-react';
import { AppStoreButton } from './AppStoreButton';
import { Wordmark } from './Wordmark';
import { CONTACT_EMAIL, FOUNDER_GITHUB_URL, GITHUB_REPO_URL } from '../lib/links';

const linkClass =
  'inline-flex min-h-[48px] items-center gap-2 rounded-md text-body font-bold text-ink-muted transition-colors hover:text-green-fg';

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-2 border-border bg-surface">
      <div className="gutter mx-auto max-w-6xl py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Wordmark />
            <p className="mt-3 max-w-md text-body text-ink-muted">
              Find the developer your project is missing — co-founders, contributors, hackathon teammates and mentors, matched on real
              GitHub work.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <AppStoreButton platform="android" />
              <AppStoreButton platform="ios" />
            </div>
          </div>

          <nav aria-label="Product">
            <h2 className="mb-3 type-caption text-ink">Product</h2>
            <ul className="space-y-1">
              <li><Link to="/features" className={linkClass}>Features</Link></li>
              <li><Link to="/faq" className={linkClass}>FAQ</Link></li>
              <li><Link to="/maintainer" className={linkClass}>For maintainers</Link></li>
              <li><Link to="/about" className={linkClass}>About</Link></li>
              <li><Link to="/team" className={linkClass}>Team</Link></li>
              <li><Link to="/privacy" className={linkClass}>Privacy policy</Link></li>
            </ul>
          </nav>

          <nav aria-label="Connect">
            <h2 className="mb-3 type-caption text-ink">Connect</h2>
            <ul className="space-y-1">
              <li>
                <a href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <Github className="h-4 w-4" strokeWidth={2.5} aria-hidden /> Source on GitHub
                </a>
              </li>
              <li>
                <a href={FOUNDER_GITHUB_URL} target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <Github className="h-4 w-4" strokeWidth={2.5} aria-hidden /> @sreevallabh04
                </a>
              </li>
              <li>
                <a href="https://x.com/gothamjest" target="_blank" rel="noopener noreferrer" className={linkClass}>
                  <Twitter className="h-4 w-4" strokeWidth={2.5} aria-hidden /> X / Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/sreevallabh-kakarala-52ab8a248/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkClass}
                >
                  <Linkedin className="h-4 w-4" strokeWidth={2.5} aria-hidden /> LinkedIn
                </a>
              </li>
              <li>
                <Link to="/contact" className={linkClass}>
                  <Mail className="h-4 w-4" strokeWidth={2.5} aria-hidden /> Contact
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t-2 border-border pt-6 text-body-sm text-ink-muted md:flex-row md:items-center md:justify-between">
          <p>© {year} GitAlong. Built by Sreevallabh Kakarala.</p>
          <p>
            Questions or data requests:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="link">
              {CONTACT_EMAIL}
            </a>
          </p>
        </div>
        <p className="mt-3 text-[13px] font-semibold text-ink-subtle">
          3D illustrations: Fluent Emoji by Microsoft, MIT licence (
          <a href="/illustrations/LICENSE-fluentui-emoji.txt" className="underline underline-offset-2 hover:text-ink-muted">
            licence text
          </a>
          ). Fonts: Nunito and JetBrains Mono (SIL OFL).
        </p>
      </div>
    </footer>
  );
};
