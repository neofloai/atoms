'use client';

import * as React from 'react';
import {
  ListSubheader as MuiListSubheader,
  listSubheaderClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  fontFamilies,
  fontWeights,
  radius,
  spacing,
  text,
  typography,
} from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import { ListVariantContext } from './listContext';
import {
  LIST_ROW_PADDING_PX,
  NAV_ROW_GAP_PX,
  NAV_ROW_INSET_PX,
  navRowState,
} from './listTokens';

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
 * The section label in a `variant="nav"` list — "Workflows" over a run of
 * sidebar rows. The same mono type, inset 8px to line up with the rows'
 * glyphs, 4px above and below, and 8px clear of the first row. Not
 * sticky: a sidebar scrolls as one column.
 *
 * Rendered as a button (`component="button"`), it is the toggle that
 * folds its section away: the browser's button chrome comes off, a caret
 * placed after the label sits 4px from it, and it takes the rows' `card 3`
 * hover.
 */
const NavListSubheader = styled(StyledListSubheader)(({ theme }) => ({
  position: 'static',
  display: 'flex',
  alignItems: 'center',
  gap: NAV_ROW_GAP_PX,
  paddingBlock: NAV_ROW_GAP_PX,
  // With the list's 4px gap, the 8px the sheet puts between a section's
  // label and its first row — whether the rows follow it directly or sit
  // in a `Collapse`, which trades the gap for 4px inside itself.
  marginBottom: NAV_ROW_GAP_PX,
  borderRadius: radius.xs,
  [`&.${listSubheaderClasses.gutters}`]: {
    paddingInline: NAV_ROW_INSET_PX,
  },
  '&:is(button)': {
    width: '100%',
    // Not `margin: 0` — the label's own bottom margin has to survive the
    // reset.
    marginTop: 0,
    marginInline: 0,
    border: 0,
    background: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    outline: 'none',
    '&:hover, &:focus-visible': paired(theme, {
      backgroundColor: navRowState.hoverFill,
    }),
  },
}));

NavListSubheader.displayName = 'ListSubheader';

/** Picks the label for the list it is in, as `ListItemButton` does. */
const ListSubheaderBase = React.forwardRef(function ListSubheader(
  props: React.ComponentProps<typeof StyledListSubheader>,
  ref: React.Ref<HTMLLIElement>
) {
  const { variant } = React.useContext(ListVariantContext);
  const Label = variant === 'nav' ? NavListSubheader : StyledListSubheader;
  return <Label ref={ref} {...props} />;
});

ListSubheaderBase.displayName = 'ListSubheader';

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
 * @example A sidebar section that folds away under its label
 * <List variant="nav">
 *   <ListSubheader component="button" onClick={toggle} aria-expanded={open}>
 *     Workflows
 *     <CaretDownIcon size={14} />
 *   </ListSubheader>
 *   <Collapse in={open}>{rows}</Collapse>
 * </List>
 *
 * @see Related: Menu, MenuItem, List
 */
export const ListSubheader =
  ListSubheaderBase as unknown as OverridableComponent<ListSubheaderTypeMap>;
