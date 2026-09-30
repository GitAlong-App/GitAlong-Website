import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Ban, ExternalLink, Flag, Github, MoreVertical, RefreshCw, Send, UserX } from 'lucide-react';
import toast from 'react-hot-toast';
import { SEO } from '../components/SEO';
import { IntentChips } from '../components/IntentChips';
import {
  Avatar,
  CircleActionButton,
  ConfirmDialog,
  EmptyState,
  Illustration,
  Modal,
  OptionCard,
  PressableButton,
  PressableLink,
  Skeleton,
  SkeletonRow,
  LoadingLabel,
} from '../components/ui';
import { useAuth } from '../contexts/AuthContext';
import { MatchWithProfile, useMatches } from '../contexts/MatchesContext';
import { useProgress } from '../contexts/ProgressContext';
import { supabase } from '../lib/supabase';
import { MessageRow, displayName } from '../lib/types';
import { MESSAGE_MAX, REPORT_DETAILS_MAX, REPORT_REASONS, REPORT_REASON_LABELS, ReportReason, buildIcebreakers } from '../lib/collab';
import { formatRelativeTime } from '../lib/format';
import { EASE_OUT_CUBIC } from '../lib/motion';
import { blockUser, listMessages, markMatchRead, reportUser, sendMessage, unmatch } from '../services/dataService';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const dayKey = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (dayKey(iso) === dayKey(today.toISOString())) return 'Today';
  if (dayKey(iso) === dayKey(yesterday.toISOString())) return 'Yesterday';
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  });
};

const timeLabel = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '' : d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
};

// ─── Conversation list ───────────────────────────────────────────────────────

