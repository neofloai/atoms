import type { DrawerProps as MuiDrawerProps } from '@mui/material';

/**
 * Edge the drawer belongs to. MUI's own union, re-exported under the
 * house name so a consumer typing a wrapper of their own does not have
 * to reach into `@mui/material` for it.
 */
export type DrawerAnchor = NonNullable<MuiDrawerProps['anchor']>;

/**
 * How the drawer relates to the page: floating over it, pushing it
 * aside, or permanently beside it.
 *
 * MUI's union, kept verbatim. `variant` on a Neoflo component usually
 * means a colour role, and here it does not — but these three words
 * describe structure rather than a Material treatment, they are what
 * anyone who has used MUI's Drawer already knows them as, and `Divider`
 * has the same structural `variant` for the same reason. Renaming would
 * cost recognition and buy nothing.
 */
export type DrawerVariant = NonNullable<MuiDrawerProps['variant']>;

/**
 * Named panel widths. Three shipped numbers rather than an invented
 * ladder — see `DRAWER_WIDTH_PX` in `drawerMetrics.ts` for where each
 * comes from. `size` also takes a raw pixel number, for the two widths
 * that are states rather than rungs: a collapsed rail and a resized
 * sheet.
 */
export type DrawerSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Neoflo `Drawer` — a panel anchored to an edge of the
 * viewport.
 *
 * MUI's `DrawerProps` with nothing removed and one prop added. The
 * wrapper changes values (surface, edge, shadow) and supplies the width
 * MUI leaves to every call site; it changes no behaviour, so `anchor`,
 * `variant`, `open` / `onClose`, `transitionDuration`, `hideBackdrop`,
 * `keepMounted` via `slotProps.root`, and the whole `slots` /
 * `slotProps` tree all behave exactly as MUI documents.
 *
 * `elevation` is left reachable rather than locked, for the same reason
 * it is on `Dialog`: the panel is drawn flat, and a caller who wants the
 * lift back can put it on the paper directly. See `Drawer.tsx`.
 */
export interface DrawerProps extends MuiDrawerProps {
  /**
   * Width of the panel — a name off the scale, or pixels.
   *
   * It lands in two places: the panel itself, and the space a docked
   * drawer reserves in the layout. That is why the width is a prop
   * rather than something to put on `slotProps.paper` — half of it
   * would be missing, and a rule written from inside the component
   * outranks a caller's `sx` anyway.
   *
   * Changes to it animate, so a rail that folds is
   * `size={collapsed ? 64 : 'sm'}` and nothing else.
   *
   * Ignored on `top` and `bottom` anchors, where the height follows the
   * content — MUI's own behaviour, and the right one: a bottom sheet is
   * as tall as what is in it.
   *
   * @default 'md'
   */
  size?: DrawerSize | number;
  /**
   * Turn off the width animation.
   *
   * For a drawer whose width is dragged rather than switched — a resize
   * handle on the panel's leading edge. A transition there lags the
   * pointer by a frame and the sheet feels loose, so a drag sets this
   * while it is in progress and clears it afterwards, keeping the
   * animation for any width change that is not a drag.
   *
   * It is a prop rather than something to put on `slotProps.paper`, for
   * the same reason `size` is: the rule it turns off is a descendant
   * selector, which an `sx` cannot outrank.
   *
   * @default false
   */
  disableSizeTransition?: boolean;
}
