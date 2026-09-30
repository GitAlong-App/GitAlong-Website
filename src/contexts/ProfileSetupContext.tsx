import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ProfileSetupWizard } from '../components/ProfileSetupWizard';

interface ProfileSetupContextValue {
  /** Open the one-question-per-step profile setup. */
  openProfileSetup: () => void;
}

const ProfileSetupContext = createContext<ProfileSetupContextValue>({ openProfileSetup: () => {} });

export const useProfileSetup = (): ProfileSetupContextValue => useContext(ProfileSetupContext);

/** Hosts the guided setup wizard for the signed-in app. */
export const ProfileSetupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const openProfileSetup = useCallback(() => setOpen(true), []);
  const value = useMemo(() => ({ openProfileSetup }), [openProfileSetup]);
  return (
    <ProfileSetupContext.Provider value={value}>
      {children}
      <ProfileSetupWizard open={open} onClose={() => setOpen(false)} />
    </ProfileSetupContext.Provider>
  );
};
