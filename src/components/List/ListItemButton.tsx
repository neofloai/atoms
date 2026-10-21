'use client';

import * as React from 'react';
import {
  ListItemButton as MuiListItemButton,
  listItemButtonClasses,
  listItemClasses,
  listItemIconClasses,
  listItemTextClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { fontWeights, radius, surface } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import { ListVariantContext } from './listContext';
import {
  LIST_ROW_PADDING_PX,
  NAV_GLYPH_GAP_PX,
  NAV_ROW_INSET_PX,
  NAV_ROW_PX,
  listPrimaryType,
  listRowBox,
  listRowState,
  listRowSurface,
  navRowState,
} from './listTokens';

import type { ExtendButtonBase } from '@mui/material';
import type { ListItemButtonTypeMap } from './List.types';

/**
 * A row that responds — the element carrying the sheet's `State` axis.
 *
 * All four of its states are exact, and hover and focus are the pair
 * worth reading twice: they share the `card 2` fill and differ only in
 * the hairline, which turns `border/primary/3`. That is the sheet saying
 * the *rule* is the focus indicator. It also means this component does
 * not take the 3px ring the action controls use — a full-bleed row has
 * no outside to put a ring in, and the design already nominated
 * something else.
 *
 * ## Every state rule is one class deeper than MUI's
 *
 * MUI writes its own hover, selected, focus, and disabled at two
 * classes; each rule below is written at three, by naming
 * `.MuiListItemButton-root` alongside the state class. That buys two
 * things: the rules beat MUI's on specificity rather than on stylesheet
 * insertion order, and — because they are then all *equal* to each
 * other — the cascade among them is plain source order, top to bottom.
 * So the list below reads as a priority list, and `disabled` is last
 * because it must outrank everything above it.
 *
 * ## Inside a `ListItem`, the row above paints
 *
 * A `ListItemButton` nested in a `ListItem` — MUI's composition for a
 * clickable row with a separate trailing target — is *not* the full
 * width of the row: the trailing control sits beside it in flow, so a
 * fill painted here would stop short and leave the control on an
 * untinted strip. The `ListItem` mirrors these same states through
 * `:has()` and paints the whole band instead, and the last rule here
 * hands the job over.
 *
 * The ink stays this component's job either way, which is why the reset
 * gives up only the fill and the hairline.
 *
 * @example A navigation row
 * <ListItemButton selected>
 *   <ListItemIcon><FolderIcon size={16} /></ListItemIcon>
 *   <ListItemText primary="Invoices" secondary="12 unpaid" />
 * </ListItemButton>
 *
 * In a `variant="nav"` list the same component draws the sidebar's
 * 28px row instead — see `NavListItemButton` below and `List`.
 *
 * @example A row that navigates, as a link
 * <ListItemButton component="a" href="/reports">
 *   <ListItemText primary="Reports" />
 * </ListItemButton>
 *
 * @see Related: List, ListItem, ListItemText
 */
const StyledListItemButton = styled(MuiListItemButton)(({ theme }) => ({
  ...listRowBox,
  ...listRowSurface(theme),

  // MUI's 8px block padding -> the sheet's `Scale/300`. Held at both
  // densities: the design draws one row, and `dense` changes the type
  // through MUI's list context rather than the inset — the same call
  // `MenuItem` makes about its own 8px.
  [`&.${listItemButtonClasses.root}`]: {
    paddingBlock: LIST_ROW_PADDING_PX,
  },

  [`&.${listItemButtonClasses.root}:hover`]: {
    ...paired(theme, { backgroundColor: listRowState.hoverFill }),
    // Matches MUI: a touch device has no hover to leave behind. Back to
    // the resting fill rather than to `transparent`, because this row
    // paints its own surface.
    '@media (hover: none)': paired(theme, {
      backgroundColor: surface.layers.card1,
    }),
  },

  [`&.${listItemButtonClasses.root}.${listItemButtonClasses.selected}`]: paired(
    theme,
    { backgroundColor: listRowState.selectedFill }
  ),

  [`&.${listItemButtonClasses.selected}:hover`]: {
    ...paired(theme, { backgroundColor: listRowState.selectedHoverFill }),
    '@media (hover: none)': paired(theme, {
      backgroundColor: listRowState.selectedFill,
    }),
  },

  [`&.${listItemButtonClasses.root}.${listItemButtonClasses.focusVisible}`]:
    paired(theme, {
      backgroundColor: listRowState.hoverFill,
      borderBottomColor: listRowState.focusRule,
    }),

  // Last, so it outranks every state above it at equal specificity.
  // MUI fades the whole row to 38% opacity; this system has disabled
  // surface, border, and text tokens, which keep the row legible-but-
  // inert and match every other disabled control here.
  [`&.${listItemButtonClasses.root}.${listItemButtonClasses.disabled}`]: {
    opacity: 1,
    ...paired(theme, {
      backgroundColor: listRowState.disabledFill,
      borderBottomColor: listRowState.disabledRule,
      // Reaches any leading glyph too: `ListItemIcon` inherits colour
      // here, and Phosphor icons paint with `currentColor`.
      color: listRowState.disabledInk,
    }),
    [`& .${listItemTextClasses.primary}, & .${listItemTextClasses.secondary}`]:
      paired(theme, { color: listRowState.disabledInk }),
  },

  // Hands the band over to the `ListItem` above, when there is one.
  // Equal specificity to the state rules and written last, so it wins.
  [`.${listItemClasses.root} &.${listItemButtonClasses.root}`]: {
    backgroundColor: 'transparent',
    borderBottom: 'none',
  },
}));

StyledListItemButton.displayName = 'ListItemButton';

/**
 * The row in a `variant="nav"` list — the navigation sheet's sidebar row.
 *
 * 28px tall on 4px corners, 8px in, the glyph 12px from the label, set in
 * `Sans/B1/Regular`. No band and no hairline: a sidebar is a column of
 * rows on the rail's own surface, and only the current page is filled.
 *
 *   rest         `text/default/b2` label, `icon/default/b2` glyph
 *   hover/focus  `card 3` fill
 *   selected     `surface/default/2` fill, `b1` ink and glyph, Medium
 *   aria-current `b1` ink and glyph, Medium, no fill — a parent row
 *                whose current page is out of sight
 *   disabled     `text/disabled` ink, no fill
 *
 * The label never wraps and the glyph never shrinks, so a row inside a
 * drawer that is narrowing clips its label rather than breaking onto two
 * lines. The state rules are written at three classes, as the list row's
 * are, so they outrank MUI's own and read top to bottom.
 */
const NavListItemButton = styled(MuiListItemButton)(({ theme }) => ({
  ...listPrimaryType,
  boxSizing: 'border-box',
  flexGrow: 0,
  height: NAV_ROW_PX,
  minHeight: NAV_ROW_PX,
  gap: NAV_GLYPH_GAP_PX,
  borderRadius: radius.xs,
  whiteSpace: 'nowrap',
  ...paired(theme, { color: navRowState.ink }),

  [`&.${listItemButtonClasses.root}`]: {
    paddingInline: NAV_ROW_INSET_PX,
    paddingBlock: 0,
  },

  // The glyph, in `ListItemIcon` or passed bare.
  [`& .${listItemIconClasses.root}, & > svg`]: {
    flexShrink: 0,
    ...paired(theme, { color: navRowState.glyph }),
  },

  // `ListItemText` sets its own title ink and type for the list frame;
  // in a nav row the row decides both, so the title follows the row's
  // state.
  [`& .${listItemTextClasses.root}`]: {
    margin: 0,
    minWidth: 0,
  },
  [`&.${listItemButtonClasses.root} .${listItemTextClasses.primary}`]: {
    color: 'inherit',
    fontWeight: 'inherit',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },

  [`&.${listItemButtonClasses.root}:hover, &.${listItemButtonClasses.root}.${listItemButtonClasses.focusVisible}`]:
    paired(theme, { backgroundColor: navRowState.hoverFill }),

  [`&.${listItemButtonClasses.root}[aria-current="true"], &.${listItemButtonClasses.root}.${listItemButtonClasses.selected}`]:
    {
      fontWeight: fontWeights.medium,
      ...paired(theme, { color: navRowState.currentInk }),
      [`& .${listItemIconClasses.root}, & > svg`]: paired(theme, {
        color: navRowState.currentGlyph,
      }),
    },

  [`&.${listItemButtonClasses.root}.${listItemButtonClasses.selected}, &.${listItemButtonClasses.root}.${listItemButtonClasses.selected}:hover`]:
    paired(theme, { backgroundColor: navRowState.selectedFill }),

  [`&.${listItemButtonClasses.root}.${listItemButtonClasses.disabled}`]: {
    opacity: 1,
    ...paired(theme, { color: navRowState.disabledInk }),
    [`& .${listItemIconClasses.root}, & > svg`]: paired(theme, {
      color: navRowState.disabledInk,
    }),
  },
}));

NavListItemButton.displayName = 'ListItemButton';

/**
 * Picks the row for the list it is in: the list frame's band, or — in a
 * `variant="nav"` list — the sidebar's row. One component either way, so
 * a row is written the same in both and the list decides how it looks.
 */
const ListItemButtonBase = React.forwardRef(function ListItemButton(
  props: React.ComponentProps<typeof StyledListItemButton>,
  ref: React.Ref<HTMLDivElement>
) {
  const { variant } = React.useContext(ListVariantContext);
  const Row = variant === 'nav' ? NavListItemButton : StyledListItemButton;
  return <Row ref={ref} {...props} />;
});

ListItemButtonBase.displayName = 'ListItemButton';

/**
 * Cast to `ExtendButtonBase<…>` — MUI's own declaration shape for
 * `ListItemButton` — rather than left as the styled component's inferred
 * type, which pins the root at `div` and drops the element's own props.
 * `<ListItemButton component="a" href="…">` would otherwise keep working
 * at runtime while failing to compile, and `ButtonBase`'s bare-`href`
 * shorthand would go with it. The same fix `MenuItem` uses.
 */
export const ListItemButton =
  ListItemButtonBase as unknown as ExtendButtonBase<ListItemButtonTypeMap>;
