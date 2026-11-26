import { Box } from '@/src/components/Box';
import { Button } from '@/src/components/Button';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '@/src/components/Dialog';
import { MenuItem } from '@/src/components/MenuItem';
import { Select } from '@/src/components/Select';
import { Snackbar } from '@/src/components/Snackbar';
import { Stack } from '@/src/components/Stack';
import { TextField } from '@/src/components/TextField';
import { Tooltip } from '@/src/components/Tooltip';
import { Typography } from '@/src/components/Typography';
import {
  ArrowClockwiseIcon,
  CheckIcon,
  CopyIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from '@/src/icons/glyphs';
import { border, icon as iconTokens, radius, surface, text } from '@/src/tokens';
import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react';
import type { ChatMessage } from '../../core/store/types';
import { useChatContext } from '../../react/context';
import { useChatActions, useLabels, usePreference, useThread } from '../../react/hooks';
import { messageText } from '../../react/primitives';
import { mode, type AtomsTheme } from '../kit/tokens';

/** What `onFeedback` receives. */
export interface TurnFeedback {
  rating: 'good' | 'bad';
  messageId: string;
  conversationId: string | null;
  /** The run that wrote the answer, when the backend sent one. */
  runId?: string;
  /** 👎 only: the issue type chosen in the dialog, by `id`. */
  issueType?: string;
  /** 👎 only: what the user wrote in the dialog. */
  details?: string;
}

/** The row under each answer, and what each of its buttons does. */
export interface TurnActionsOptions {
  /**
   * 👍 and 👎, shown when this is set: the chat standard has no feedback endpoint, so the
   * feedback goes wherever you send it. 👍 sends at once; 👎 first asks what went wrong. The
   * chat thanks the user when the promise resolves, and remembers the rating on the device.
   */
  onFeedback?: (feedback: TurnFeedback) => void | Promise<void>;
  /** The choices for "issue type" in 👎's dialog. Without any, it asks for details only. */
  feedbackIssueTypes?: { id: string; label: string }[];
  /** Copy the answer as text. @default true */
  copy?: boolean;
  /**
   * ↻ under the newest answer. By default it asks the answer's question again, as a new turn
   * (the standard has no way to replace an answer). A function does your own thing instead;
   * `false` hides it.
   * @default true
   */
  retry?: boolean | ((message: ChatMessage) => void);
  /** When the answer was given, "40 mins ago". @default true */
  timestamp?: boolean;
  /** Your own buttons, after the built-in ones. `TurnActionButton` matches them. */
  extra?: (message: ChatMessage) => ReactNode;
  /** `always`, or `hover`: only while the pointer is over the answer, and always on the newest. @default 'always' */
  visibility?: 'always' | 'hover';
}

interface TurnActionsContextValue {
  options: TurnActionsOptions | false;
  now: Date;
  /** 👎's dialog for this answer. */
  askWhy: (message: ChatMessage) => void;
  send: (feedback: TurnFeedback) => void;
}

const TurnActionsContext = createContext<TurnActionsContextValue | null>(null);

/** The ratings this device gave, by message id. Capped so it can't grow forever. */
const RATINGS_KEY = 'feedback.ratings';
const RATINGS_LIMIT = 200;

/** Re-renders once a minute, so "40 mins ago" keeps up. */
function useNow(): Date {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  return now;
}

/**
 * Holds what the row under each answer does, and draws what the feedback buttons open: 👎's
 * dialog and the thank-you toast. `AgenticChat` mounts it with its `turnActions` prop.
 */
export function TurnActionsProvider({ options = {}, children }: { options?: TurnActionsOptions | false; children: ReactNode }) {
  const labels = useLabels();
  const now = useNow();
  const [ratings, setRatings] = usePreference<Record<string, 'good' | 'bad'>>(RATINGS_KEY, {});
  const [toast, setToast] = useState<'thanks' | 'failed' | null>(null);
  const [why, setWhy] = useState<ChatMessage | null>(null);
  const [issueType, setIssueType] = useState('');
  const [details, setDetails] = useState('');
  const conversationId = useThread((s) => s.conversationId);
  const onFeedback = options ? options.onFeedback : undefined;

  const value = useMemo<TurnActionsContextValue>(() => {
    const send = (feedback: TurnFeedback) => {
      if (!onFeedback) return;
      const entries = Object.entries({ ...ratings, [feedback.messageId]: feedback.rating }).slice(-RATINGS_LIMIT);
      setRatings(Object.fromEntries(entries));
      let result: void | Promise<void>;
      try {
        result = onFeedback(feedback);
      } catch (error) {
        result = Promise.reject(error);
      }
      Promise.resolve(result).then(
        () => setToast('thanks'),
        () => setToast('failed'),
      );
    };
    return {
      options,
      now,
      send,
      askWhy: (message) => {
        setIssueType('');
        setDetails('');
        setWhy(message);
      },
    };
  }, [options, now, onFeedback, ratings, setRatings]);

  const issueTypes = (options && options.feedbackIssueTypes) || [];
  return (
    <TurnActionsContext.Provider value={value}>
      {children}
      {onFeedback ? (
        <>
          <Dialog open={why !== null} onClose={() => setWhy(null)} maxWidth="xs" fullWidth>
            <DialogTitle icon={<ThumbsDownIcon />} onClose={() => setWhy(null)}>
              {labels.feedbackDialogTitle}
            </DialogTitle>
            <DialogContent>
              <Stack spacing={2}>
                {issueTypes.length ? (
                  <Select
                    label={labels.feedbackIssueLabel}
                    value={issueType}
                    onChange={(e) => setIssueType(String(e.target.value))}
                    fullWidth
                  >
                    {issueTypes.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.label}
                      </MenuItem>
                    ))}
                  </Select>
                ) : null}
                <TextField
                  label={labels.feedbackDetailsLabel}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  multiline
                  minRows={4}
                  fullWidth
                />
                <Typography variant="body2" sx={(t: AtomsTheme) => mode(t, { color: text.default.b3 })}>
                  {labels.feedbackHint}
                </Typography>
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button variant="secondary" appearance="outline" onClick={() => setWhy(null)}>
                {labels.cancel}
              </Button>
              <Button
                onClick={() => {
                  if (!why) return;
                  value.send({
                    rating: 'bad',
                    messageId: why.id,
                    conversationId,
                    runId: why.runId,
                    ...(issueType ? { issueType } : {}),
                    ...(details.trim() ? { details: details.trim() } : {}),
                  });
                  setWhy(null);
                }}
              >
                {labels.submit}
              </Button>
            </DialogActions>
          </Dialog>
          <Snackbar
            open={toast !== null}
            onClose={() => setToast(null)}
            severity={toast === 'failed' ? 'error' : 'info'}
            title={toast === 'failed' ? labels.feedbackFailedTitle : labels.feedbackThanksTitle}
            message={toast === 'failed' ? labels.feedbackFailedMessage : labels.feedbackThanksMessage}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            autoHideDuration={4000}
          />
        </>
      ) : null}
    </TurnActionsContext.Provider>
  );
}

