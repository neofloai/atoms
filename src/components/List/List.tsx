'use client';

import * as React from 'react';
import { List as MuiList, collapseClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import { paired } from '../_shared/actionStyles';
import { ListVariantContext } from './listContext';
import {
  NAV_BRANCH_INDENT_PX,
  NAV_BRANCH_RULE_PX,
  NAV_ROW_GAP_PX,
  navRowState,
} from './listTokens';

import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { ListProps, ListTypeMap } from './List.types';

/**
 * The nav treatment's list: a column of rows 4px apart, and — one level
 * down — the branch.
 *
 * ## A collapsing level keeps the rhythm
 *
 * MUI nests a level as a `Collapse` holding a `List`, a sibling of the
 * parent row. A shut `Collapse` is still a flex item, so the list's gap
 * would leave 8px between the rows either side of it instead of 4. The
 * gap is taken back from the `Collapse` itself and put inside it instead,
 * where it closes with the level — so a shut group leaves nothing behind
 * and an open one opens 4px under its parent. Rows placed straight in a
 * `Collapse` (a section folding away under its label) take the same 4px
 * apart.
 *
 * ## The branch
 *
 * A nav list inside a nav list is the second level: its rows start 40px
 * in, and a 1px rule stands 16px in — under the parent's glyph — for the
 * height of the column. `border/default/1` rather than the rail's own
 * edge token, which on the `card 2` rail is invisible.
 */
const COLLAPSE = `.${collapseClasses.root}`;
const INNER = `.${collapseClasses.wrapper} > .${collapseClasses.wrapperInner}`;

const NavList = styled(MuiList, {
  shouldForwardProp: (prop) => prop !== 'nested',
})<{ nested: boolean }>(({ theme, nested }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: NAV_ROW_GAP_PX,

  // Two levels deep, because a section that folds away under its label
  // is itself a `Collapse`, and a group's `Collapse` sits inside it.
  [`& > ${COLLAPSE}, & > ${COLLAPSE} > ${INNER} > ${COLLAPSE}`]: {
    marginTop: -NAV_ROW_GAP_PX,
  },
  [`& > ${COLLAPSE} > ${INNER}, & > ${COLLAPSE} > ${INNER} > ${COLLAPSE} > ${INNER}`]:
    {
      display: 'flex',
      flexDirection: 'column',
      gap: NAV_ROW_GAP_PX,
      paddingTop: NAV_ROW_GAP_PX,
    },

  ...(nested && {
    position: 'relative',
    paddingLeft: NAV_BRANCH_INDENT_PX,
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: NAV_BRANCH_RULE_PX,
      borderLeftWidth: 1,
      borderLeftStyle: 'solid',
      ...paired(theme, { borderLeftColor: navRowState.branchRule }),
    },
  }),
}));

