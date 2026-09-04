'use client';

import * as React from 'react';
import { AppBar as MuiAppBar, Toolbar } from '@mui/material';
import { styled } from '@mui/material/styles';

import { border, spacing, surface, text } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';

import type { NavbarProps, NavbarSize } from './Navbar.types';

/**
 * Height of the bar, in pixels, per `size`.
 *
 * `sm` is the Vendor Query shell's top bar: a 24px control with 12px
 * above and below it. `md` is the page header from the UI experiment
 * frame — 12px above and below a 48px block, which is what a 28px title
 * over a 16px line of context needs.
 *
 * Both are flat across every breakpoint, which is a departure from MUI:
 * `theme.mixins.toolbar` steps 56 up to 64 at `sm`, and MUI's `dense`
 * toolbar is the one that holds 48 everywhere. That is why the row below
 * renders `dense` — at `sm` the two then agree, so nothing is fighting a
 * media query it cannot outrank, and at `md` one flat override is enough.
 *
 * Exported because two layout problems need the number and cannot read
 * it off the DOM:
 *
 *   - a `fixed` or `absolute` bar is out of flow, so the page under it
 *     needs a spacer of exactly this height, and
 *   - anything that has to share a baseline with the bar's contents —
 *     the first row of a rail beside it, typically the brand mark — has
 *     to be this tall too.
 *
 * Both would otherwise be a hardcoded number in every app.
 */
export const NAVBAR_HEIGHT_PX: Record<NavbarSize, number> = {
  sm: 48,
  md: 72,
};

/**
 * Inline gutter. `Scale/400`, the same 24px the shell's bar carries and
 * the same inset `Dialog` uses on its own regions, so a bar above a
 * dialog-width panel shares its left edge.
 *
 * Applied here rather than left to MUI, which ramps its gutter 16 -> 24
 * at `sm`. The row is rendered with `disableGutters` and this padding
 * instead, so one flat value wins outright.
 */
const NAVBAR_PADDING_INLINE_PX = spacing.component.md;

/** Width of the rule under the bar — the only edge it draws. */
const NAVBAR_BORDER_WIDTH_PX = 1;

const NavbarRoot = styled(MuiAppBar)(({ theme }) => ({
  ...paired(theme, {
    backgroundColor: surface.layers.card2,
    color: text.default.body,
    borderColor: border.layers.card2,
  }),
  borderStyle: 'solid',
  borderWidth: 0,
  borderBottomWidth: NAVBAR_BORDER_WIDTH_PX,
  boxShadow: 'none',
  backgroundImage: 'none',
}));

interface NavbarToolbarProps {
  neofloGutters?: boolean;
  neofloSize?: NavbarSize;
}

const NavbarToolbar = styled(Toolbar, {
  shouldForwardProp: (prop) =>
    prop !== 'neofloGutters' && prop !== 'neofloSize',
})<NavbarToolbarProps>(({ neofloGutters = true, neofloSize = 'sm' }) => ({
  minHeight: NAVBAR_HEIGHT_PX[neofloSize],
  paddingInline: neofloGutters ? NAVBAR_PADDING_INLINE_PX : 0,
}));

/**
 * The bar across the top of an app — brand, page context, and the
 * actions that belong to the whole screen rather than to anything on it.
 *
 * Wraps MUI `AppBar` with its `Toolbar` folded in, because the two are
 * never useful apart: `AppBar` is a `Paper` that knows how to stick to
 * the top, and `Toolbar` is the row that gives its children a height, a
 * gutter and a baseline. Children go in the row.
 *
 * ## One locked treatment, no colour axis
 *
 * MUI's `AppBar` defaults to a saturated `primary` fill with white
 * content, which is Material's signature and not this design's. The bar
 * is `surface.layers.card2` closed by a 1px `border.layers.card2` rule
 * along the bottom and nothing else — both read straight off the shell's
 * own bar frame.
 *
 * That is a rung above the `card 1` a `Card` or a `Dialog` takes, and
 * deliberately so: chrome sits above content on the neutral ladder, so a
 * card on the page reads as sitting *on* the app. `Drawer` binds the same
 * pair — its own frame names them independently — which is what lets a
 * bar and a rail meet at the corner with no seam.
 *
 * That is one treatment rather than a prop, the same way `Card` has no
 * variant: `color`, `enableColorOnDark`, `variant` and `square` are
 * removed from the type rather than left to type-check and render
 * nothing. See `LockedBarProp` in `Navbar.types.ts`.
 *
 * The shadow goes with them — `box-shadow: none`, plus `none` for the
 * lightening `background-image` MUI's `Paper` adds in dark mode. The rule
 * does the separating. `elevation` is not locked, though: `sx={{
 * boxShadow: 2 }}` still lifts the bar off a page scrolling under it,
 * which is the one case a flat bar reads badly.
 *
 * ## It does not float by default
 *
 * `position` defaults to `static`, not MUI's `fixed`. A fixed bar is out
 * of flow, so the page needs a spacer of exactly the bar's height under
 * it or the first paragraph starts behind the bar — a footgun to inherit
 * as a default. `static` puts the bar in flow above the content, which is
 * what an app shell wants; `sticky` is the one to reach for when the bar
 * should stay put as the page scrolls. MUI's full union still works.
 *
 * ## Laying out the row
 *
 * The row is a flex container with no gap of its own, as MUI's is —
 * spacing between children is composition, so a brand on the left and a
 * cluster of actions on the right is a `Box sx={{ flex: 1 }}` or an
 * `sx={{ ml: 'auto' }}` between them, and a tight group of icon buttons
 * chooses its own gap rather than inheriting one meant for a brand.
 *
 * @example An app bar with a title and trailing actions
 * <Navbar>
 *   <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Query log</Typography>
 *   <Box sx={{ flex: 1 }} />
 *   <IconButton variant="secondary" appearance="text" aria-label="Search">
 *     <MagnifyingGlassIcon />
 *   </IconButton>
 *   <Avatar size="sm">AV</Avatar>
 * </Navbar>
 *
 * @example Staying put as the page scrolls
 * <Navbar position="sticky" sx={{ boxShadow: 2 }}>…</Navbar>
 *
 * @example A real nav landmark, flush to the page edge
 * <Navbar disableGutters slotProps={{ toolbar: { component: 'nav' } }}>…</Navbar>
 *
 * @see Related: Drawer, Tabs, IconButton, Avatar, Menu
 */
export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      position = 'static',
      size = 'sm',
      disableGutters = false,
      slotProps,
      children,
      ...rest
    },
    ref
  ) => (
    <NavbarRoot
      ref={ref}
      position={position}
      // `inherit` is the one `color` value that sets no fill of its own —
      // every other value, `transparent` included, writes a
      // `background-color` this wrapper would then have to outrank.
      color="inherit"
      elevation={0}
      {...rest}
    >
      <NavbarToolbar
        variant="dense"
        disableGutters
        neofloGutters={!disableGutters}
        neofloSize={size}
        {...slotProps?.toolbar}
      >
        {children}
      </NavbarToolbar>
    </NavbarRoot>
  )
);

Navbar.displayName = 'Navbar';
