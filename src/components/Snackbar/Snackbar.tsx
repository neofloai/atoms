'use client';

import * as React from 'react';
import { Snackbar as MuiSnackbar } from '@mui/material';
import { styled } from '@mui/material/styles';

import { elevation } from '@/src/tokens';

import { Alert } from '../Alert';
import { IconButton } from '../IconButton';
import { Slide } from '../Slide';
import { Stack } from '../Stack';
import { AlertCloseIcon } from '../_shared/alertIcons';

import type { SlideProps, SnackbarOrigin } from '@mui/material';
import type { AlertSeverity } from '../Alert';
import type { SlideDirection } from '../Slide';
import type { SnackbarProps } from './Snackbar.types';

/**
 * Top right, and deliberately not MUI's bottom left.
 *
 * A toast reporting the outcome of something the user just did belongs
 * near where they are looking and out of the way of what they are
 * doing. Bottom left is where MUI puts it because Material's snackbar is
 * a mobile pattern; on a desktop dashboard it collides with the nav rail
 * and sits diagonally opposite whatever was just clicked.
 */
const DEFAULT_ANCHOR_ORIGIN: SnackbarOrigin = {
  vertical: 'top',
  horizontal: 'right',
};

/**
 * Seconds on screen. Long enough for a sentence, short enough that a
 * confirmation does not need dismissing before the next action.
 */
const DEFAULT_AUTO_HIDE_MS = 5000;

/**
 * First line per severity, for a toast that did not bring its own.
 *
 * A snackbar is always the titled alert: icon, bold line, sentence under
 * it. Defaulting the title is what lets that hold without making every
 * call site write two strings — `success('Your changes are live.')` still
 * renders as two lines. Pass a `title` for anything worth naming
 * specifically, which is most errors; pass `null` for the rare toast that
 * genuinely wants one line.
 */
const DEFAULT_TITLES: Record<AlertSeverity, string> = {
  success: 'Success',
  error: 'Error',
  warning: 'Warning',
  info: 'Heads up',
};

/**
 * Width bounds for the toast.
 *
 * MUI's own `SnackbarContent` carries these; a Neoflo snackbar replaces
 * that content with an `Alert`, which sizes to its text instead — so a
 * one-word confirmation would render as a stub and a long sentence would
 * stretch most of the way across a wide window. The minimum is MUI's.
 * The maximum is wider than a plain toast needs because the icon and the
 * action each take a column out of the middle, leaving the two lines of
 * text less room than the number suggests.
 */
const MIN_WIDTH_PX = 288;
const MAX_WIDTH_PX = 440;

/**
 * A `Slide` per direction, built once at module scope.
 *
 * The direction is baked in rather than passed through
 * `slotProps.transition` for three reasons. MUI supplies a `direction`
 * of its own to the transition slot (`vertical === 'top' ? 'down' :
 * 'up'`), so a competing value would depend on slot-merge order to win;
 * `slotProps.transition` is typed as `TransitionProps`, which has no
 * `direction` on it at all; and spreading the incoming props first and
 * setting `direction` after is order-independent either way.
 *
 * Module scope is the other half of it. A component identity created
 * during render is a different component on every render, which remounts
 * the toast mid-transition rather than animating it.
 */
function slideFrom(direction: SlideDirection) {
  function SnackbarSlide(props: SlideProps): React.JSX.Element {
    return <Slide {...props} direction={direction} />;
  }
  SnackbarSlide.displayName = `SnackbarSlide(${direction})`;
  return SnackbarSlide;
}

const SLIDE_TRANSITIONS = {
  down: slideFrom('down'),
  left: slideFrom('left'),
  right: slideFrom('right'),
  up: slideFrom('up'),
} as const;

/**
 * The slide that matches an anchor: in from the nearest edge, back out
 * the same way.
 *
 * `direction` names the way the child *travels*, not the edge it starts
 * at — so the default top-right anchor takes `left`, entering from off
 * the right edge and moving inward. A centred anchor has no near side,
 * so it falls back to the vertical: down from the top, up from the
 * bottom.
 */
function transitionFor(anchorOrigin: SnackbarOrigin) {
  if (anchorOrigin.horizontal === 'center') {
    return anchorOrigin.vertical === 'top'
      ? SLIDE_TRANSITIONS.down
      : SLIDE_TRANSITIONS.up;
  }
  return anchorOrigin.horizontal === 'right'
    ? SLIDE_TRANSITIONS.left
    : SLIDE_TRANSITIONS.right;
}

const StyledSnackbar = styled(MuiSnackbar)({
  minWidth: MIN_WIDTH_PX,
  maxWidth: MAX_WIDTH_PX,
  '& .MuiAlert-root': {
    // The Alert is the whole visible surface, so it takes the width the
    // root was given rather than shrinking to its text inside it.
    width: '100%',
    // The shadow goes here rather than on `Alert` itself: `floating` is
    // a colour treatment, and depth is the separate job of lifting a
    // toast off whatever page content it happens to cover. `medium` is
    // the token for floating surfaces, and what Menu and Tooltip use.
    boxShadow: elevation.medium,
  },
});

