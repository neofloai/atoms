'use client';

import {
  DialogContent as MuiDialogContent,
  dialogContentClasses,
  dialogTitleClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { border } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import {
  DIALOG_BORDER_WIDTH_PX,
  DIALOG_PADDING_BLOCK_PX,
  DIALOG_PADDING_INLINE_PX,
} from './dialogRegions';

/**
 * The body of a dialog — the region between the title and the actions.
 * Wraps MUI `DialogContent`.
 *
 * Figma's content region (node 3500:30637) is a bare padded box: 24px
 * inline, 16px block, no border, no fill of its own. What goes in it is
 * the `modal-items` set beside the modal — a dropdown, a text field, a
 * chip row, an alert, an upload area — which is to say, existing
 * components. So this region carries padding and nothing else, and the
 * cells of that set are composition rather than props here.
 *
 * ## What this wrapper adds
 *
 * Two numbers and one colour, no props:
 *
 *   - **the padding.** MUI's is `20px 24px`; Figma's block axis is
 *     `Scale/300`. The inline axis already agrees.
 *   - **the padding above, after a title.** MUI zeroes it — its own
 *     `DialogTitle` closes with 16px, so 16 + 20 would be too much of a
 *     gap. Figma closes the title with `Scale/200` (8px) instead and keeps
 *     the content's own 16, which puts 24px between a subtitle and the
 *     first field under it. So the rule is put back rather than inherited.
 *   - **the `dividers` rules.** MUI draws them in `palette.divider`,
 *     which in dark mode is `grey/1000` — the exact colour of the dark
 *     panel they would be drawn on, so they do not render at all. They
 *     use `border/layers/card-1` here, the matched edge for that fill in
 *     both schemes and the same token the panel's own hairline and the
 *     footer's rule use. This is the third component to need that
 *     correction, after `Card` and `Divider`.
 *
 * `dividers` itself is left alone as a capability. Figma does not draw a
 * dialog with a rule above its content — the only rule in the set is the
 * footer's — but a long scrolling body is exactly what the prop is for,
 * and a wrong colour was a better thing to fix than a working prop was to
 * remove.
 *
 * @example A body with text in it
 * <DialogContent>
 *   <DialogContentText>
 *     Everything in this workspace is removed permanently.
 *   </DialogContentText>
 * </DialogContent>
 *
 * @example A body with fields in it
 * <DialogContent>
 *   <Stack spacing={3}>
 *     <TextField label="Name" fullWidth />
 *     <TextField label="Email" fullWidth />
 *   </Stack>
 * </DialogContent>
 *
 * @example A long body that scrolls between two rules
 * <DialogContent dividers>{rows}</DialogContent>
 *
 * @see Related: Dialog, DialogTitle, DialogContentText, DialogActions
 */
export const DialogContent = styled(MuiDialogContent)(({ theme }) => ({
  paddingTop: DIALOG_PADDING_BLOCK_PX,
  paddingBottom: DIALOG_PADDING_BLOCK_PX,
  paddingLeft: DIALOG_PADDING_INLINE_PX,
  paddingRight: DIALOG_PADDING_INLINE_PX,

  // The doubled `&&` is deliberate. MUI's own rule for this selector is
  // written at the same specificity, and which of two equal rules wins
  // comes down to the order Emotion inserts them — which for a wrapper
  // around an already-styled component is not the order they are written
  // in. Doubling the class settles it without depending on insertion
  // order. Same fix the picker field uses on its focused outline.
  [`.${dialogTitleClasses.root} + &&`]: {
    paddingTop: DIALOG_PADDING_BLOCK_PX,
  },

  [`&&.${dialogContentClasses.dividers}`]: {
    borderTopWidth: DIALOG_BORDER_WIDTH_PX,
    borderBottomWidth: DIALOG_BORDER_WIDTH_PX,
    borderTopStyle: 'solid',
    borderBottomStyle: 'solid',
    ...paired(theme, {
      borderTopColor: border.layers.card1,
      borderBottomColor: border.layers.card1,
    }),
  },
}));

DialogContent.displayName = 'DialogContent';