/**
 * A vertical index of rows. Wraps MUI `List` with the geometry from the
 * Product Design System `list` frame (node 3653:29671).
 *
 * The list itself draws nothing — no fill, no edge, no radius, no gap.
 * Every visible decision belongs to the row: a `surface.layers.card1`
 * band, 16px on all four sides, and a 1px hairline along its bottom
 * edge. A stack of those reads as a list because each one ends on a
 * rule. So this component is thin on purpose; `ListItem`,
 * `ListItemButton`, and `ListItemText` are where the design lives.
 *
 * Compose a row from the same parts MUI documents. The design's four
 * axes are all composition rather than props — a leading `ListItemIcon`
 * or `ListItemAvatar`, a `secondary` on the text for the two-line form,
 * a `secondaryAction` for the trailing control, and `ListItemButton`
 * when the row should respond to the pointer.
 *
 * `dense` still reaches every row through MUI's list context.
 *
 * ## `variant="nav"` — the sidebar
 *
 * The same parts, drawn as the navigation sheet's sidebar rather than as
 * the list frame: 28px rows on 4px corners, 4px apart, the label in
 * `text/default/b2` and the glyph in `icon/default/b2`, the current page
 * (`selected`) on a grey fill in `b1`. It is MUI's navigation-drawer
 * composition — a `List` of `ListItemButton`s in a `Drawer`, a level as a
 * `Collapse` holding a nested `List` — so nothing new is learned; the
 * variant only changes how it is drawn.
 *
 * The variant travels through context, like `dense`: a nested `List`
 * inherits it and draws the second level behind a branch rule. A parent
 * row whose current page is out of sight takes `aria-current="true"`,
 * which gives it the current page's ink and weight without the fill.
 *
 * Folded to an icon strip, a row is its glyph alone — leave out the
 * `ListItemText` and centre the 28px square, as MUI's mini drawer does.
 *
 * @example A settings list, each row with its own control
 * <List>
 *   <ListItem secondaryAction={<Switch defaultChecked />}>
 *     <ListItemText primary="Email digest" secondary="Every Monday at 9am" />
 *   </ListItem>
 *   <ListItem secondaryAction={<Switch />}>
 *     <ListItemText primary="Desktop alerts" secondary="Off while presenting" />
 *   </ListItem>
 * </List>
 *
 * @example A navigation list
 * <List>
 *   <ListItemButton selected>
 *     <ListItemIcon><FolderIcon size={16} /></ListItemIcon>
 *     <ListItemText primary="Invoices" />
 *   </ListItemButton>
 *   <ListItemButton component="a" href="/reports">
 *     <ListItemIcon><ChartBarIcon size={16} /></ListItemIcon>
 *     <ListItemText primary="Reports" />
 *   </ListItemButton>
 * </List>
 *
 * @example A sidebar, with a level under one row
 * <Drawer variant="permanent" size="sm">
 *   <List variant="nav" component="nav" sx={{ p: 1.5 }}>
 *     <ListItemButton selected>
 *       <ListItemIcon><HouseIcon size={16} /></ListItemIcon>
 *       <ListItemText primary="Home" />
 *     </ListItemButton>
 *     <ListItemButton onClick={toggle} aria-expanded={open}>
 *       <ListItemIcon><FileTextIcon size={16} /></ListItemIcon>
 *       <ListItemText primary="Invoice Processing" />
 *       <CaretDownIcon size={14} />
 *     </ListItemButton>
 *     <Collapse in={open}>
 *       <List>
 *         <ListItemButton>
 *           <ListItemIcon><BriefcaseIcon size={16} /></ListItemIcon>
 *           <ListItemText primary="Work area" />
 *         </ListItemButton>
 *       </List>
 *     </Collapse>
 *   </List>
 * </Drawer>
 *
 * @see Related: ListItem, ListItemButton, ListItemText, ListItemIcon, ListItemAvatar, Drawer
 */
const ListBase = React.forwardRef(function List(
  { variant: variantProp, ...props }: ListProps,
  ref: React.Ref<HTMLUListElement>
) {
  const parent = React.useContext(ListVariantContext);
  const variant = variantProp ?? parent.variant;
  const nav = variant === 'nav';
  const depth = nav && parent.variant === 'nav' ? parent.depth + 1 : 0;
  const context = React.useMemo(() => ({ variant, depth }), [variant, depth]);

  // `disablePadding` is passed *after* the spread rather than as a
  // default, so it cannot be overridden. MUI pads the list by 8px top
  // and bottom; this design pads the rows instead and stacks them
  // flush, so a list-level gutter would leave the first row sitting 8px
  // below whatever contains it. The prop is absent from `ListProps`, so
  // nothing is being shadowed — see `List.types.ts`.
  return (
    <ListVariantContext.Provider value={context}>
      {nav ? (
        <NavList ref={ref} nested={depth > 0} {...props} disablePadding />
      ) : (
        <MuiList ref={ref} {...props} disablePadding />
      )}
    </ListVariantContext.Provider>
  );
});

ListBase.displayName = 'List';

/**
 * Cast to an `OverridableComponent` for the reason `Card` and
 * `Accordion` document: `forwardRef` alone pins the root at `ul` and
 * drops `component`, so `<List component="nav">` — the form a
 * navigation list has to take — would render correctly and fail to
 * compile. Restating the type map keeps the root swappable and
 * type-checks the element's own props.
 */
export const List = ListBase as OverridableComponent<ListTypeMap>;
