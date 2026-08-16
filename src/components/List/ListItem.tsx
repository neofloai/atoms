'use client';

import {
  ListItem as MuiListItem,
  listItemButtonClasses,
  listItemClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { paired } from '../_shared/actionStyles';
import {
  LIST_ACTION_GAP_PX,
  LIST_CONTENT_GAP_PX,
  LIST_ROW_PADDING_PX,
  listRowBox,
  listRowState,
  listRowSurface,
} from './listTokens';

import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { ListItemTypeMap } from './List.types';

/**
 * One row of a list, as a `li` that displays rather than responds.
 *
 * ## The trailing control is laid out in flow
 *
 * This is the one place the wrapper departs from MUI's mechanics, and
 * the design forces it. MUI positions `secondaryAction` absolutely at
 * `right: 16` and reserves a flat 48px of padding for it. That reserve
 * is a guess, and this design breaks it in both directions: the
 * `icon-button` cell holds two 32px buttons and a 4px gap — 68px, which
 * overflows the reserve and lets long text run underneath — while the
 * `radio` cell holds a 16px control, which wastes half of it.
 *
 * Figma draws a flex line instead: the content takes `flex: 1` over
 * `min-width: 0`, the control takes `shrink-0`, and `Scale/300` sits
 * between them. That is also the better behaviour, because the text now
 * shortens to make room rather than sliding under the control. So the
 * slot is returned to normal flow and the reserve is cancelled.
 *
 * MUI marks the underlying `ListItemSecondaryAction` deprecated in
 * favour of this prop, so the absolute positioning is a Material detail
 * rather than an API contract worth preserving.
 *
 * ## Two compositions, one set of numbers
 *
 * A row is 16px inside with `Scale/300` before its trailing control,
 * whether the caller writes the plain form or nests a button for a row
 * that responds:
 *
 * ```
 * <ListItem secondaryAction={…}>                      // this file
 * <ListItem disablePadding secondaryAction={…}>       // + ListItemButton
 *   <ListItemButton>…</ListItemButton>
 * </ListItem>
 * ```
 *
 * In the second, the button owns the row's inset so its fill can reach
 * the row's edges on hover. Its *trailing* inset then has to move to the
 * action, or the gap would come out at 32 — the button's 16 plus the
 * row's 16. The `:has()` rule below moves it, which is the only way to
 * say "a button that is followed by an action" in CSS. `Table` and
 * `DataGrid` already lean on `:has()` for the same kind of
 * one-selector-instead-of-a-render trick.
 *
 * @example A row with a trailing control
 * <ListItem secondaryAction={<Switch defaultChecked />}>
 *   <ListItemText primary="Two-factor auth" secondary="Required for admins" />
 * </ListItem>
 *
 * @example A row with a leading avatar and two trailing buttons
 * <ListItem
 *   secondaryAction={
 *     <>
 *       <IconButton size="sm" variant="secondary" aria-label="Edit"><PencilSimpleIcon size={16} /></IconButton>
 *       <IconButton size="sm" variant="secondary" aria-label="Open"><CaretRightIcon size={16} /></IconButton>
 *     </>
 *   }
 * >
 *   <ListItemAvatar><Avatar size="md">OP</Avatar></ListItemAvatar>
 *   <ListItemText primary="Olivia Park" secondary="olivia@neoflo.ai" />
 * </ListItem>
 *
 * @see Related: List, ListItemButton, ListItemText
 */
const StyledListItem = styled(MuiListItem)(({ theme }) => ({
  ...listRowBox,
  ...listRowSurface(theme),

  // MUI couples its two padding classes: `padding` carries 8px block,
  // and `gutters` only carries its 16px inline when `padding` is on too.
  // The coupling is kept — `disablePadding` has to strip both, or the
  // nested-button composition would indent by 32 — and only the block
  // value changes, 8 -> `Scale/300`.
  [`&.${listItemClasses.padding}`]: {
    paddingBlock: LIST_ROW_PADDING_PX,
    [`&.${listItemClasses.gutters}`]: {
      paddingInline: LIST_ROW_PADDING_PX,
    },
  },

  // The trailing control, returned to normal flow. `marginInlineStart`
  // tops the row's 8px `gap` up to the `Scale/300` the sheet draws,
  // rather than restating 16 and fighting the gap.
  //
  // It is a flex line of its own because the sheet's `icon-button` cell
  // holds *two* controls, `Scale/100` apart. MUI leaves the slot a bare
  // block, which stacks them vertically and — since they are the same
  // filled shape — leaves them touching, reading as one tall control.
  // `flexShrink: 0` is the other half of the layout the sheet draws:
  // the control keeps its size and the title shortens around it.
  [`& > .${listItemClasses.secondaryAction}`]: {
    position: 'static',
    transform: 'none',
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    gap: LIST_ACTION_GAP_PX,
    marginInlineStart: LIST_CONTENT_GAP_PX,
  },

  // When the row delegates its padding to a nested button, the button
  // cannot also own the trailing inset — so the action carries it.
  [`&:not(.${listItemClasses.padding}) > .${listItemClasses.secondaryAction}`]:
    {
      marginInlineEnd: LIST_ROW_PADDING_PX,
    },

  // Two rules on the nested button, both cancelling MUI's 48px reserve.
  // Written against `&.${listItemClasses.root}` so they outrank it on
  // specificity rather than on insertion order — the ambiguity
  // `MenuItem` documents for MUI's `dense` padding.
  //
  // The first restores the button's own gutter; the second takes it away
  // again when an action follows, because then the 16px between the two
  // is the row's gap rather than the button's padding.
  [`&.${listItemClasses.root} > .${listItemButtonClasses.gutters}`]: {
    paddingInlineEnd: LIST_ROW_PADDING_PX,
  },
  [`&.${listItemClasses.root}:has(> .${listItemClasses.secondaryAction}) > .${listItemButtonClasses.root}`]:
    {
      paddingInlineEnd: 0,
    },

  // ## The row paints the state of the button inside it
  //
  // A nested `ListItemButton` is only as wide as the row minus its
  // trailing control, so a fill painted by the button would stop short
  // and leave the control sitting on an untinted strip. Figma tints the
  // whole band. So the button gives up its fill (`ListItemButton.tsx`)
  // and these five rules put it back here, one class further out.
  //
  // Every selector below resolves to the same specificity — `:has()`
  // takes the specificity of its argument, and each argument is two
  // classes — so the cascade among them is source order, and they are
  // written in priority order with `disabled` last.
  [`&:has(> .${listItemButtonClasses.root}:hover)`]: paired(theme, {
    backgroundColor: listRowState.hoverFill,
  }),
  [`&:has(> .${listItemButtonClasses.root}.${listItemButtonClasses.selected})`]:
    paired(theme, { backgroundColor: listRowState.selectedFill }),
  [`&:has(> .${listItemButtonClasses.selected}:hover)`]: paired(theme, {
    backgroundColor: listRowState.selectedHoverFill,
  }),
  [`&:has(> .${listItemButtonClasses.root}.${listItemButtonClasses.focusVisible})`]:
    paired(theme, {
      backgroundColor: listRowState.hoverFill,
      borderBottomColor: listRowState.focusRule,
    }),
  [`&:has(> .${listItemButtonClasses.root}.${listItemButtonClasses.disabled})`]:
    paired(theme, {
      backgroundColor: listRowState.disabledFill,
      borderBottomColor: listRowState.disabledRule,
    }),
}));

StyledListItem.displayName = 'ListItem';

/**
 * Cast to an `OverridableComponent` for the reason `Card` documents:
 * `styled()` collapses the generic to its default-root props and drops
 * `component`, so `<ListItem component="div">` — the form a row inside a
 * non-`ul` container has to take — would render correctly and fail to
 * compile.
 */
export const ListItem = StyledListItem as OverridableComponent<ListItemTypeMap>;
