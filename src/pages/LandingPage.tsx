import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { HeroSection } from '../components/HeroSection';
import { FeaturesSection } from '../components/FeaturesSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { CTASection } from '../components/CTASection';
import { AuthModal } from '../components/AuthModal';
import { SEO } from '../components/SEO';
import { FaqAccordion } from '../components/marketing/FaqAccordion';
import { PressableLink } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { FAQS } from '../lib/faqs';
import { inView } from '../lib/motion';

export const LandingPage: React.FC = () => {
  const [auth, setAuth] = useState<null | 'signup' | 'signin'>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const open = (mode: 'signup' | 'signin') => {
    if (currentUser) navigate('/app/discover');
    else setAuth(mode);
  };

  return (
    <div>
      <SEO url="/" />

      <HeroSection onGetStarted={() => open('signup')} onSignIn={() => open('signin')} />
      <FeaturesSection />
      <HowItWorksSection />

      <section className="py-16 md:py-24" aria-labelledby="faq-title">
        <div className="gutter mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-14">
          <motion.div {...inView()}>
            <p className="mb-3 type-caption text-green-fg">Questions</p>
            <h2 id="faq-title" className="text-[30px] font-black leading-[1.1] tracking-[-0.5px] text-ink sm:text-[40px]">
              Good to know
            </h2>
            <p className="mt-4 text-[18px] font-semibold leading-relaxed text-ink-muted">
              How matching works, what we read from GitHub, and how you stay in control.
            </p>
            <PressableLink to="/faq" variant="secondary" className="mt-6">
              All questions
            </PressableLink>
          </motion.div>
          <motion.div {...inView(1)}>
            <FaqAccordion items={FAQS.slice(0, 6)} defaultOpen={0} />
          </motion.div>
        </div>
      </section>

      <CTASection onGetStarted={() => open('signup')} />

      <AuthModal isOpen={auth !== null} mode={auth ?? 'signup'} onClose={() => setAuth(null)} />
    </div>
  );
};
