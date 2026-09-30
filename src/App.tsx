import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { MotionConfig } from 'framer-motion';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { WebsiteStructuredData, OrganizationStructuredData, WebApplicationStructuredData } from './components/StructuredData';
import { ScrollToTop } from './components/ScrollToTop';
import { ProtectedRoute, PublicRoute } from './routes/RouteGuards';
import { PageFallback } from './components/PageFallback';
import { AppToaster } from './components/ui';
import { useAudioInteraction } from './hooks/useAudioInteraction';

// Route-level code splitting: only the landing page ships in the entry chunk.
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then((m) => ({ default: m.PrivacyPage })));
const FAQPage = lazy(() => import('./pages/FAQPage').then((m) => ({ default: m.FAQPage })));
const MaintainerPortal = lazy(() => import('./pages/MaintainerPortal').then((m) => ({ default: m.MaintainerPortal })));
const FeaturesPage = lazy(() => import('./pages/FeaturesPage').then((m) => ({ default: m.FeaturesPage })));
const TeamPage = lazy(() => import('./pages/TeamPage').then((m) => ({ default: m.TeamPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));
const AppShell = lazy(() => import('./components/app-shell/AppShell').then((m) => ({ default: m.AppShell })));
const DiscoverPage = lazy(() => import('./pages/DiscoverPage').then((m) => ({ default: m.DiscoverPage })));
const MessagesPage = lazy(() => import('./pages/MessagesPage').then((m) => ({ default: m.MessagesPage })));
const AppActivityPage = lazy(() => import('./pages/AppActivityPage').then((m) => ({ default: m.AppActivityPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));

const PublicLayout = () => (
  <>
    <Navigation />
    <main id="main">
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </main>
    <Footer />
  </>
);

function App() {
  useAudioInteraction();

  return (
    <HelmetProvider>
      <ThemeProvider>
        <MotionConfig reducedMotion="user">
          <AuthProvider>
            <Router>
              <AppToaster />
              <ScrollToTop />
              <WebsiteStructuredData />
              <OrganizationStructuredData />
              <WebApplicationStructuredData />

              <div className="min-h-screen bg-bg text-ink">
                <Routes>
                  <Route element={<PublicLayout />}>
                    <Route
                      path="/"
                      element={
                        <PublicRoute redirectAuthenticatedTo="/app/discover">
                          <LandingPage />
                        </PublicRoute>
                      }
                    />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/faq" element={<FAQPage />} />
                    <Route path="/features" element={<FeaturesPage />} />
                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/privacy" element={<PrivacyPage />} />
                    <Route path="/maintainer" element={<MaintainerPortal />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>

                  <Route path="/profile" element={<Navigate to="/app/profile" replace />} />
                  <Route path="/discover" element={<Navigate to="/app/discover" replace />} />
                  <Route path="/settings" element={<Navigate to="/app/settings" replace />} />
                  <Route path="/messages" element={<Navigate to="/app/messages" replace />} />

                  <Route
                    path="/app"
                    element={
                      <ProtectedRoute>
                        <Suspense fallback={<PageFallback fullScreen />}>
                          <AppShell />
                        </Suspense>
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<Navigate to="/app/discover" replace />} />
                    <Route path="discover" element={<DiscoverPage />} />
                    <Route path="messages" element={<MessagesPage />} />
                    <Route path="messages/:matchId" element={<MessagesPage />} />
                    <Route path="activity" element={<AppActivityPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="settings" element={<SettingsPage />} />
                  </Route>
                </Routes>
              </div>
            </Router>
          </AuthProvider>
        </MotionConfig>
      </ThemeProvider>
    </HelmetProvider>
  );
}

export default App;
