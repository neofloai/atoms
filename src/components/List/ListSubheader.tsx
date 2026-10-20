'use client';

import {
  ListSubheader as MuiListSubheader,
  listSubheaderClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  fontFamilies,
  fontWeights,
  spacing,
  text,
  typography,
} from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import { LIST_ROW_PADDING_PX } from './listTokens';

import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { ListSubheaderTypeMap } from './List.types';

const StyledListSubheader = styled(MuiListSubheader)(({ theme }) => ({
  fontFamily: fontFamilies.product.mono,
  fontSize: typography.body.b2.size,
  fontWeight: fontWeights.medium,
  lineHeight: `${typography.body.b2.leading}px`,
  letterSpacing: `${typography.body.b2.letterSpacing}em`,
  paddingBlock: spacing.component.xs,
  // MUI paints the label's band in `palette.background.paper` so a sticky
  // label hides the rows scrolling under it. That is `grey/25`, which
  // would sit as a pale slab on any other surface; `inherit` takes the
  // fill of whatever the label is in.
  backgroundColor: 'inherit',
  ...paired(theme, { color: text.default.b3 }),
  // On MUI's `gutters` class, so `disableGutters` keeps working. The
  // list's own row inset, so the label lines up with the row text below.
  [`&.${listSubheaderClasses.gutters}`]: {
    paddingInline: LIST_ROW_PADDING_PX,
  },
}));

StyledListSubheader.displayName = 'ListSubheader';

/**
 * The label over a group of rows — "Workspaces" above the switcher's
 * rows, "Workflows" above a run of sidebar items.
 *
 * Wraps MUI `ListSubheader` with the navigation sheet's section label
 * (4564:6085): DM Mono Medium at 12/16, in `text/default/b3`. MUI's is a
 * 48px Material caption in `text.secondary`, which is the one thing this
 * replaces. A mono label reads as a name for the rows rather than one of
 * them.
 *
 * It goes wherever MUI's does: as a child of a `Menu`, which aligns it
 * with the item labels and fills it with the panel, or as a `List`'s
 * `subheader`, where it takes the rows' 16px inset.
 *
 * `color` is removed from the type. MUI's `primary` paints the label in
 * `palette.primary.main`, which this wrapper's own ink would override —
 * the prop would type-check and do nothing.
 *
 * Sticky by default, as MUI's is, so a long list keeps its label in
 * view. The label takes its container's fill to cover the rows passing
 * under it; on a container with no fill of its own, pass `disableSticky`.
 *
 * Cast to an `OverridableComponent` for the reason `ListItem` documents:
 * `styled()` drops `component`, and `component="div"` is the form a label
 * needs outside a `ul`.
 *
 * @example Heading a menu's rows
 * <Menu anchorEl={anchorEl} open={open} onClose={close}>
 *   <ListSubheader>Workspaces</ListSubheader>
 *   <MenuItem selected onClick={close}>Finance</MenuItem>
 *   <MenuItem onClick={close}>Procurement</MenuItem>
 * </Menu>
 *
 * @example Heading a list
 * <List subheader={<ListSubheader component="div">Recent</ListSubheader>}>
 *   <ListItem>…</ListItem>
 * </List>
 *
 * @see Related: Menu, MenuItem, List
 */
export const ListSubheader =
  StyledListSubheader as OverridableComponent<ListSubheaderTypeMap>;
