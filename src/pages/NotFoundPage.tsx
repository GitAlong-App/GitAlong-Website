import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SEO } from '../components/SEO';
import { MascotBubble, PressableButton, PressableLink } from '../components/ui';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="gutter mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center py-16">
      <SEO title="Page not found" noIndex />
      <p className="text-[88px] font-black leading-none tracking-[-2px] text-green-fg">404</p>
      <h1 className="mt-2 text-h1 text-ink">This page swam away</h1>
      <MascotBubble
        className="mt-8"
        size={88}
        text="Hmm, I looked in every corner of the reef and couldn’t find it. Let’s get you back on track!"
      />
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <PressableLink to="/">Go home</PressableLink>
        <PressableButton variant="secondary" onClick={() => navigate(-1)} leadingIcon={<ArrowLeft strokeWidth={2.75} />}>
          Go back
        </PressableButton>
      </div>
    </div>
  );
};
