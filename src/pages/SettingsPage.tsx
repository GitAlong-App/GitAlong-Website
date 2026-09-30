import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Info, LogOut, Monitor, Moon, Sun, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { SEO } from '../components/SEO';
import { ProfileEditor } from '../components/ProfileEditor';
import { Illustration, Modal, PressableButton, SegmentedTabs, Switch, Tile } from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { ThemePreference, useTheme } from '../contexts/ThemeContext';
import { supabase } from '../lib/supabase';
import { fadeUp } from '../lib/motion';
import { deleteMyAccount, exportMyData } from '../services/dataService';
import { audioEngine } from '../utils/audio';

type TabId = 'profile' | 'account' | 'preferences';

const tabs: Array<{ value: TabId; label: string }> = [
  { value: 'profile', label: 'Profile' },
  { value: 'account', label: 'Account' },
  { value: 'preferences', label: 'Preferences' },
];

const GroupTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="mb-3 mt-8 type-caption text-ink-muted first:mt-0">{children}</h2>
);

// ─── Account & data ──────────────────────────────────────────────────────────

const AccountTab: React.FC = () => {
  const { currentUser, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmPhrase = profile?.username || 'delete my account';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sign out failed.');
    }
  };

  const handleExport = async () => {
    if (!currentUser) return;
    setExporting(true);
    try {
      const data = await exportMyData(currentUser.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `gitalong-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success('Your data export has downloaded.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not export your data.');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (confirmText.trim() !== confirmPhrase) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteMyAccount();
      // The auth user no longer exists; just drop the local session.
      try {
        await supabase?.auth.signOut({ scope: 'local' });
      } catch {
        // ignore
      }
      setDeleteOpen(false);
      toast.success('Your GitAlong account and data have been deleted.', { duration: 8000 });
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Your account could not be deleted. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div>
      <GroupTitle>Account</GroupTitle>
      <Tile className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Illustration name="key" size={44} />
        <div className="min-w-0 flex-1">
          <h3 className="text-h3 text-ink">Signed in with GitHub</h3>
          <p className="text-body-sm text-ink-muted">
            {profile ? (
              <>
                <span className="font-extrabold text-ink">@{profile.username}</span>
                {profile.email ? <> · {profile.email} (only visible to you)</> : null}
              </>
            ) : (
              currentUser?.email ?? 'GitHub account'
            )}
          </p>
        </div>
        <PressableButton variant="secondary" size="sm" leadingIcon={<LogOut strokeWidth={2.75} />} onClick={() => void handleLogout()}>
          Sign out
        </PressableButton>
      </Tile>

      <GroupTitle>Your data</GroupTitle>
      <Tile className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Illustration name="envelope" size={44} />
        <div className="min-w-0 flex-1">
          <h3 className="text-h3 text-ink">Export your data</h3>
          <p className="text-body-sm text-ink-muted">
            Download a JSON copy of your profile, swipes, matches, messages, saved repositories, blocks and reports.
          </p>
        </div>
        <PressableButton size="sm" leadingIcon={<Download strokeWidth={2.75} />} loading={exporting} onClick={() => void handleExport()}>
          Export data
        </PressableButton>
      </Tile>

      <GroupTitle>Danger zone</GroupTitle>
      <Tile tone="danger" className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Illustration name="collision" size={44} />
        <div className="min-w-0 flex-1">
          <h3 className="text-h3 text-danger-fg">Delete account</h3>
          <p className="text-body-sm text-ink">
            Permanently deletes your GitAlong account: your profile, swipes, matches, messages, saved repositories, blocks and reports.
            This also removes your account from the mobile app. It can’t be undone. Your GitHub account is not affected.
          </p>
        </div>
        <PressableButton
          variant="danger"
          size="sm"
          leadingIcon={<Trash2 strokeWidth={2.75} />}
          onClick={() => {
            setConfirmText('');
            setDeleteError(null);
            setDeleteOpen(true);
          }}
        >
          Delete…
        </PressableButton>
      </Tile>

      <Modal
        open={deleteOpen}
        title="Delete your GitAlong account?"
        onClose={() => setDeleteOpen(false)}
        busy={deleting}
        illustration="collision"
        footer={
          <>
            <PressableButton variant="secondary" size="sm" onClick={() => setDeleteOpen(false)} disabled={deleting}>
              Cancel
            </PressableButton>
            <PressableButton
              variant="danger"
              size="sm"
              onClick={() => void handleDelete()}
              disabled={confirmText.trim() !== confirmPhrase}
              loading={deleting}
            >
              Permanently delete
            </PressableButton>
          </>
        }
      >
        <p className="mb-4">
          All of your GitAlong data will be permanently deleted, including your conversations — they disappear for your matches too.
        </p>
        <label className="block">
          <span className="text-body-sm font-bold text-ink">
            Type <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-ink">{confirmPhrase}</span> to confirm:
          </span>
          <input
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            disabled={deleting}
            className="field mt-2 font-mono"
          />
        </label>
        {deleteError && (
          <p className="mt-3 rounded-md border-2 border-danger bg-danger-tint p-3 text-body-sm font-bold text-ink" role="alert">
            {deleteError}
          </p>
        )}
      </Modal>
    </div>
  );
};

// ─── Preferences (this browser only) ─────────────────────────────────────────

const PreferencesTab: React.FC = () => {
  const [sounds, setSounds] = useState(audioEngine.isEnabled());
  const { preference, setPreference } = useTheme();

  return (
    <div>
      <p className="mb-5 text-body-sm text-ink-muted">These preferences are saved in this browser only.</p>
      <GroupTitle>Appearance</GroupTitle>
      <Tile className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Illustration name="artist_palette" size={44} />
        <div className="min-w-0 flex-1">
          <h3 className="text-h3 text-ink">Theme</h3>
          <p className="text-body-sm text-ink-muted">Follow your device, or pick light or dark.</p>
        </div>
        <SegmentedTabs<ThemePreference>
          kind="radio"
          ariaLabel="Theme"
          value={preference}
          onChange={setPreference}
          options={[
            { value: 'system', label: 'Auto', icon: <Monitor strokeWidth={2.75} /> },
            { value: 'light', label: 'Light', icon: <Sun strokeWidth={2.75} /> },
            { value: 'dark', label: 'Dark', icon: <Moon strokeWidth={2.75} /> },
          ]}
        />
      </Tile>

      <GroupTitle>Sound</GroupTitle>
      <Tile className="flex items-center gap-4">
        <Illustration name="bell" size={44} />
        <div className="min-w-0 flex-1">
          <h3 className="text-h3 text-ink">Interface sounds</h3>
          <p className="text-body-sm text-ink-muted">Soft click and hover sounds on buttons and links.</p>
        </div>
        <Switch
          checked={sounds}
          label="Interface sounds"
          onChange={(v) => {
            audioEngine.setEnabled(v);
            setSounds(v);
          }}
        />
      </Tile>

      <GroupTitle>Notifications</GroupTitle>
      <Tile tone="sky" className="flex gap-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-sky-fg" strokeWidth={2.75} aria-hidden />
        <p className="text-body-sm text-ink">
          The website doesn’t send email or push notifications. New matches and messages show up here in real time, and the Android
          app shows match notifications.
        </p>
      </Tile>
    </div>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────

export const SettingsPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const requested = params.get('tab') as TabId | null;
  const activeTab: TabId = tabs.some((t) => t.value === requested) ? (requested as TabId) : 'profile';

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-5 sm:px-6 md:pt-8">
      <SEO title="Settings – GitAlong" description="Edit your GitAlong profile and manage your account." url="/app/settings" noIndex />

      <SegmentedTabs<TabId>
        ariaLabel="Settings sections"
        value={activeTab}
        onChange={(id) => setParams(id === 'profile' ? {} : { tab: id })}
        options={tabs.map((t) => ({ ...t, controls: 'settings-panel' }))}
        fullWidth
      />

      <motion.div key={activeTab} {...fadeUp()} id="settings-panel" role="tabpanel" aria-label={tabs.find((t) => t.value === activeTab)?.label} className="mt-6">
        <p className="mb-6 text-body text-ink-muted">
          {activeTab === 'profile' && 'What other builders see, and what matching uses. Shared with the mobile app.'}
          {activeTab === 'account' && 'Sign out, download your data, or delete your account.'}
          {activeTab === 'preferences' && 'Small conveniences for this browser.'}
        </p>
        {activeTab === 'profile' && <ProfileEditor />}
        {activeTab === 'account' && <AccountTab />}
        {activeTab === 'preferences' && <PreferencesTab />}
      </motion.div>
    </div>
  );
};
