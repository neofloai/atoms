'use client';

import { Menu as MuiMenu, dividerClasses, menuClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import { border, elevation, radius, spacing, surface } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';

/**
 * Branded menu surface. Wraps MUI `Menu` with the floating panel from
 * the Product Design System Figma (node 3228:62331, `float=True`): a
 * `card 2` surface, a 1px `card 2` border, 16px corners, a 4px inset
 * around the items, and the `Shadow/medium` elevation.
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
 * Four values come off the token scale rather than MUI's defaults:
 *
 *   - the surface and border are both `layers.card2`, which is what
 *     Figma specifies; the border reads because it is a rung darker
 *     than the fill in both colour schemes
 *   - 16px corners (`radius.lg` / Figma `Scale/300`), against MUI's
 *     8px `theme.shape.borderRadius`
 *   - a 4px inset (`spacing.component.xxs` / Figma `Scale/100`) on the
 *     panel, with the list's own padding zeroed — Figma puts the inset
 *     on the panel and sets the gap between items to `Scale/0`
 *   - `elevation.medium`, which matches Figma's `Shadow/medium` effect
 *     value for value, rather than MUI's `theme.shadows[8]`
 *
 * Overriding the panel needs a descendant selector, because these
 * styles are one specificity step above a slot's own `sx`:
 *
 *   <Menu sx={{ [`& .${menuClasses.paper}`]: { minWidth: 240 } }} />
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
 * @see Related: MenuItem, Select
 */
export const Menu = styled(MuiMenu)(({ theme }) => ({
  [`& .${menuClasses.paper}`]: {
    borderRadius: radius.lg,
    padding: spacing.component.xxs,
    borderWidth: 1,
    borderStyle: 'solid',
    boxShadow: elevation.medium,
    // MUI tints elevated `Paper` in dark mode with an overlay
    // gradient keyed off the elevation. Our surface token already
    // carries its own dark value, so the overlay would double-tint it.
    backgroundImage: 'none',
    ...paired(theme, {
      backgroundColor: surface.layers.card2,
      borderColor: border.layers.card2,
    }),
  },
  // Figma's inset lives on the panel and the items sit flush against
  // each other, so MUI's default `8px 0` on the list is removed
  // rather than added to.
  [`& .${menuClasses.list}`]: {
    padding: 0,
  },
  // A standalone `Divider` between groups is MUI's own component, so it
  // paints from `palette.divider`. In dark mode that token is *darker*
  // than the panel it sits on (`grey/1000` on `grey/950`), so the rule
  // reads as a smudge rather than a line. The panel's own border token
  // is the right hairline here, and it makes a standalone `Divider`
  // agree with `<MenuItem divider />`, which is styled to match.
  [`& .${menuClasses.list} .${dividerClasses.root}`]: paired(theme, {
    borderColor: border.layers.card2,
  }),
}));

Menu.displayName = 'Menu';
