'use client';

import {
  DialogActions as MuiDialogActions,
  dialogActionsClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { border } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import {
  DIALOG_ACTIONS_GAP_PX,
  DIALOG_BORDER_WIDTH_PX,
  DIALOG_PADDING_BLOCK_PX,
  DIALOG_PADDING_INLINE_PX,
} from './dialogRegions';

/**
 * The footer of a dialog — the row that closes it. Wraps MUI
 * `DialogActions`.
 *
 * ## What this wrapper adds
 *
 * Three properties, no props:
 *
 *   - **the rule above it.** Figma is the only place in the modal set
 *     that draws a border: 1px across the top of the footer, in
 *     `border/layers/card-1` (nodes 3500:30052, 3500:30053, 3500:30054).
 *     MUI has none. It separates the footer from a body that may have
 *     scrolled under it, which is why the design puts it here and nowhere
 *     else.
 *   - **the padding.** MUI's is 8 on all four sides, a Material number
 *     chosen so a `text` button's own padding can reach the dialog edge.
 *     Figma's footer sits in the same 24px gutter as the title and the
 *     content, with `Scale/300` on the block axis.
 *   - **the gap.** 4px rather than MUI's 8 — see `DIALOG_ACTIONS_GAP_PX`
 *     for why the design halves it here. Written against MUI's own
 *     `spacing` class so `disableSpacing` still turns it off.
 *
 * `justifyContent` is left at MUI's `flex-end`, which is where Figma puts
 * the buttons.
 *
 * ## The leading description is a composition
 *
 * Two of Figma's three footer cells put text at the leading edge — one
 * line in `1-line` and `icon-button`, two in `2-line` — with the actions
 * pushed to the far side. That is not a prop here. MUI's `DialogActions`
 * is a flex row and has no slot for a label, so the row is built the way
 * MUI builds every other split row: put the text in first and open the
 * space up.
 *
 * Reach for `sx={{ justifyContent: 'space-between' }}`, which is what the
 * examples below do, and group the buttons so the 4px between them
 * survives.
 *
 * @example The `1-line` cell, actions only
 * <DialogActions>
 *   <Button appearance="text" variant="secondary" size="sm" onClick={handleClose}>Cancel</Button>
 *   <Button size="sm" onClick={handleSave}>Save changes</Button>
 * </DialogActions>
 *
 * @example The same cell with its description
 * <DialogActions sx={{ justifyContent: 'space-between' }}>
 *   <Typography variant="body2" color="text.secondary">Last saved 4 minutes ago</Typography>
 *   <Stack direction="row" spacing={0.5}>
 *     <Button appearance="text" variant="secondary" size="sm" onClick={handleClose}>Cancel</Button>
 *     <Button size="sm" onClick={handleSave}>Save changes</Button>
 *   </Stack>
 * </DialogActions>
 *
 * @example The `icon-button` cell
 * <DialogActions sx={{ justifyContent: 'space-between' }}>
 *   <Typography variant="body2" color="text.secondary">Invoice #4021</Typography>
 *   <Stack direction="row" spacing={0.5}>
 *     <IconButton variant="secondary" size="sm" aria-label="Duplicate"><CopySimpleIcon /></IconButton>
 *     <IconButton variant="secondary" size="sm" aria-label="Delete"><TrashSimpleIcon /></IconButton>
 *     <IconButton variant="secondary" size="sm" aria-label="Send"><PaperPlaneTiltIcon /></IconButton>
 *   </Stack>
 * </DialogActions>
 *
 * @see Related: Dialog, DialogTitle, DialogContent, Button, IconButton
 */
export const DialogActions = styled(MuiDialogActions)(({ theme }) => ({
  // Whether a footer that carries a description in two of its three cells
  // is asking for more than a bare row is open — see DESIGNER_QUESTIONS.md
  // #44. Kept as a `//` note rather than in the JSDoc above, which ships
  // in `dist/index.d.ts`.
  paddingTop: DIALOG_PADDING_BLOCK_PX,
  paddingBottom: DIALOG_PADDING_BLOCK_PX,
  paddingLeft: DIALOG_PADDING_INLINE_PX,
  paddingRight: DIALOG_PADDING_INLINE_PX,
  borderTopWidth: DIALOG_BORDER_WIDTH_PX,
  borderTopStyle: 'solid',
  ...paired(theme, { borderTopColor: border.layers.card1 }),

  // MUI writes its 8px gap as a margin on every child after the first,
  // scoped to the `spacing` class it drops when `disableSpacing` is set.
  // Restated at the same shape one class heavier, so 4px wins on
  // specificity rather than on Emotion's insertion order — and so
  // `disableSpacing` keeps working.
  [`&.${dialogActionsClasses.spacing} > :not(style) ~ :not(style)`]: {
    marginLeft: DIALOG_ACTIONS_GAP_PX,
  },
}));

DialogActions.displayName = 'DialogActions';
