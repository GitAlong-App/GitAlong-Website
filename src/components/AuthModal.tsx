import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { MascotBubble, Modal, PressableButton } from './ui';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** `signup` (default) greets new people, `signin` welcomes people back. */
  mode?: 'signup' | 'signin';
}

/** Sign-in (spec §7 Login): Octo's greeting, a GitHub PressableButton and a legal caption. */
export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode = 'signup' }) => {
  const { loginWithGitHub } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) setError('');
  }, [isOpen]);

  const handleGithubSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      await loginWithGitHub();
      onClose();
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={isOpen} onClose={onClose} busy={loading} title={mode === 'signin' ? 'Welcome back' : 'Join GitAlong'}>
      <MascotBubble
        size={72}
        text={mode === 'signin' ? 'Good to see you again! Sign in and let’s keep building.' : 'Hi! I’m Octo. Let’s find your people.'}
        className="mb-5"
      />
      {error && (
        <p className="mb-4 rounded-md border-2 border-danger bg-danger-tint p-3 text-body-sm font-bold text-ink" role="alert">
          {error}
        </p>
      )}
      <PressableButton
        variant="ink"
        fullWidth
        size="lg"
        onClick={() => void handleGithubSignIn()}
        loading={loading}
        leadingIcon={<Github strokeWidth={2.5} />}
      >
        Continue with GitHub
      </PressableButton>
      <p className="mt-4 text-center text-[13px] font-semibold leading-relaxed text-ink-muted">
        GitAlong reads your public GitHub profile and repository metadata — never private repos or your code. By continuing you agree to
        how we handle data in our{' '}
        <Link to="/privacy" onClick={onClose} className="link">
          privacy policy
        </Link>
        .
      </p>
    </Modal>
  );
};
