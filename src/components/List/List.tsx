'use client';

import * as React from 'react';
import { List as MuiList } from '@mui/material';

import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { ListProps, ListTypeMap } from './List.types';

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
 * @see Related: ListItem, ListItemButton, ListItemText, ListItemIcon, ListItemAvatar
 */
const ListBase = React.forwardRef(function List(
  props: ListProps,
  ref: React.Ref<HTMLUListElement>
) {
  // `disablePadding` is passed *after* the spread rather than as a
  // default, so it cannot be overridden. MUI pads the list by 8px top
  // and bottom; this design pads the rows instead and stacks them
  // flush, so a list-level gutter would leave the first row sitting 8px
  // below whatever contains it. The prop is absent from `ListProps`, so
  // nothing is being shadowed — see `List.types.ts`.
  return <MuiList ref={ref} {...props} disablePadding />;
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
