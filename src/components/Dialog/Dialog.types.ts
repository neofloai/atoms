import type * as React from 'react';
import type {
  DialogActionsProps as MuiDialogActionsProps,
  DialogContentProps as MuiDialogContentProps,
  DialogContentTextProps as MuiDialogContentTextProps,
  DialogProps as MuiDialogProps,
  DialogTitleProps as MuiDialogTitleProps,
} from '@mui/material';
import type { IconButtonProps } from '../IconButton';

/**
 * Props for the Neoflo `Dialog` — the modal panel.
 *
 * Identical to MUI's `DialogProps`, with nothing added and nothing
 * removed. The wrapper changes three values on the paper — fill, border,
 * shadow — and no part of the API, so `open`, `onClose`, `maxWidth`,
 * `fullWidth`, `fullScreen`, `scroll`, `role`, and the `slots` /
 * `slotProps` tree all behave exactly as documented by MUI.
 *
 * Unlike `Card`, nothing is locked shut here. The paper's `elevation` is
 * reachable through `slotProps.paper` and is left working on purpose —
 * see the note on shadows in `Dialog.tsx`.
 */
export type DialogProps = MuiDialogProps;

/**
 * Typography props the dialog title locks shut.
 *
 * `component` and `variant` would both type-check and then break the
 * structure the title composes: the root has to stay a `div` because it
 * contains an `h2`, a `p` and a button, and the type ramp is applied to
 * those children rather than to the root, so a `variant` on the root
 * would style nothing. `ref` goes with them because this wrapper is a
 * `forwardRef` and supplies its own.
 */
type LockedTitleProp = 'component' | 'variant' | 'ref';

/**
 * Props for the Neoflo `DialogTitle` — the heading block.
 *
 * MUI's `DialogTitleProps` minus the three locked props (see
 * `LockedTitleProp`), plus the three content slots Figma's `modal-title`
 * set draws in every cell and MUI's single `Typography` has no room for.
 *
 * `children` stays the title, as in MUI. Everything else Typography
 * accepts — `sx`, `className`, `classes`, `align`, `noWrap` — still works.
 */
export interface DialogTitleProps
  extends Omit<MuiDialogTitleProps, LockedTitleProp> {
  /**
   * The second line, under the title. Figma's `2-line` cell (node
   * 3500:30050); omit it for the `1-line` cell.
   *
   * Named for the layer Figma names rather than `CardHeader`'s
   * `subheader` — a dialog title is not a header, and MUI itself has no
   * one convention here (`CardHeader` says `subheader`, `ListItemText`
   * says `secondary`).
   */
  subtitle?: React.ReactNode;
  /**
   * A glyph, shown in a 44px primary badge above the title. Figma's
   * `icon` cell (node 3500:30048). Pass the icon itself, not a button —
   * the badge around it is drawn by the title, and it is decoration
   * rather than a control. See `IconBadge` in `DialogTitle.tsx`.
   */
  icon?: React.ReactNode;
  /**
   * Renders the close button at the trailing edge and fires when it is
   * clicked. Omit it and no button renders — the same way `Alert`
   * decides whether to show its own close affordance.
   *
   * Usually the same handler `Dialog`'s `onClose` gets. That one is
   * called with a `reason` as its second argument, and this one is not,
   * so a handler written for `Dialog` can be passed straight in.
   */
  onClose?: React.MouseEventHandler<HTMLButtonElement>;
  /**
   * Props forwarded to the close button, for the cases its defaults do
   * not cover — a translated label, or a `tabIndex`. It is an
   * `IconButton`, so it takes the full house API.
   *
   * `onClick` is not overridable: it is `onClose`.
   */
  slotProps?: {
    closeButton?: Partial<Omit<IconButtonProps, 'onClick'>>;
  };
}

/**
 * Props for the Neoflo `DialogContent` — the body region.
 *
 * Identical to MUI's. The wrapper changes the block padding, puts back
 * the top padding MUI drops after a title, and recolours `dividers`; it
 * adds no props. `dividers` still works.
 */
export type DialogContentProps = MuiDialogContentProps;

/**
 * Props for the Neoflo `DialogContentText` — a paragraph of body copy.
 *
 * Identical to MUI's. The wrapper carries the type ramp and the colour,
 * not a new API.
 */
export type DialogContentTextProps = MuiDialogContentTextProps;

/**
 * Props for the Neoflo `DialogActions` — the footer row.
 *
 * Identical to MUI's `DialogActionsProps`, which is not polymorphic: MUI
 * declares it as a plain `div` with no `component` prop. `disableSpacing`
 * still turns off the gap between children.
 */
export type DialogActionsProps = MuiDialogActionsProps;