const ConversationTile: React.FC<{ match: MatchWithProfile; me: string }> = ({ match, me }) => {
  const name = displayName(match.other);
  const preview = match.last_message
    ? `${match.last_message_sender_id === me ? 'You: ' : ''}${match.last_message}`
    : 'New match — say hi!';

  return (
    <NavLink
      to={`/app/messages/${match.id}`}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-lg border-2 p-3 transition-colors ${
          isActive ? 'border-green bg-green-tint shadow-edge-tile-green' : 'border-border bg-card shadow-edge-tile hover:border-border-strong'
        }`
      }
    >
      <Avatar src={match.other?.avatar_url} name={name} size={48} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={`truncate text-body ${match.unread ? 'font-black text-ink' : 'font-extrabold text-ink'}`}>{name}</span>
          <span className="shrink-0 text-[12px] font-bold text-ink-subtle">
            {formatRelativeTime(match.last_message_at || match.matched_at)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-2">
          <p className={`min-w-0 flex-1 truncate text-body-sm ${match.unread ? 'font-bold text-ink' : 'text-ink-muted'}`}>{preview}</p>
          {match.unread && (
            <span className="shrink-0 rounded-pill bg-danger px-2 py-0.5 text-[11px] font-black uppercase tracking-[0.6px] text-white">
              New<span className="sr-only"> message</span>
            </span>
          )}
        </div>
      </div>
    </NavLink>
  );
};

const NewMatchBubble: React.FC<{ match: MatchWithProfile; active: boolean }> = ({ match, active }) => {
  const name = displayName(match.other);
  return (
    <Link
      to={`/app/messages/${match.id}`}
      className="group flex w-[76px] shrink-0 flex-col items-center gap-1.5 rounded-md py-1"
      aria-label={`New match: ${name}. Say hi`}
      aria-current={active ? 'page' : undefined}
    >
      <span className="transition-transform duration-200 group-hover:scale-105 group-active:scale-95">
        <Avatar src={match.other?.avatar_url} name={name} size={56} ring />
      </span>
      <span className="w-full truncate text-center text-[12px] font-extrabold text-ink">{name.split(' ')[0]}</span>
    </Link>
  );
};

// ─── Report dialog ───────────────────────────────────────────────────────────

const ReportDialog: React.FC<{
  open: boolean;
  name: string;
  busy: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details: string, alsoBlock: boolean) => void;
}> = ({ open, name, busy, onClose, onSubmit }) => {
  const [reason, setReason] = useState<ReportReason | null>(null);
  const [details, setDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true);

  useEffect(() => {
    if (open) {
      setReason(null);
      setDetails('');
      setAlsoBlock(true);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      title={`Report ${name}`}
      onClose={onClose}
      busy={busy}
      illustration="shield"
      footer={
        <>
          <PressableButton variant="secondary" size="sm" onClick={onClose} disabled={busy}>
            Cancel
          </PressableButton>
          <PressableButton variant="danger" size="sm" disabled={!reason} loading={busy} onClick={() => reason && onSubmit(reason, details, alsoBlock)}>
            Send report
          </PressableButton>
        </>
      }
    >
      <p className="mb-4">Reports are private. The person is not told who reported them.</p>
      <div role="radiogroup" aria-label="What’s wrong?" className="space-y-2">
        {REPORT_REASONS.map((r) => (
          <OptionCard key={r} mode="single" compact title={REPORT_REASON_LABELS[r]} selected={reason === r} onSelect={() => setReason(r)} />
        ))}
      </div>
      <label className="mt-4 block">
        <span className="mb-1 block type-caption text-ink-muted">Details (optional)</span>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value.slice(0, REPORT_DETAILS_MAX))}
          rows={3}
          placeholder="Anything that helps us review this"
          className="field resize-none"
        />
        <span className="mt-1 block text-right text-[12px] font-bold text-ink-subtle">
          {details.length}/{REPORT_DETAILS_MAX}
        </span>
      </label>
      <label className="mt-2 flex min-h-[48px] cursor-pointer items-center gap-3 text-body font-bold text-ink">
        <input type="checkbox" checked={alsoBlock} onChange={(e) => setAlsoBlock(e.target.checked)} className="h-5 w-5 accent-[#EF4444]" />
        Also block {name} and end this match
      </label>
    </Modal>
  );
};

// ─── Chat thread ─────────────────────────────────────────────────────────────

const ChatThread: React.FC<{ match: MatchWithProfile }> = ({ match }) => {
  const { currentUser, profile } = useAuth();
  const me = currentUser?.id ?? '';
  const { markReadLocal, removeLocal } = useMatches();
  const { refresh: refreshProgress } = useProgress();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dialog, setDialog] = useState<null | 'unmatch' | 'block' | 'report'>(null);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const name = displayName(match.other);
  const firstName = name.split(' ')[0];
  const githubUrl = match.other?.github_url || (match.other?.username ? `https://github.com/${match.other.username}` : null);

  const markRead = useCallback(() => {
    markMatchRead(match.id)
      .then(() => markReadLocal(match.id))
      .catch(() => {
        /* best effort */
      });
  }, [match.id, markReadLocal]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await listMessages(match.id);
      // Keep messages that arrived via realtime (or were sent) while history was loading.
      setMessages((prev) => {
        const loaded = new Set(rows.map((m) => m.id));
        return [...rows, ...prev.filter((m) => !loaded.has(m.id))];
      });
      setLoadError(null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not load messages.');
    } finally {
      setLoading(false);
    }
  }, [match.id]);

  // Load history and mark read when the chat opens.
  useEffect(() => {
    void load();
    markRead();
  }, [load, markRead]);

  // A message from the other person arrived while the chat is open.
  useEffect(() => {
    if (match.unread) markRead();
  }, [match.unread, match.last_message_at, markRead]);

  // Realtime stream for this match.
  useEffect(() => {
    if (!supabase) return;
    const client = supabase;
    const channel = client
      .channel(`messages-${match.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `match_id=eq.${match.id}` }, (payload) => {
        const msg = payload.new as MessageRow;
        setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
        if (msg.sender_id !== me) markRead();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages', filter: `match_id=eq.${match.id}` }, (payload) => {
        const msg = payload.new as MessageRow;
        setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m)));
      })
      .subscribe();
    return () => {
      void client.removeChannel(channel);
    };
  }, [match.id, me, markRead]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, loading]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const icebreakers = useMemo(
    () => buildIcebreakers(profile, match.other ?? { looking_for: [], languages: [], interests: [] }),
    [profile, match.other]
  );

  const send = async () => {
    const content = draft;
    if (!content.trim() || sending || !match.otherId) return;
    setSending(true);
    try {
      const msg = await sendMessage({ matchId: match.id, senderId: me, receiverId: match.otherId, content });
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
      setDraft('');
      inputRef.current?.focus();
      refreshProgress();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send your message.');
    } finally {
      setSending(false);
    }
  };

  const leaveThread = () => {
    removeLocal(match.id);
    navigate('/app/messages', { replace: true });
  };

  const doUnmatch = async () => {
    setBusy(true);
    try {
      await unmatch(match.id);
      toast.success(`You unmatched ${name}.`);
      setDialog(null);
      leaveThread();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not unmatch.');
    } finally {
      setBusy(false);
    }
  };

  const doBlock = async () => {
    setBusy(true);
    try {
      await blockUser(match.otherId);
      toast.success(`${name} is blocked. You won’t see each other again.`);
      setDialog(null);
      leaveThread();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not block this user.');
    } finally {
      setBusy(false);
    }
  };

  const doReport = async (reason: ReportReason, details: string, alsoBlock: boolean) => {
    setBusy(true);
    try {
      await reportUser({ reporterId: me, reportedId: match.otherId, matchId: match.id, reason, details });
      if (alsoBlock) {
        try {
          await blockUser(match.otherId);
        } catch (err) {
          toast.error(err instanceof Error ? `Report sent, but blocking failed: ${err.message}` : 'Report sent, but blocking failed.');
          setDialog(null);
          return;
        }
      }
      toast.success('Thanks — your report was sent.');
      setDialog(null);
      if (alsoBlock) leaveThread();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not send your report.');
    } finally {
      setBusy(false);
    }
  };

  const lastMine = [...messages].reverse().find((m) => m.sender_id === me);
  const menuItem =
    'flex w-full min-h-[48px] items-center gap-3 rounded-md px-3 text-left text-body font-bold transition-colors';

  return (
    <div className="flex h-full w-full min-w-0 flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b-2 border-border bg-bg px-2 py-2 md:gap-3 md:px-5 md:py-3">
        <Link
          to="/app/messages"
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-ink-muted hover:bg-surface hover:text-ink md:hidden"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-6 w-6" strokeWidth={3} aria-hidden />
        </Link>
        <Avatar src={match.other?.avatar_url} name={name} size={44} />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-baseline gap-2">
            <h2 className="truncate text-h3 text-ink">{name}</h2>
            {match.other?.username && <span className="hidden truncate text-body-sm text-ink-muted sm:inline">@{match.other.username}</span>}
          </div>
          <IntentChips values={match.other?.looking_for} size="xs" className="mt-1 hidden sm:flex" />
        </div>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full text-ink-muted hover:bg-surface hover:text-ink"
            aria-label="Conversation options"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <MoreVertical className="h-5 w-5" strokeWidth={3} aria-hidden />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                role="menu"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.16, ease: EASE_OUT_CUBIC }}
                className="absolute right-0 z-20 mt-2 w-60 rounded-lg border-2 border-border bg-card p-2 shadow-edge-tile"
              >
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    className={`${menuItem} text-ink hover:bg-surface`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Github className="h-5 w-5" strokeWidth={2.5} aria-hidden /> View GitHub
                    <ExternalLink className="ml-auto h-4 w-4 text-ink-subtle" aria-hidden />
                  </a>
                )}
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setDialog('unmatch');
                  }}
                  className={`${menuItem} text-ink hover:bg-surface`}
                >
                  <UserX className="h-5 w-5" strokeWidth={2.5} aria-hidden /> Unmatch
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setDialog('block');
                  }}
                  className={`${menuItem} text-danger-fg hover:bg-danger-tint`}
                >
                  <Ban className="h-5 w-5" strokeWidth={2.5} aria-hidden /> Block
                </button>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setDialog('report');
                  }}
                  className={`${menuItem} text-danger-fg hover:bg-danger-tint`}
                >
                  <Flag className="h-5 w-5" strokeWidth={2.5} aria-hidden /> Report
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto bg-surface px-3 py-4 md:px-6">
        {match.other?.pitch && (
          <div className="mx-auto mb-5 flex max-w-xl items-start gap-3 rounded-lg border-2 border-border bg-card p-3 shadow-edge-tile">
            <Illustration name="rocket" size={28} />
            <p className="text-body-sm text-ink">
              <span className="font-extrabold">{firstName} is building:</span> {match.other.pitch}
            </p>
          </div>
        )}

        {loading ? (
          <div className="mx-auto max-w-xl space-y-3" aria-hidden>
            <LoadingLabel>Loading messages…</LoadingLabel>
            <Skeleton className="h-11 w-2/3" rounded="lg" />
            <Skeleton className="ml-auto h-11 w-1/2" rounded="lg" />
            <Skeleton className="h-11 w-3/5" rounded="lg" />
          </div>
        ) : loadError ? (
          <EmptyState
            size="sm"
            illustration="thinking_face"
            title="Couldn’t load messages"
            message={loadError}
            action={
              <PressableButton variant="secondary" size="sm" onClick={() => void load()} leadingIcon={<RefreshCw strokeWidth={2.75} />}>
                Retry
              </PressableButton>
            }
          />
        ) : messages.length === 0 ? (
          <div className="mx-auto max-w-md py-4 text-center">
            <Illustration name="handshake" size={96} className="mx-auto" />
            <h3 className="mt-3 text-h2 text-ink">You matched with {firstName}!</h3>
            <p className="mb-5 mt-1 text-body text-ink-muted">Break the ice — tap an idea to edit it before sending.</p>
            <div className="space-y-2.5 text-left">
              {icebreakers.map((text) => (
                <OptionCard
                  key={text}
                  mode="action"
                  compact
                  illustration="light_bulb"
                  illustrationSize={32}
                  title={text}
                  selected={false}
                  onSelect={() => {
                    setDraft(text);
                    inputRef.current?.focus();
                  }}
                />
              ))}
            </div>
          </div>
        ) : (
          <ol className="mx-auto max-w-3xl space-y-1.5">
            {messages.map((msg, i) => {
              const mine = msg.sender_id === me;
              const newDay = i === 0 || dayKey(messages[i - 1].sent_at) !== dayKey(msg.sent_at);
              const nextSame = i < messages.length - 1 && messages[i + 1].sender_id === msg.sender_id && dayKey(messages[i + 1].sent_at) === dayKey(msg.sent_at);
              return (
                <React.Fragment key={msg.id}>
                  {newDay && (
                    <li className="flex justify-center py-3">
                      <span className="rounded-pill border-2 border-border bg-card px-3 py-1 type-caption text-ink-muted">{dayLabel(msg.sent_at)}</span>
                    </li>
                  )}
                  <motion.li
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: EASE_OUT_CUBIC }}
                    className={`flex ${mine ? 'justify-end' : 'justify-start'} ${nextSame ? '' : 'pb-1.5'}`}
                  >
                    <div className={`flex max-w-[82%] flex-col md:max-w-[68%] ${mine ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`whitespace-pre-wrap break-words px-4 py-2.5 text-body ${
                          mine
                            ? 'rounded-[20px] rounded-br-md bg-green text-white shadow-[0_2px_0_0_#117A38]'
                            : 'rounded-[20px] rounded-bl-md border-2 border-border bg-card text-ink shadow-edge-tile'
                        } ${msg.type === 'code' ? 'font-mono text-[13px]' : ''}`}
                      >
                        <span className="sr-only">{mine ? 'You: ' : `${firstName}: `}</span>
                        {msg.content}
                      </div>
                      {!nextSame && (
                        <span className="mt-1 px-1 text-[12px] font-bold text-ink-subtle">
                          {timeLabel(msg.sent_at)}
                          {mine && lastMine?.id === msg.id && msg.is_read ? ' · Seen' : ''}
                        </span>
                      )}
                    </div>
                  </motion.li>
                </React.Fragment>
              );
            })}
          </ol>
        )}
      </div>

      {/* Composer */}
      <form
        className="border-t-2 border-border bg-bg px-3 py-2.5 md:px-5 md:py-3"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <div className="flex items-end gap-2">
          <div className="flex min-h-[52px] min-w-0 flex-1 items-center rounded-[26px] border-2 border-border bg-card px-4 transition-colors focus-within:border-green-bright">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, MESSAGE_MAX))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={Math.min(6, Math.max(1, draft.split('\n').length))}
              placeholder={`Message ${firstName}…`}
              aria-label={`Message ${name}`}
              className="block max-h-40 w-full resize-none bg-transparent py-3 text-body text-ink placeholder:text-ink-subtle focus:outline-none focus-visible:outline-none"
            />
          </div>
          <CircleActionButton
            type="submit"
            variant="green"
            size={48}
            caption={false}
            label={sending ? 'Sending…' : 'Send message'}
            icon={<Send className="-ml-0.5 h-5 w-5" strokeWidth={2.75} />}
            disabled={!draft.trim() || sending}
            className="!p-0"
          />
        </div>
        <div className="mt-1 flex justify-between px-2 text-[12px] font-bold text-ink-subtle">
          <span className="hidden sm:inline">Enter to send · Shift+Enter for a new line</span>
          {draft.length > MESSAGE_MAX - 500 && (
            <span className="ml-auto">
              {draft.length}/{MESSAGE_MAX}
            </span>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={dialog === 'unmatch'}
        title={`Unmatch ${name}?`}
        message="The conversation will be removed for both of you. This can’t be undone."
        confirmLabel="Unmatch"
        destructive
        busy={busy}
        onConfirm={() => void doUnmatch()}
        onClose={() => setDialog(null)}
      />
      <ConfirmDialog
        open={dialog === 'block'}
        title={`Block ${name}?`}
        message="You won’t see each other in Discover or Messages anymore, and this match will end."
        confirmLabel="Block"
        destructive
        busy={busy}
        onConfirm={() => void doBlock()}
        onClose={() => setDialog(null)}
      />
      <ReportDialog
        open={dialog === 'report'}
        name={name}
        busy={busy}
        onClose={() => setDialog(null)}
        onSubmit={(reason, details, alsoBlock) => void doReport(reason, details, alsoBlock)}
      />
    </div>
  );
};

