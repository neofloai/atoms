'use client';

import { ListItemText as MuiListItemText, listItemTextClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import { text } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import { listPrimaryType, listSecondaryType } from './listTokens';

/**
 * The row's title, and its subtitle when there is one.
 *
 * This is the whole of the sheet's `2-line` axis: a row is two lines
 * because it was given a `secondary`, not because a boolean was set.
 *
 * Three corrections to MUI, all of them arithmetic:
 *
 *   - **the type.** MUI renders the two slots as `Typography` with the
 *     `body1` and `body2` variants — Material's 16/24 and 14/20. The
 *     design's are `Sans/B1` (13/20) and `Sans/B2` (12/16).
 *   - **the gap between them.** There is none. MUI gives the block 4px
 *     of margin top and bottom; the sheet stacks the two lines flush,
 *     and that is what makes a two-line row exactly 68 — `16 + (20 + 16)
 *     + 16` — rather than 68 plus a gap.
 *   - **the colours.** `text/default/b1` for the title, `text/default/b2`
 *     for the subtitle, rather than inheriting the row's ink for both.
 *     A disabled row overrides both from `ListItemButton`, which is the
 *     only element that knows the row is disabled.
 *
 * `word-break: break-word` is the design's, and it means a long title
 * wraps inside the row rather than widening it. The row grows; the
 * trailing control keeps its place, because it does not shrink.
 *
 * @example
 * <ListItemText primary="Olivia Park" secondary="olivia@neoflo.ai" />
 *
 * @see Related: ListItem, ListItemButton
 */
const StyledListItemText = styled(MuiListItemText)(({ theme }) => ({
  margin: 0,
  minWidth: 0,

  [`& .${listItemTextClasses.primary}`]: {
    ...listPrimaryType,
    wordBreak: 'break-word',
    ...paired(theme, { color: text.default.body }),
  },

  [`& .${listItemTextClasses.secondary}`]: {
    ...listSecondaryType,
    wordBreak: 'break-word',
    ...paired(theme, { color: text.default.caption }),
  },
}));

StyledListItemText.displayName = 'ListItemText';

/**
 * Cast back to MUI's own declaration. `ListItemText` is generic over the
 * two elements its slots render as, and `styled()` collapses those
 * generics to their defaults — so `slots={{ primary: MyHeading }}` would
 * stop type-checking the props it is handed. The cast keeps them.
 */
export const ListItemText = StyledListItemText as typeof MuiListItemText;
