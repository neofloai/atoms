'use client';

import {
  Menu as MuiMenu,
  dividerClasses,
  listSubheaderClasses,
  menuClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { border, elevation, radius, spacing, surface } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import { modePair } from '../_shared/devMarks';

/**
 * The panel's fill.
 *
 * The navigation flyouts (4564:6122, 4564:6369) fill the panel with a
 * literal white rather than a variable. The nearest token is
 * `surface.layers.page` — `grey/50`, `#fdfdfc`, the surface the same
 * sheet binds for the selected thumb of its theme switch and the Ask Neo
 * button — and the light half is that.
 *
 * The page's dark half is `grey/1075`, *darker* than the `card 2` bar
 * and rail the menu drops out of, so a dark menu would read as a hole
 * rather than a panel. The dark half stays on `card 2`, which is what the
 * menu has always been in dark mode. See DESIGNER_QUESTIONS.md #71.
 */
const PANEL_FILL = modePair(surface.layers.page, surface.layers.card2);

/**
 * Branded menu surface. Wraps MUI `Menu` with the floating panel the
 * navigation flyouts draw (node 4564:6122): a near-white surface, a 1px
 * `card 2` border, 8px corners, a 4px inset around the items, 4px
 * between them, and the `Shadow/medium` elevation.
 *
 * Every MUI prop survives, because there is nothing to rename. The
 * panel has no variant axis in Figma, so this is styling only —
 * positioning (`anchorEl`, `anchorOrigin`, `transformOrigin`), focus
 * behaviour (`autoFocus`, `disableAutoFocusItem`, MUI's own `variant`),
 * the transition, and `slots` / `slotProps` all behave exactly as
 * documented for MUI `Menu`. Options are `MenuItem`s passed as
 * children, and everything MUI composes inside a menu — `Divider`,
 * `ListSubheader`, `ListItemIcon`, `ListItemText` — still works.
 *
 * Values that come off the token scale rather than MUI's defaults:
 *
 *   - the fill is `surface.layers.page` in light and `card 2` in dark
 *     (see `PANEL_FILL`), and the border `border.layers.card2`
 *   - 8px corners (`radius.sm` / Figma `Scale/200`), against the 16px
 *     the earlier menu sheet drew
 *   - a 4px inset (`spacing.component.xxs` / `Scale/100`) on the panel,
 *     with the list's own padding zeroed, and the same 4px between
 *     items — the flyout stacks its rows with `Scale/100`
 *   - a `Divider` between groups gets 4px either side, which with the
 *     list's gap puts the rule 8px from the rows around it, as drawn
 *   - a `ListSubheader` — the house one, the sheet's mono section label —
 *     lines up with the item labels below and takes the panel's fill
 *   - `elevation.medium` rather than MUI's `theme.shadows[8]`. The
 *     flyout draws a deeper, unnamed shadow; the house rung for a
 *     dropdown is kept until that is named (DESIGNER_QUESTIONS.md #71)
 *
 * Overriding the panel needs a descendant selector, because these
 * styles are one specificity step above a slot's own `sx`:
 *
 *   <Menu sx={{ [`& .${menuClasses.paper}`]: { width: 240 } }} />
 *
 * @example Anchored to a button
 * const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
 *
 * <Button onClick={(e) => setAnchorEl(e.currentTarget)}>Actions</Button>
 * <Menu
 *   anchorEl={anchorEl}
 *   open={Boolean(anchorEl)}
 *   onClose={() => setAnchorEl(null)}
 * >
 *   <MenuItem onClick={() => setAnchorEl(null)}>Rename</MenuItem>
 *   <MenuItem variant="action" onClick={() => setAnchorEl(null)}>
 *     New folder
 *   </MenuItem>
 * </Menu>
 *
 * @example A labelled section
 * <Menu anchorEl={anchorEl} open={open} onClose={close}>
 *   <ListSubheader>Workspaces</ListSubheader>
 *   <MenuItem selected onClick={close}>Finance</MenuItem>
 *   <MenuItem onClick={close}>Procurement</MenuItem>
 * </Menu>
 *
 * @see Related: MenuItem, Select
 */
export const Menu = styled(MuiMenu)(({ theme }) => ({
  [`& .${menuClasses.paper}`]: {
    borderRadius: radius.sm,
    padding: spacing.component.xxs,
    borderWidth: 1,
    borderStyle: 'solid',
    boxShadow: elevation.medium,
    // MUI tints elevated `Paper` in dark mode with an overlay
    // gradient keyed off the elevation. Our surface token already
    // carries its own dark value, so the overlay would double-tint it.
    backgroundImage: 'none',
    ...paired(theme, {
      backgroundColor: PANEL_FILL,
      borderColor: border.layers.card2,
    }),
  },
  // The inset lives on the panel, so MUI's `8px 0` on the list goes.
  // The 4px between rows is a flex gap rather than a margin on each
  // item, so it cannot double up against a divider's own margin.
  [`& .${menuClasses.list}`]: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.component.xxs,
  },
  // A standalone `Divider` between groups is MUI's own component, so it
  // paints from `palette.divider`. In dark mode that token is *darker*
  // than the panel it sits on (`grey/1000` on `grey/950`), so the rule
  // reads as a smudge rather than a line. The panel's own border token
  // is the right hairline here, and it makes a standalone `Divider`
  // agree with `<MenuItem divider />`, which is styled to match.
  //
  // MUI gives a divider after an item 8px above and below; with the
  // list's 4px gap on either side that would be 12. 4 + 4 is the 8 the
  // flyout draws.
  [`& .${menuClasses.list} .${dividerClasses.root}`]: {
    marginBlock: spacing.component.xxs,
    ...paired(theme, { borderColor: border.layers.card2 }),
  },
  // The section label — "Workspaces" over the switcher's rows. Its type
  // is `ListSubheader`'s own; what changes inside a panel is where it
  // sits. 12px from the panel's edge (4 of inset + 8 here) lines it up
  // with the item labels' 8px gutter, where a list's rows sit 16 in, and
  // the 8px under it plus the list gap is the sheet's 12 between the
  // label and the first row.
  //
  // Through the list's class as well as the label's, so this outranks
  // the component's own `gutters` padding rather than tying with it.
  // Filled with the panel, so a long list scrolls *under* a sticky label
  // rather than through it.
  [`& .${menuClasses.list} .${listSubheaderClasses.root}`]: {
    padding: `${spacing.component.xxs}px ${spacing.component.xs}px ${spacing.component.xs}px`,
    ...paired(theme, { backgroundColor: PANEL_FILL }),
  },
}));

Menu.displayName = 'Menu';