/** The options in effect: the provider's, or the defaults for a turn rendered on its own. */
export function useTurnActionsOptions(): TurnActionsOptions | false {
  return useContext(TurnActionsContext)?.options ?? {};
}

/**
 * A small icon button for the row under an answer (Figma: 14px glyphs on a 22px target). Use it
 * for buttons of your own in `turnActions.extra`, so they line up with the built-in ones.
 */
export const TurnActionButton = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { label: string; pressed?: boolean; children: ReactNode }
>(function TurnActionButton({ label, pressed, children, ...props }, ref) {
  return (
    <Tooltip title={label}>
      <Box
        component="button"
        ref={ref}
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        {...props}
        sx={(t: AtomsTheme) => ({
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0.5,
          m: 0,
          border: 0,
          borderRadius: `${radius.xs}px`,
          background: 'transparent',
          cursor: 'pointer',
          '& svg': { width: 14, height: 14 },
          ...mode(t, { color: pressed ? iconTokens.default.b1 : iconTokens.default.b2 }),
          '&:hover': mode(t, { backgroundColor: surface.default.default, color: iconTokens.default.b1 }),
          '&:focus-visible': { outline: '2px solid', outlineOffset: 0, ...mode(t, { outlineColor: border.primary.focus }) },
        })}
      >
        {children}
      </Box>
    </Tooltip>
  );
});

