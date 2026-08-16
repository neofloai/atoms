'use client';

import { ListItemAvatar as MuiListItemAvatar } from '@mui/material';
import { styled } from '@mui/material/styles';

/**
 * The leading avatar slot.
 *
 * MUI reserves a 56px column here — Material's avatar-plus-gutter — and
 * the sheet reserves nothing: the avatar sits `Scale/200` from the text,
 * which the row already spends as its `gap`. The column comes off so the
 * gap is the only thing between them.
 *
 * The avatar's own size stays the caller's, and it is meant to change
 * from row to row: `size="sm"` (24px) beside one line, `size="md"`
 * beside two. Both land the row on `16 + content + 16` — 56 and 68 —
 * and the two-line case does so whatever the avatar's size, because the
 * text block is 36 tall on its own.
 *
 * @example
 * <ListItemAvatar><Avatar size="md">OP</Avatar></ListItemAvatar>
 *
 * @see Related: ListItemIcon, ListItem, Avatar
 */
export const ListItemAvatar = styled(MuiListItemAvatar)({
  minWidth: 0,
});

ListItemAvatar.displayName = 'ListItemAvatar';