// ─── Page ────────────────────────────────────────────────────────────────────

export const MessagesPage: React.FC = () => {
  const { matchId } = useParams<{ matchId?: string }>();
  const { currentUser } = useAuth();
  const { matches, loading, error, reload, unreadCount } = useMatches();
  const me = currentUser?.id ?? '';
  const selected = matchId ? matches.find((m) => m.id === matchId) : undefined;
  const fresh = matches.filter((m) => !m.last_message);
  const conversations = matches.filter((m) => !!m.last_message);

  return (
    <section className="flex h-[calc(100dvh-66px-72px)] min-h-[420px] md:h-[calc(100dvh-66px)]">
      <SEO title="Messages – GitAlong" description="Chat with your GitAlong matches." url="/app/messages" noIndex />

      {/* Conversation list */}
      <aside
        className={`${matchId ? 'hidden md:flex' : 'flex'} w-full flex-col border-r-2 border-border bg-bg md:w-80 lg:w-96`}
        aria-label="Conversations"
      >
        <div className="flex items-center justify-between px-4 pb-2 pt-4">
          <div>
            <h2 className="text-h2 text-ink">Chats</h2>
            <p className="text-body-sm text-ink-muted">
              {matches.length} {matches.length === 1 ? 'match' : 'matches'}
              {unreadCount > 0 ? ` · ${unreadCount} unread` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void reload()}
            className="inline-flex h-12 w-12 items-center justify-center rounded-full text-ink-muted hover:bg-surface hover:text-ink"
            aria-label="Refresh conversations"
          >
            <RefreshCw className="h-5 w-5" strokeWidth={2.75} aria-hidden />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {loading ? (
            <div className="space-y-3 pt-2">
              <LoadingLabel>Loading conversations…</LoadingLabel>
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : error ? (
            <EmptyState
              size="sm"
              illustration="thinking_face"
              title="Couldn’t load your matches"
              message={error}
              action={
                <PressableButton variant="secondary" size="sm" onClick={() => void reload()}>
                  Retry
                </PressableButton>
              }
            />
          ) : matches.length === 0 ? (
            <EmptyState
              size="sm"
              illustration="speech_balloon"
              title="No matches yet"
              message="When someone you liked likes you back, you can chat here."
              action={
                <PressableLink to="/app/discover" size="sm">
                  Go to Discover
                </PressableLink>
              }
            />
          ) : (
            <>
              {fresh.length > 0 && (
                <div className="mb-3">
                  <p className="px-1 pb-2 pt-1 type-caption text-ink-muted">New matches</p>
                  <div className="-mx-3 flex gap-1 overflow-x-auto px-3 pb-1">
                    {fresh.map((m) => (
                      <NewMatchBubble key={m.id} match={m} active={m.id === matchId} />
                    ))}
                  </div>
                </div>
              )}
              <p className="px-1 pb-2 pt-1 type-caption text-ink-muted">Conversations</p>
              {conversations.length === 0 ? (
                <p className="px-1 text-body-sm text-ink-muted">Say hi to a new match to start your first conversation.</p>
              ) : (
                <div className="space-y-2.5">
                  {conversations.map((m) => (
                    <ConversationTile key={m.id} match={m} me={me} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </aside>

      {/* Thread */}
      <div className={`${matchId ? 'flex' : 'hidden md:flex'} min-w-0 flex-1`}>
        {matchId ? (
          selected ? (
            <ChatThread key={selected.id} match={selected} />
          ) : loading ? (
            <div className="flex flex-1 items-center justify-center">
              <Illustration name="speech_balloon" size={72} className="animate-bob" />
              <LoadingLabel>Loading conversation…</LoadingLabel>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6">
              <EmptyState
                illustration="ghost"
                title="This chat isn’t available"
                message="The match may have ended."
                action={
                  <PressableLink to="/app/messages" variant="secondary">
                    Back to chats
                  </PressableLink>
                }
              />
            </div>
          )
        ) : (
          <div className="flex flex-1 items-center justify-center bg-surface p-6">
            <EmptyState
              illustration="speech_balloon"
              title="Pick a conversation"
              message="Messages update in real time, on the web and in the mobile app."
            />
          </div>
        )}
      </div>
    </section>
  );
};
