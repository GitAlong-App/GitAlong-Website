import React from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { PageHero } from '../components/marketing/Section';
import { Illustration, Tile } from '../components/ui';
import { CONTACT_EMAIL } from '../lib/links';
import type { IllustrationName } from '../lib/illustrations';

const LAST_UPDATED = 'September 30, 2026';

const Section: React.FC<{ id: string; title: string; art: IllustrationName; children: React.ReactNode }> = ({ id, title, art, children }) => (
  <Tile as="section" padding="lg" aria-labelledby={id} className="scroll-mt-24">
    <div className="mb-4 flex items-center gap-3">
      <Illustration name={art} size={40} />
      <h2 id={id} className="text-h2 text-ink">
        {title}
      </h2>
    </div>
    <div className="space-y-3 text-body leading-relaxed text-ink-muted [&_strong]:text-ink">{children}</div>
  </Tile>
);

const List: React.FC<{ items: React.ReactNode[] }> = ({ items }) => (
  <ul className="space-y-2.5">
    {items.map((item, i) => (
      <li key={i} className="flex gap-3">
        <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-green" aria-hidden />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const Sub: React.FC<{ children: React.ReactNode }> = ({ children }) => <p className="pt-2 font-extrabold text-ink">{children}</p>;

export const PrivacyPage: React.FC = () => (
  <div>
    <SEO
      title="Privacy Policy"
      description="What GitAlong collects (GitHub profile, public repository metadata, your profile, swipes, matches and messages), where it is stored, and how to export or delete it."
      url="/privacy"
      type="article"
      modifiedTime="2026-09-30"
    />
    <PageHero
      eyebrow="Privacy policy"
      title="How GitAlong handles your data"
      intro={`Last updated: ${LAST_UPDATED}`}
      art={<Illustration name="locked" size={140} priority />}
    />

    <div className="gutter mx-auto max-w-3xl space-y-6 py-12 md:py-16">
      <Section id="who" title="Who we are" art="waving_hand">
        <p>
          GitAlong (the website at gitalong.vercel.app and the GitAlong mobile app) is an independent project run by Sreevallabh Kakarala.
          Contact:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="link">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <p>This policy covers both the website and the mobile app, which share one account and one database.</p>
      </Section>

      <Section id="collect" title="What we collect" art="memo">
        <Sub>When you sign in with GitHub (OAuth)</Sub>
        <List
          items={[
            'Your GitHub user ID, username, display name, avatar URL and the email address GitHub shares with us (scopes: read:user and user:email).',
            'Public profile information: bio, location, company, website, followers, following and public repository count.',
            'Metadata about your public repositories: languages, topics and star counts. We do not access private repositories or your code.',
            'We never receive or store your GitHub password. GitAlong’s servers do not store your GitHub access token.',
          ]}
        />
        <Sub>Profile details you add</Sub>
        <List
          items={[
            'Name, bio, location, company, website, languages and interests.',
            'What you are looking for (co-founder, side-project partner, open-source collaborators, hackathon teammates, mentoring), your pitch (up to 280 characters) and the skills you want in a partner.',
          ]}
        />
        <Sub>Activity in GitAlong</Sub>
        <List
          items={[
            'Swipes (like, skip, super like) and the matches they create.',
            'Messages you send and receive, with timestamps and read status.',
            'Repositories you save or skip in project discovery.',
            'Blocks you make and reports you submit (reason and optional details), kept for safety and moderation.',
            'When you were last active, and in-app notifications about new matches.',
            'Streaks, XP, levels and achievements are calculated from this activity when you open the app; they are not stored as separate data about you.',
          ]}
        />
        <Sub>Other</Sub>
        <List
          items={[
            'If you use the contact form, your name, email and message are delivered to us by Formspree.',
            'The website stores your sign-in session and a few preferences in your browser’s local storage — such as interface sounds, light or dark theme, and which level and achievements you have already been congratulated on. We do not use advertising or third-party analytics trackers.',
          ]}
        />
      </Section>

      <Section id="use" title="How we use it" art="gear">
        <List
          items={[
            'To show your profile to other signed-in GitAlong users and to recommend collaborators to you and you to them. Recommendations use your intents, skills, languages, interests, location and GitHub activity, and your swipe history to improve ranking.',
            'To deliver chat messages between matched users.',
            'To keep GitAlong safe: enforcing blocks, reviewing reports and preventing abuse.',
            'To keep your GitHub-derived stats up to date.',
          ]}
        />
        <p>We do not sell your data and do not use it for advertising.</p>
      </Section>

      <Section id="see" title="Who can see what" art="eyes">
        <List
          items={[
            'Other signed-in users can see your public profile: username, name, avatar, bio, location, company, website, GitHub link and stats, languages, interests, what you are looking for, your pitch and the skills you want.',
            'Your email address is never shown to other users.',
            'Your swipes are private. Someone only learns you liked them if they like you back (a match). We may show you how many people have liked you, never who.',
            'Messages are visible only to the two people in the match.',
            'If you block someone, you are hidden from each other and any match between you is removed.',
          ]}
        />
      </Section>

      <Section id="where" title="Where it is stored" art="globe">
        <List
          items={[
            'Your account and all data above are stored in Supabase (database and authentication), protected by row-level security so each user can only read what they are allowed to.',
            'The matching and GitHub-sync service runs on Render and reads the same database.',
            'The website is hosted on Vercel.',
            'Data is encrypted in transit (HTTPS). Messages are not end-to-end encrypted.',
          ]}
        />
      </Section>

      <Section id="rights" title="Your choices and rights" art="shield">
        <List
          items={[
            <>
              <strong>Edit</strong> your profile anytime in{' '}
              <Link to="/app/settings" className="link">
                Settings
              </Link>{' '}
              or in the mobile app.
            </>,
            <>
              <strong>Export</strong> your data as JSON from Settings → Account.
            </>,
            <>
              <strong>Delete</strong> your account from Settings → Account on the website, or in the mobile app. Deletion permanently
              removes your profile, swipes, matches, messages, saved repositories, blocks and reports.
            </>,
            'Revoke GitAlong’s access to your GitHub account at any time in GitHub → Settings → Applications.',
            <>
              For any other request (access, correction, deletion help), email{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="link">
                {CONTACT_EMAIL}
              </a>
              .
            </>,
          ]}
        />
      </Section>

      <Section id="retention" title="Retention" art="hourglass">
        <p>
          We keep your data while your account exists. When you delete your account it is removed from the live database; residual copies
          in our providers’ backups expire according to their backup schedules.
        </p>
      </Section>

      <Section id="children" title="Children" art="seedling">
        <p>GitAlong is not intended for children under 13, and GitHub requires users to be at least 13.</p>
      </Section>

      <Section id="changes" title="Changes" art="bell">
        <p>
          If this policy changes, we will update it here and change the date at the top of this page. Significant changes will also be
          announced on the website.
        </p>
      </Section>
    </div>
  </div>
);
