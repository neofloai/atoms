'use client';

import { Dialog as MuiDialog, dialogClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import { border, surface } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import { DIALOG_BORDER_WIDTH_PX, DIALOG_RADIUS_PX } from './dialogRegions';

/**
 * A modal panel that interrupts the page to ask for a decision. Wraps MUI
 * `Dialog` and supplies the shell Figma draws (node 3500:30638) —
 * `surface/layers/card-1` behind a 1px `border/layers/card-1`, corners at
 * 16px, no shadow — then leaves what goes inside to `DialogTitle`,
 * `DialogContent`, and `DialogActions`.
 *
 * Everything MUI `Dialog` does survives, including the parts this wrapper
 * does not mention: `open` / `onClose`, `fullScreen`, `fullWidth`,
 * `maxWidth`, `scroll`, `role="alertdialog"`, `disableEscapeKeyDown`, the
 * `transition` slot, and the whole `slots` / `slotProps` tree.
 *
 * ## The panel is Card's shell, to the token
 *
 * All three values — fill, border, radius — are the ones node 3648:24947
 * draws on a card, so this reads the same tokens `Card.tsx` does. Worth
 * stating because it means a dialog and a card sitting on the same page
 * cannot drift apart, and because it makes the *absence* below deliberate
 * rather than an oversight.
 *
 * ## What this wrapper changes
 *
 * Three of MUI's values, no props:
 *
 *   - **the surface.** MUI paints the paper from
 *     `palette.background.paper` (`grey/25` light, `grey/1050` dark). The
 *     design's panel is `surface.layers.card1` — `grey/75` and
 *     `grey/1000`. Left alone a dialog would sit a rung off every card in
 *     the system.
 *   - **the border.** MUI's paper has none. Figma strokes the panel at
 *     1px in `border/layers/card-1`, the matched edge for that fill in
 *     both schemes — not `palette.divider`, which in dark mode is
 *     `grey/1000`, exactly the colour of the dark panel it would sit on.
 *   - **the shadow.** MUI renders the paper at `elevation={24}`, which is
 *     the heaviest shadow in the scale plus, in dark mode, a lightening
 *     `background-image` overlay. Figma draws neither, so both are
 *     overwritten with `none`.
 *
 * ## Why the panel is flat
 *
 * A dialog usually earns a shadow because it has to read as floating above
 * the page. Here the *backdrop* does that job — it dims everything behind
 * the panel, which separates the two far more strongly than a shadow
 * would, and it is the reason the design can get away with the same flat
 * edge a card uses. Elevation is left at MUI's `24` in the DOM rather than
 * forced to `0`, so a caller who does want the lift can put it back with
 * `slotProps={{ paper: { sx: { boxShadow: 3 } } }}` without fighting a
 * prop that has been locked.
 *
 * The backdrop is MUI's, unchanged — black at 50%, which reads correctly
 * in both colour schemes. `slotProps.backdrop` is the seam if a dialog
 * needs a different scrim.
 *
 * ## Width
 *
 * `maxWidth` / `fullWidth` / `fullScreen` are MUI's, untouched, and the
 * default (`'sm'`, 600px) stands. Set `fullWidth` on any dialog with
 * fields in it so the panel holds one width instead of resizing as the
 * content changes, and drive `fullScreen` from `useMediaQuery` rather than
 * setting it outright.
 *
 * @example A confirmation
 * <Dialog open={open} onClose={handleClose}>
 *   <DialogTitle onClose={handleClose}>Delete workspace?</DialogTitle>
 *   <DialogContent>
 *     <DialogContentText>
 *       Everything in it is removed permanently. This cannot be undone.
 *     </DialogContentText>
 *   </DialogContent>
 *   <DialogActions>
 *     <Button appearance="text" variant="secondary" size="sm" onClick={handleClose}>Cancel</Button>
 *     <Button size="sm" variant="error" onClick={handleDelete}>Delete</Button>
 *   </DialogActions>
 * </Dialog>
 *
 * @example A form, at the width its fields need
 * <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
 *   <DialogTitle subtitle="They will get an email invitation." onClose={handleClose}>
 *     Invite a teammate
 *   </DialogTitle>
 *   <DialogContent>
 *     <TextField label="Email" fullWidth />
 *   </DialogContent>
 *   <DialogActions>
 *     <Button size="sm" onClick={handleSend}>Send invite</Button>
 *   </DialogActions>
 * </Dialog>
 *
 * @example Full screen on small viewports
 * const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
 *
 * <Dialog open={open} onClose={handleClose} fullScreen={fullScreen}>…</Dialog>
 *
 * @see Related: DialogTitle, DialogContent, DialogContentText, DialogActions, Card, Button
 */
export const Dialog = styled(MuiDialog)(({ theme }) => ({
  [`& .${dialogClasses.paper}`]: {
    ...paired(theme, {
      backgroundColor: surface.layers.card1,
      borderColor: border.layers.card1,
    }),
    borderWidth: DIALOG_BORDER_WIDTH_PX,
    borderStyle: 'solid',
    borderRadius: DIALOG_RADIUS_PX,
    boxShadow: 'none',
    backgroundImage: 'none',
  },
  // MUI squares the corners when `fullScreen` is set, from a rule on the
  // paper's own class — one specificity rung below the descendant selector
  // above, which would otherwise put the 16px radius back on a panel that
  // has no outside edge to round. Restated at matching specificity and
  // declared after it so `fullScreen` still wins.
  [`& .${dialogClasses.paperFullScreen}`]: {
    borderRadius: 0,
  },
}));

Dialog.displayName = 'Dialog';