/**
 * Transient feedback in the corner of the page — the outcome of
 * something the user just did, reported without interrupting them.
 *
 * Renders an `Alert` in its `floating` treatment inside MUI's
 * `Snackbar`, anchored top right, sliding in from the right edge and
 * dismissing itself after five seconds. Both defaults are the point of
 * the component: the same message rendered by hand comes out in a
 * different corner with a different transition every time.
 *
 * Always the titled alert: the severity icon, a bold `title`, the
 * `message` under it, and an `action` — the same four parts `Alert`
 * already arranges, in the same order, so a toast and the inline alert
 * one screen over read as the same object. The title says what happened
 * and the message says what it means, which is the difference between
 * "Upload failed" and knowing the file was too large.
 *
 * The title falls back to the severity's own word when none is given, so
 * a one-argument `success('Your changes are live.')` still comes out as
 * two lines. Pass `title={null}` for the rare toast that wants one.
 *
 * This is the controlled primitive — you own `open`. For feedback fired
 * from an event handler, which is most of it, use `SnackbarProvider` and
 * `useSnackbar` instead and skip the state entirely.
 *
 * One message at a time. Two toasts stacked in a corner means the second
 * one covers the first, and the design system has no answer for which of
 * them mattered.
 *
 * @example Two lines, which is the shape to write for
 * const [open, setOpen] = React.useState(false);
 *
 * <Snackbar
 *   open={open}
 *   severity="success"
 *   title="Changes saved"
 *   message="Your edits are live for everyone on the team."
 *   onClose={() => setOpen(false)}
 * />
 *
 * @example An error that waits to be read
 * <Snackbar
 *   open={open}
 *   severity="error"
 *   title="Upload failed"
 *   message="The file was larger than the 25 MB limit."
 *   autoHideDuration={null}
 *   onClose={handleClose}
 * />
 *
 * @example Icon, title, message and an action, bottom left
 * <Snackbar
 *   open={open}
 *   severity="info"
 *   title="Item moved to trash"
 *   message="It stays recoverable for 30 days."
 *   anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
 *   action={<Button variant="secondary" size="sm" onClick={handleUndo}>Undo</Button>}
 *   onClose={handleClose}
 * />
 *
 * @see Related: Alert for the same message inline in the page,
 * SnackbarProvider and useSnackbar for the imperative form.
 */
export const Snackbar = React.forwardRef<HTMLDivElement, SnackbarProps>(
  (
    {
      severity = 'info',
      message,
      title,
      action,
      dismissible = true,
      autoHideDuration = DEFAULT_AUTO_HIDE_MS,
      anchorOrigin = DEFAULT_ANCHOR_ORIGIN,
      onClose,
      slots,
      ...rest
    },
    ref
  ) => {
    // MUI's Alert reports a close with the event alone, so the reason
    // has to be supplied here — see `SnackbarCloseReason`.
    const handleAlertClose = React.useCallback(
      (event: React.SyntheticEvent) => {
        onClose?.(event, 'dismiss');
      },
      [onClose]
    );

    const isDismissible = dismissible && onClose !== undefined;

    // Not `??`: `null` is how a caller asks for a single-line toast, and
    // `??` would read it as unset and put the default title back.
    const resolvedTitle =
      title !== undefined ? title : DEFAULT_TITLES[severity];

    // MUI's Alert treats `action` and the close button as one slot, and
    // the action wins — so a toast offering Undo loses the way to put it
    // away early, on the one surface where that matters least and reads
    // worst. Both go in the slot together instead, action first: it is
    // the thing being offered, and the close is the way out of it.
    const composedAction =
      action !== undefined && isDismissible ? (
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          {action}
          <IconButton
            appearance="text"
            variant="secondary"
            size="sm"
            aria-label="Dismiss"
            onClick={handleAlertClose}
            // Inherit the severity's text colour, which is what Alert's
            // own close button does; the neutral role would read as a
            // different control sitting inside a coloured surface.
            sx={{ color: 'inherit' }}
          >
            <AlertCloseIcon />
          </IconButton>
        </Stack>
      ) : (
        action
      );

    return (
      <StyledSnackbar
        ref={ref}
        anchorOrigin={anchorOrigin}
        autoHideDuration={autoHideDuration}
        onClose={onClose}
        slots={{ transition: transitionFor(anchorOrigin), ...slots }}
        {...rest}
      >
        <Alert
          severity={severity}
          floating
          title={resolvedTitle}
          action={composedAction}
          onClose={
            isDismissible && action === undefined ? handleAlertClose : undefined
          }
        >
          {message}
        </Alert>
      </StyledSnackbar>
    );
  }
);

Snackbar.displayName = 'Snackbar';