function blockText(message: ChatMessage, registry: ReturnType<typeof useChatContext>['registry']) {
  return messageText(message, (block) => {
    const def = registry.resolve(block.data);
    if (!def?.toText) return undefined;
    try {
      return def.toText(def.parse ? def.parse(block.data, block) : block.data, block);
    } catch {
      return undefined;
    }
  });
}

function CopyAction({ message }: { message: ChatMessage }) {
  const labels = useLabels();
  const { registry } = useChatContext();
  const [copied, setCopied] = useState(false);
  const value = blockText(message, registry);
  if (!value || typeof navigator === 'undefined' || !navigator.clipboard) return null;
  return (
    <TurnActionButton
      label={copied ? labels.copied : labels.copy}
      onClick={() => {
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </TurnActionButton>
  );
}

/**
 * The row under an answer: 👍 👎 (with `onFeedback`), copy, ↻ on the newest answer, your own
 * buttons, then when it was given. Each part is set by `AgenticChat`'s `turnActions`.
 */
export function TurnActions({ message }: { message: ChatMessage }) {
  const labels = useLabels();
  const ctx = useContext(TurnActionsContext);
  const options = ctx?.options ?? {};
  const [ratings] = usePreference<Record<string, 'good' | 'bad'>>(RATINGS_KEY, {});
  const { send } = useChatActions();
  const state = useThread(
    (s) => {
      const index = s.messages.findIndex((m) => m.id === message.id);
      const newest = s.messages.slice(index + 1).every((m) => m.role !== 'assistant');
      const question = [...s.messages.slice(0, index)].reverse().find((m) => m.role === 'user');
      return { newest, idle: s.run.status === 'idle' || s.run.status === 'error', question, conversationId: s.conversationId };
    },
    (a, b) => a.newest === b.newest && a.idle === b.idle && a.question === b.question && a.conversationId === b.conversationId,
  );
  if (options === false) return null;
  const rating = ratings[message.id];
  const retry = options.retry ?? true;
  const question = state.question ? messageText(state.question) : '';
  const now = ctx?.now ?? new Date();
  const when = options.timestamp === false ? '' : labels.timeAgo(new Date(message.createdAt), now);
  const hover = options.visibility === 'hover' && !state.newest;

  return (
    <Stack
      direction="row"
      spacing={1.25}
      className={hover ? 'acu-turn-actions' : undefined}
      sx={{ alignItems: 'center', ml: -0.5 }}
    >
      <Stack direction="row" sx={{ alignItems: 'center' }}>
        {options.onFeedback && ctx ? (
          <>
            <TurnActionButton
              label={labels.feedbackGood}
              pressed={rating === 'good'}
              onClick={() =>
                rating !== 'good' &&
                ctx.send({ rating: 'good', messageId: message.id, conversationId: state.conversationId, runId: message.runId })
              }
            >
              <ThumbsUpIcon weight={rating === 'good' ? 'fill' : 'regular'} />
            </TurnActionButton>
            <TurnActionButton label={labels.feedbackBad} pressed={rating === 'bad'} onClick={() => ctx.askWhy(message)}>
              <ThumbsDownIcon weight={rating === 'bad' ? 'fill' : 'regular'} />
            </TurnActionButton>
          </>
        ) : null}
        {options.copy !== false ? <CopyAction message={message} /> : null}
        {retry && state.newest && state.idle && (typeof retry === 'function' || question) ? (
          <TurnActionButton
            label={labels.askAgain}
            onClick={() => (typeof retry === 'function' ? retry(message) : void send(question).catch(() => undefined))}
          >
            <ArrowClockwiseIcon />
          </TurnActionButton>
        ) : null}
        {options.extra?.(message)}
      </Stack>
      {when ? (
        <Typography
          variant="caption"
          component="span"
          sx={(t: AtomsTheme) => ({ display: 'inline-flex', gap: 1.25, ...mode(t, { color: text.default.subtle }) })}
        >
          <span aria-hidden>•</span>
          <Box component="time" dateTime={message.createdAt}>
            {when}
          </Box>
        </Typography>
      ) : null}
    </Stack>
  );
}
