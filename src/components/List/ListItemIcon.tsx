'use client';

import { ListItemIcon as MuiListItemIcon } from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * The leading glyph slot.
 *
 * A positioning slot and nothing more, which is what the sheet says it
 * is: its `Type=icon` cells hold a 32px icon button, its `Type=avatar`
 * cells hold an `Avatar` — 24px on a one-line row, 36px on a two-line
 * one. Content that changes size from row to row cannot be chrome, so no
 * size is forced on whatever is passed.
 *
 * Two of MUI's defaults go, both of them Material's rather than this
 * design's:
 *
 *   - **the 36px column.** MUI reserves one so glyphs align down a list
 *     regardless of width. The sheet spaces the glyph from the text with
 *     `Scale/200` instead, which the row already spends as its `gap`.
 *     `ListItemText inset` still indents a row that has no glyph, for
 *     lists that want the column back.
 *   - **`palette.action.active`.** The glyph takes the row's ink, so a
 *     disabled row dims it without a second rule — Phosphor icons paint
 *     with `currentColor`.
 *
 * The same two corrections `MenuItem` makes to the same slot.
 *
 * @example
 * <ListItemIcon><FolderIcon size={16} /></ListItemIcon>
 *
 * @see Related: ListItemAvatar, ListItem, ListItemButton
 */
export const ListItemIcon = styled(MuiListItemIcon)({
  minWidth: 0,
  marginRight: 0,
  color: 'inherit',
});

ListItemIcon.displayName = 'ListItemIcon';
