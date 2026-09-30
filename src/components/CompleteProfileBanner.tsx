import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useProfileSetup } from '../contexts/ProfileSetupContext';
import { missingProfileFields } from '../lib/collab';
import { fadeUp } from '../lib/motion';
import { Illustration, PressableButton, PressableLink } from './ui';

const human = (items: string[]) =>
  items.length <= 1 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;

/**
 * Shown in the app shell until the profile has intents, languages and
 * interests (the mobile app's setup gate). Offers the guided setup.
 */
export const CompleteProfileBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { profile, profileError, refreshProfile, profileLoading } = useAuth();
  const { openProfileSetup } = useProfileSetup();
  const location = useLocation();
  const tab = new URLSearchParams(location.search).get('tab') ?? 'profile';
  const onEditor = location.pathname === '/app/settings' && tab === 'profile';

  if (profileError && !profile) {
    return (
      <div className={`mx-4 mt-4 md:mx-8 ${className}`}>
        <div className="flex flex-col gap-3 rounded-lg border-2 border-danger bg-danger-tint p-4 shadow-edge-tile-danger sm:flex-row sm:items-center">
          <Illustration name="thinking_face" size={48} />
          <p className="flex-1 text-body text-ink">
            We couldn’t load your GitAlong profile. <span className="text-ink-muted">({profileError})</span>
          </p>
          <PressableButton variant="secondary" size="sm" onClick={() => void refreshProfile()} loading={profileLoading}>
            Try again
          </PressableButton>
        </div>
      </div>
    );
  }

  const missing = missingProfileFields(profile);
  if (!profile || missing.length === 0 || onEditor) return null;

  return (
    <motion.section
      {...fadeUp()}
      className={`mx-4 mt-4 md:mx-8 ${className}`}
      aria-label="Finish setting up your profile"
    >
      <div className="flex flex-col gap-4 rounded-lg border-2 border-green bg-green-tint p-4 shadow-edge-tile-green sm:flex-row sm:items-center sm:p-5">
        <div className="flex items-center gap-3 sm:flex-1">
          <Illustration name="octopus" size={56} className="motion-safe:animate-bob" />
          <div className="min-w-0">
            <h2 className="text-h3 text-ink">Hi! I’m Octo. Let’s find your people.</h2>
            <p className="text-body-sm text-ink-muted">
              Answer 5 quick questions so I can match you with the right builders.
              <span className="sr-only"> Still missing: {human(missing)}.</span>
            </p>
          </div>
        </div>
        {/* Primary first on phones; on wider screens the ghost link sits to its left. */}
        <div className="flex flex-col gap-1 sm:flex-row-reverse sm:items-center sm:gap-2">
          <PressableButton onClick={openProfileSetup} size="sm">
            Let’s go
          </PressableButton>
          <PressableLink to="/app/settings?tab=profile" variant="ghost" size="sm">
            Edit instead
          </PressableLink>
        </div>
      </div>
    </motion.section>
  );
};
