import React, { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AppSidebar } from './AppSidebar';
import { AppTopbar } from './AppTopbar';
import { AppBottomNav } from './AppBottomNav';
import { MatchesProvider } from '../../contexts/MatchesContext';
import { ProgressProvider } from '../../contexts/ProgressContext';
import { ProfileSetupProvider } from '../../contexts/ProfileSetupContext';
import { CompleteProfileBanner } from '../CompleteProfileBanner';
import { PageFallback } from '../PageFallback';

/** Signed-in app chrome: sidebar (desktop), top bar, bottom nav (mobile). */
export const AppShell: React.FC = () => {
  // Messages is a full-height, two-pane layout: it sizes itself to the viewport.
  const fullHeight = useLocation().pathname.startsWith('/app/messages');
  return (
    <MatchesProvider>
      <ProgressProvider>
        <ProfileSetupProvider>
          <div className="min-h-screen bg-bg text-ink">
            <a
              href="#app-main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-card focus:px-4 focus:py-3 focus:text-ink"
            >
              Skip to content
            </a>
            <div className="flex min-h-screen">
              <AppSidebar />
              <div className="min-w-0 flex-1">
                <AppTopbar />
                <CompleteProfileBanner />
                <main id="app-main" className={fullHeight ? '' : 'pb-28 md:pb-12'}>
                  <Suspense fallback={<PageFallback />}>
                    <Outlet />
                  </Suspense>
                </main>
              </div>
            </div>
            <AppBottomNav />
          </div>
        </ProfileSetupProvider>
      </ProgressProvider>
    </MatchesProvider>
  );
};
