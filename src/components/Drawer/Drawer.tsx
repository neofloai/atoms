'use client';

import { Drawer as MuiDrawer, drawerClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import { border, surface } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import { DRAWER_BORDER_WIDTH_PX, drawerWidth } from './drawerMetrics';

import type { DrawerAnchor, DrawerSize } from './Drawer.types';

/**
 * Longhand border-width property for the edge that faces the page,
 * given the edge the drawer is anchored to. A left drawer is separated
 * from the content by its right edge, and so on round.
 *
 * Longhand rather than the `borderRight` shorthand because the colour
 * arrives from `paired` as `borderColor`, and a shorthand written after
 * it would reset that side back to `currentColor`.
 */
const CONTENT_EDGE_WIDTH: Record<
  DrawerAnchor,
  'borderRightWidth' | 'borderLeftWidth' | 'borderBottomWidth' | 'borderTopWidth'
> = {
  left: 'borderRightWidth',
  right: 'borderLeftWidth',
  top: 'borderBottomWidth',
  bottom: 'borderTopWidth',
};

/** Anchors whose extent is a width. `size` applies to these two only. */
function isHorizontal(anchor: DrawerAnchor): boolean {
  return anchor === 'left' || anchor === 'right';
}

/**
 * A panel anchored to an edge of the viewport. Wraps MUI `Drawer` and
 * supplies the treatment the design draws — `surface/layers/card-2`, a
 * 1px `border/layers/card-2` hairline on the edge facing the page, no
 * shadow — plus the one thing MUI leaves to every call site: a width.
 *
 * Everything MUI `Drawer` does survives, including the parts this
 * wrapper does not mention: `anchor`, `variant`, `open` / `onClose`,
 * `transitionDuration`, `hideBackdrop`, and the whole `slots` /
 * `slotProps` tree. A `temporary` drawer is a `Modal`, so it brings the
 * focus trap, the `Escape` handler and the scroll lock with it.
 *
 * ## Chrome sits a rung above content
 *
 * A drawer is not a card, and the design does not paint it like one.
 * `Card` and `Dialog` are `card 1`; the rail and the bar above it are
 * `card 2` — one rung further up the neutral ladder, so a card on the
 * page reads as sitting *on* the app rather than beside it. `Navbar`
 * takes the same pair, which is what lets a bar and a rail meet at the
 * corner with no seam.
 *
 * Read off the shell's own frames: the sidebar binds
 * `surface/layers/card 2` and `border/layers/card 2`, and so does the
 * top bar, independently. The corners are the one thing MUI already
 * gets right — it renders the paper `square`, because a panel flush
 * against the viewport has no outside corner to round.
 *
 * ## What this wrapper changes
 *
 * Three values and one dimension, no behaviour:
 *
 *   - **the surface.** MUI paints the paper from
 *     `palette.background.paper` (`grey/25` light, `grey/1050` dark).
 *     The design's panel is `surface.layers.card2` — `grey/100` and
 *     `grey/950`. Left alone a drawer would sit two rungs off the
 *     design's own value and, in dark mode, read lighter than the page.
 *   - **the edge.** MUI's paper has none, so a docked drawer meets the
 *     content with nothing between them. This draws 1px of
 *     `border.layers.card2` on whichever edge faces the page — the
 *     matched edge for that fill in both schemes, not `palette.divider`,
 *     which in dark mode is `grey/1000` and would read as a shade of the
 *     panel rather than a line on it.
 *   - **the shadow.** MUI renders a `temporary` paper at
 *     `elevation={16}`, plus a lightening `background-image` overlay in
 *     dark mode. Both are overwritten with `none`, on the same reasoning
 *     `Dialog` uses: the backdrop is what separates a temporary panel
 *     from the page, far more strongly than a shadow would, and the
 *     hairline closes the edge. The docked variants were already flat —
 *     MUI passes them `elevation={0}` itself.
 *   - **the width**, which MUI does not set at all. See `size`.
 *
 * `elevation` is left working in the DOM rather than forced to `0`, so a
 * drawer that does want the lift can put it back with
 * `slotProps={{ paper: { sx: { boxShadow: 3 } } }}` without fighting a
 * locked prop.
 *
 * ## Width, and the two places it has to land
 *
 * A drawer with no width is unusable, and MUI ships none — its own demos
 * set one at every call site, on the root *and* on the paper, because
 * the paper is `position: fixed` and reserves no space in the layout.
 * Miss the root and a permanent rail overlaps the page instead of
 * sitting beside it.
 *
 * `size` does both: the paper gets the width, and the docked root gets
 * it too so a `permanent` or `persistent` drawer occupies the space it
 * takes up. A `temporary` root is the modal overlay and is deliberately
 * left alone.
 *
 * It takes pixels as well as the three names, which is what a collapsing
 * rail needs — the folded width is a state, not a fourth rung, and it
 * has to land on both boxes exactly as the named widths do. Changes
 * animate, so `size={collapsed ? 64 : 'sm'}` is the whole mechanism.
 *
 * Do not put the width on `slotProps.paper` instead. Both rules here are
 * descendant selectors, which outrank the single class an `sx` generates
 * — the panel would keep its `size` width and only the reserved space
 * would move.
 *
 * ## A permanent drawer is a viewport-edge element
 *
 * MUI keeps `position: fixed` on the paper for every variant, so a
 * `permanent` drawer pins itself to the edge of the *window*, not of its
 * container. That is right for an app shell and wrong inside a panel;
 * for an in-flow rail, put the paper back in flow with
 * `slotProps={{ paper: { sx: { position: 'relative' } } }}`.
 *
 * @example A detail sheet over the page
 * <Drawer anchor="right" open={selectedId !== null} onClose={handleClose}>
 *   <DrawerHeaderOfYourOwn />
 * </Drawer>
 *
 * @example A permanent nav rail beside the content
 * <Stack direction="row">
 *   <Drawer variant="permanent" size="sm">
 *     <NavOfYourOwn />
 *   </Drawer>
 *   <Box sx={{ flex: 1 }}>{children}</Box>
 * </Stack>
 *
 * @example A rail that folds to icons
 * <Drawer variant="permanent" size={collapsed ? 64 : 'sm'}>
 *   <NavOfYourOwn collapsed={collapsed} />
 * </Drawer>
 *
 * @example A bottom sheet, as tall as its content
 * <Drawer anchor="bottom" open={open} onClose={handleClose}>
 *   <Stack sx={{ p: 3 }}>{actions}</Stack>
 * </Drawer>
 *
 * @see Related: Navbar, Dialog, Card, Menu, Slide
 */
export const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) =>
    prop !== 'size' && prop !== 'disableSizeTransition',
})<{ size?: DrawerSize | number; disableSizeTransition?: boolean }>(
  ({
    theme,
    anchor = 'left',
    size = 'md',
    disableSizeTransition = false,
  }) => {
    const width = drawerWidth(size);
    const horizontal = isHorizontal(anchor);
    // So `size={collapsed ? 64 : 'sm'}` folds a rail rather than snapping
    // it. Declared on both boxes that carry the width, or the panel and the
    // space it sits in would arrive at the new width on different frames.
    const widthTransition = disableSizeTransition
      ? 'none'
      : theme.transitions.create('width');

    return {
      // The docked class is on the root for `permanent` and `persistent`
      // only; a `temporary` root carries `modal` instead and is the
      // full-screen overlay, which must not be narrowed.
      ...(horizontal && {
        [`&.${drawerClasses.docked}`]: {
          width,
          flexShrink: 0,
          transition: widthTransition,
        },
      }),
      [`& .${drawerClasses.paper}`]: {
        ...paired(theme, {
          backgroundColor: surface.layers.card2,
          borderColor: border.layers.card2,
        }),
        borderStyle: 'solid',
        borderWidth: 0,
        [CONTENT_EDGE_WIDTH[anchor]]: DRAWER_BORDER_WIDTH_PX,
        boxShadow: 'none',
        backgroundImage: 'none',
        // `border-box` so the hairline is inside the declared width and a
        // rail measures 220 rather than 221 against the layout beside it.
        // `overflow-x: hidden` so a label wider than a folded rail is
        // clipped by it instead of pushing the panel back open.
        //
        // `max-width` is the guard the scale cannot give: every rung is a
        // fixed pixel width, so a 520px sheet on a 375px screen would run
        // off it. 100% resolves against the viewport for the `fixed` paper
        // MUI ships and against the container for one put back in flow, so
        // it is right in both cases.
        ...(horizontal && {
          width,
          maxWidth: '100%',
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: widthTransition,
        }),
      },
    };
  }
);

Drawer.displayName = 'Drawer';
