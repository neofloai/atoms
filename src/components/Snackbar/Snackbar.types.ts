import type {
  SnackbarCloseReason as MuiSnackbarCloseReason,
  SnackbarProps as MuiSnackbarProps,
  SnackbarOrigin,
} from '@mui/material';
import type { ReactNode, SyntheticEvent } from 'react';
import type { AlertSeverity } from '../Alert';

export type { SnackbarOrigin } from '@mui/material';

/**
 * Why the snackbar closed.
 *
 * MUI's three reasons plus `dismiss`, which its own union has no member
 * for: the close button belongs to the `Alert` inside, so a click on it
 * is neither a timeout, a click-away, nor an escape key. Without the
 * extra member a caller reading `reason` gets `undefined` for the one
 * case that is unambiguously a decision by the user.
 */
export type SnackbarCloseReason = MuiSnackbarCloseReason | 'dismiss';

/**
 * The message itself, independent of how it reaches the screen.
 *
 * Shared by the component's props and the provider's queue, so a toast
 * fired from `useSnackbar` and one rendered declaratively cannot drift
 * into accepting different things.
 */
export interface SnackbarContent {
  /**
   * Semantic state, passed through to the `Alert` inside — it sets the
   * colour and, with it, whether the message reads as a confirmation or
   * a failure.
   * @default 'info'
   */
  severity?: AlertSeverity;
  /**
   * The second line: what the outcome means. One sentence — a toast is
   * not a place to explain.
   */
  message: ReactNode;
  /**
   * The first line, in bold: what happened. Omitted, it falls back to
   * the severity's own word, so every toast is a titled alert without
   * every call site writing two strings. Pass one for anything worth
   * naming specifically, which is most errors — "Upload failed" and the
   * reason it failed are different sentences. Pass `null` for the rare
   * toast that genuinely wants a single line.
   * @default the severity — 'Success', 'Error', 'Warning', 'Heads up'
   */
  title?: ReactNode;
  /**
   * Element after the message — an `Undo` button, typically. Rendered
   * beside the close button rather than in place of it.
   */
  action?: ReactNode;
  /**
   * Milliseconds on screen before it dismisses itself. `null` keeps it
   * up until something takes it down, which is worth passing for an
   * error carrying a recovery step nobody can read in five seconds.
   * @default 5000
   */
  autoHideDuration?: number | null;
}

/**
 * The rest of a message, for the shorthand helpers on `useSnackbar` that
 * already take `message` and imply `severity`.
 */
export type SnackbarOptions = Omit<SnackbarContent, 'message' | 'severity'>;

/**
 * Props for the Neoflo `Snackbar`.
 *
 * MUI's `SnackbarProps` minus the four we remap. `message`, `action` and
 * `title` are redeclared because they describe the `Alert` inside rather
 * than MUI's own `SnackbarContent`; `children` is dropped because the
 * content is not a slot — a Neoflo snackbar is an `Alert`, and arbitrary
 * markup floating in the corner of the page is not the same component.
 * `onClose` is redeclared only to widen its `reason`. Everything else —
 * `open`, `anchorOrigin`, `disableWindowBlurListener`, `slotProps`,
 * `sx`, `key` — passes through.
 */
export interface SnackbarProps
  extends Omit<
      MuiSnackbarProps,
      'action' | 'autoHideDuration' | 'children' | 'message' | 'onClose' | 'title'
    >,
    SnackbarContent {
  /**
   * Render a close button on the alert, beside `action` when there is
   * one. Ignored when there is no `onClose` to call — a button that
   * cannot close anything is worse than no button.
   * @default true
   */
  dismissible?: boolean;
  /**
   * Fired when the snackbar asks to be closed, with the reason. Set
   * `open` from it. `clickaway` is worth ignoring: a click elsewhere on
   * the page is not a decision about the toast.
   */
  onClose?: (
    event: SyntheticEvent | Event,
    reason: SnackbarCloseReason
  ) => void;
}

/** Props for `SnackbarProvider`. */
export interface SnackbarProviderProps {
  /** The app. Toasts render above it, in MUI's portal. */
  children: ReactNode;
  /**
   * Where toasts appear.
   * @default { vertical: 'top', horizontal: 'right' }
   */
  anchorOrigin?: SnackbarOrigin;
  /**
   * Dismiss delay for every message that does not carry its own.
   * @default 5000
   */
  autoHideDuration?: number | null;
}

/**
 * One message in the provider's queue.
 *
 * The `key` is what keeps consecutive toasts separate mounts. Without
 * it the text swaps in place and the outgoing message's auto-hide timer
 * carries over to the one that replaced it.
 */
export interface SnackbarMessage extends SnackbarContent {
  key: string;
}

/**
 * The imperative API returned by `useSnackbar`.
 *
 * Four shorthands because those are the four severities and a
 * confirmation should cost one line, plus `notify` for a message that
 * needs a title, an action, or its own dismiss delay.
 */
export interface SnackbarApi {
  /** Queue a message with every field spelled out. */
  notify: (content: SnackbarContent) => void;
  /** Queue a `success` message. */
  success: (message: ReactNode, options?: SnackbarOptions) => void;
  /** Queue an `error` message. */
  error: (message: ReactNode, options?: SnackbarOptions) => void;
  /** Queue a `warning` message. */
  warning: (message: ReactNode, options?: SnackbarOptions) => void;
  /** Queue an `info` message. */
  info: (message: ReactNode, options?: SnackbarOptions) => void;
  /**
   * Take the current message down early. Anything queued behind it
   * still follows.
   */
  dismiss: () => void;
}
