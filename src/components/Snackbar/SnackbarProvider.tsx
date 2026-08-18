'use client';

import * as React from 'react';

import { Snackbar } from './Snackbar';

import type { AlertSeverity } from '../Alert';
import type {
  SnackbarApi,
  SnackbarCloseReason,
  SnackbarContent,
  SnackbarMessage,
  SnackbarOptions,
  SnackbarProviderProps,
} from './Snackbar.types';

/**
 * The imperative API, or `null` outside a provider.
 *
 * `useSnackbar` turns the null into an error naming the fix, which is
 * more useful than a no-op: a prototype whose confirmations never appear
 * looks like a bug in the save, not a missing provider.
 */
export const SnackbarContext = React.createContext<SnackbarApi | null>(null);

/**
 * How long the visible message keeps the corner while others wait behind
 * it.
 *
 * A burst has to clear at a pace that can be read. Cutting the visible
 * one off the instant the next arrives — the obvious implementation —
 * means three messages fired together show as two flashes and one toast,
 * so the first two might as well not have been sent. Shortening the turn
 * instead shows all three.
 */
const QUEUED_AUTO_HIDE_MS = 2000;

/**
 * The whole state machine, in one object because every transition reads
 * both halves: whether anything is queued decides whether closing means
 * anything, and whether the head is mid-exit decides whether it is still
 * on screen.
 *
 * `queue[0]` is the visible message. Nothing is derived from an effect,
 * which is the point — promoting the next message from an effect is a
 * setState during render's own commit, and it cascades.
 */
interface SnackbarQueueState {
  readonly queue: readonly SnackbarMessage[];
  readonly isClosing: boolean;
}

const EMPTY_STATE: SnackbarQueueState = { queue: [], isClosing: false };

/**
 * How long this message stays up, given what is waiting behind it.
 *
 * A message setting `null` still waits to be dismissed even with a queue
 * behind it — that was asked for explicitly, and it is asked for on the
 * errors that say what to do next.
 */
function resolveDuration(
  message: SnackbarMessage,
  fallback: number | null | undefined,
  hasWaiting: boolean
): number | null | undefined {
  // Not `??`: `null` is a real answer here — stay up until dismissed —
  // and `??` would read it as unset and fall through to the default.
  const own =
    message.autoHideDuration !== undefined
      ? message.autoHideDuration
      : fallback;
  if (!hasWaiting || own === null) {
    return own;
  }
  return own === undefined ? QUEUED_AUTO_HIDE_MS : Math.min(own, QUEUED_AUTO_HIDE_MS);
}

/**
 * Holds the one visible toast and the queue behind it, and puts
 * `useSnackbar` in reach of everything below it.
 *
 * Mount it once, inside `NeofloThemeProvider`. Nothing renders until
 * something is queued.
 *
 * The queue is why this exists rather than a `useState` pair at each call
 * site. Feedback arrives from event handlers, sometimes two at once — a
 * failed save that also cleared a filter — and two toasts in the same
 * corner means the second covers the first. So: one on screen, the next
 * promoted when it leaves, in the order they were fired.
 *
 * @example
 * <NeofloThemeProvider>
 *   <SnackbarProvider>
 *     <App />
 *   </SnackbarProvider>
 * </NeofloThemeProvider>
 *
 * @example Bottom left, and slower
 * <SnackbarProvider
 *   anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
 *   autoHideDuration={8000}
 * >
 *   <App />
 * </SnackbarProvider>
 *
 * @see Related: useSnackbar for firing messages, Snackbar for the
 * controlled form.
 */
export function SnackbarProvider({
  children,
  anchorOrigin,
  autoHideDuration,
}: SnackbarProviderProps): React.JSX.Element {
  const [state, setState] = React.useState<SnackbarQueueState>(EMPTY_STATE);
  const lastKey = React.useRef(0);

  const notify = React.useCallback((content: SnackbarContent): void => {
    lastKey.current += 1;
    const message: SnackbarMessage = {
      ...content,
      // Identity, so consecutive messages are separate mounts. Without
      // it the text swaps in place and the outgoing message's auto-hide
      // timer carries over to the one that replaced it.
      key: String(lastKey.current),
    };
    setState((prev) => ({
      queue: [...prev.queue, message],
      // Nothing is on screen when the queue is empty, so nothing can be
      // mid-exit either, and a stale `true` here would hold the arriving
      // message shut with no exit coming to clear it.
      isClosing: prev.queue.length > 0 && prev.isClosing,
    }));
  }, []);

  const closeCurrent = React.useCallback((): void => {
    setState((prev) =>
      prev.queue.length > 0 ? { ...prev, isClosing: true } : prev
    );
  }, []);

  const api = React.useMemo<SnackbarApi>(() => {
    function shorthand(severity: AlertSeverity) {
      return (message: React.ReactNode, options?: SnackbarOptions): void => {
        notify({ ...options, severity, message });
      };
    }
    return {
      notify,
      success: shorthand('success'),
      error: shorthand('error'),
      warning: shorthand('warning'),
      info: shorthand('info'),
      dismiss: closeCurrent,
    };
  }, [closeCurrent, notify]);

  const handleClose = React.useCallback(
    (_event: React.SyntheticEvent | Event, reason: SnackbarCloseReason) => {
      // A click elsewhere on the page is not a decision about the toast.
      // Left in, the first click after any message dismisses it — which
      // during a demo is every message.
      if (reason === 'clickaway') {
        return;
      }
      closeCurrent();
    },
    [closeCurrent]
  );

  // The exit is what promotes the next one, so the arriving toast mounts
  // into a corner the outgoing one has finished leaving.
  const handleExited = React.useCallback(() => {
    setState((prev) => ({ queue: prev.queue.slice(1), isClosing: false }));
  }, []);

  const current = state.queue[0];

  return (
    <SnackbarContext.Provider value={api}>
      {children}
      {current ? (
        <Snackbar
          key={current.key}
          open={!state.isClosing}
          severity={current.severity}
          message={current.message}
          title={current.title}
          action={current.action}
          autoHideDuration={resolveDuration(
            current,
            autoHideDuration,
            state.queue.length > 1
          )}
          anchorOrigin={anchorOrigin}
          onClose={handleClose}
          slotProps={{ transition: { onExited: handleExited } }}
        />
      ) : null}
    </SnackbarContext.Provider>
  );
}

SnackbarProvider.displayName = 'SnackbarProvider';
