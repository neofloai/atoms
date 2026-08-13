'use client';

import { DialogContentText as MuiDialogContentText } from '@mui/material';
import { styled } from '@mui/material/styles';

import { fontWeights, text, typography } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';

/** Figma's body copy rung, the same `Sans/B1/Regular` the subtitle uses. */
const bodyType = typography.body.b1;

/**
 * A paragraph of body copy inside `DialogContent`. Wraps MUI
 * `DialogContentText`.
 *
 * Use it for the sentence or two that explains what a dialog is asking —
 * the "Everything in it is removed permanently" under a "Delete
 * workspace?" title. Anything that is not prose (fields, a list, a table)
 * goes straight into `DialogContent` without this.
 *
 * ## What this wrapper adds
 *
 * The type ramp and the colour, no props. MUI renders a `<p>` at
 * `variant="body1"` in `palette.text.secondary`, and neither is the
 * design's: `body1` is 16px against Figma's 13, and the descriptive copy
 * in the modal set is `text/default/b1` — `grey/800` light, `grey/300`
 * dark — a rung darker than `text.secondary` in light mode and four rungs
 * off in dark.
 *
 * Figma has no cell for this text: the `modal-items` set covers fields and
 * chips and an alert, not prose. But both places the set *does* set a
 * sentence — the title's subtitle and the footer's description — use
 * `Sans/B1/Regular`, so that is the rung a dialog's own body copy takes
 * rather than a new one.
 *
 * The colour is written at doubled specificity because MUI applies its own
 * through Typography's `color` prop, which lands in a different class at
 * the same weight; which one wins would otherwise come down to the order
 * Emotion inserts the two.
 *
 * @example Under a title
 * <DialogContent>
 *   <DialogContentText>
 *     Everything in this workspace is removed permanently. This cannot be undone.
 *   </DialogContentText>
 * </DialogContent>
 *
 * @see Related: Dialog, DialogTitle, DialogContent, Typography
 */
export const DialogContentText = styled(MuiDialogContentText)(({ theme }) => ({
  '&&': {
    fontSize: bodyType.size,
    fontWeight: fontWeights.regular,
    lineHeight: `${bodyType.leading}px`,
    letterSpacing: `${bodyType.letterSpacing}em`,
    ...paired(theme, { color: text.default.body }),
  },
}));

DialogContentText.displayName = 'DialogContentText';
