import type * as React from 'react';
import type {
  ListItemAvatarProps as MuiListItemAvatarProps,
  ListItemButtonProps as MuiListItemButtonProps,
  ListItemButtonTypeMap as MuiListItemButtonTypeMap,
  ListItemIconProps as MuiListItemIconProps,
  ListItemProps as MuiListItemProps,
  ListItemTextProps as MuiListItemTextProps,
  ListItemTypeMap as MuiListItemTypeMap,
  ListProps as MuiListProps,
  ListSubheaderProps as MuiListSubheaderProps,
  ListSubheaderTypeMap as MuiListSubheaderTypeMap,
  ListTypeMap as MuiListTypeMap,
} from '@mui/material';

/**
 * Public API for the list family, from the Figma `list` frame (node
 * 3653:29671).
 *
 * ## Nothing is renamed and nothing is added
 *
 * The sheet has four axes and 120 symbols, and not one of the four
 * becomes a prop, because MUI already models every one of them as
 * composition:
 *
 *   - **`Type`** (`icon` / `text` / `avatar`) is which leading slot you
 *     write — `ListItemIcon`, `ListItemAvatar`, or neither. The sheet
 *     settles this itself: its `icon` cells hold a 32px icon button and
 *     its `avatar` cells hold an `Avatar`, at 24px on a one-line row and
 *     36px on a two-line one. A slot whose contents change size between
 *     rows is a slot, not a variant.
 *   - **`Action`** (`plain` / `icon-button` / `button` / `switch` /
 *     `radio`) is `secondaryAction`, and every one of those five cells
 *     is an instance of a component this system already ships.
 *   - **`2-line`** is whether you pass `secondary` to `ListItemText`.
 *   - **`State`** (`enabled` / `hovered` / `focused` / `disabled`) is
 *     CSS, plus MUI's own `disabled` on `ListItemButton`.
 *
 * So the API is MUI's, minus the three props below that the design
 * contradicts. The house work is all in the styling.
 *
 * ## What is locked
 *
 * `divider` comes off `ListItem` and `ListItemButton`. The hairline is
 * not optional here: all 120 symbols carry it, and its colour is a state
 * indicator — it goes `border/primary/3` when the row is focused and
 * `border/disabled/default` when the row is disabled. A rule that
 * changes colour with the row's state belongs to the row, so it is drawn
 * unconditionally and the prop that would have asked for it is removed
 * rather than left as a no-op. This is the same call `Accordion` makes
 * about the same hairline, in the same design language.
 *
 * The faithful consequence is that the *last* row in a list keeps its
 * hairline, so a list ends on a rule rather than on nothing —
 * `Accordion` inherits that too, and `sx={{ '&:last-of-type': {
 * borderBottom: 'none' } }}` removes it where that is not wanted.
 *
 * `disablePadding` comes off `List` for a different reason: it is a
 * layout mode, and the design picks one. MUI pads the list itself by 8px
 * top and bottom; this design pads the *rows* by 16 and stacks them
 * flush, so a list-level gutter would push the first row off the top of
 * whatever contains it. It is forced on and removed from the type rather
 * than left as a way to break the rhythm.
 *
 * The removals are typed as an `Omit`, so they fail at compile time.
 *
 * ## The nav treatment
 *
 * `variant="nav"` is the one prop added, and it is a treatment rather
 * than a new part: the same `ListItemButton`, `ListItemIcon`,
 * `ListItemText` and `ListSubheader`, composed the way MUI composes a
 * navigation drawer, drawn as the navigation sheet's sidebar instead of
 * as the list frame's bands. It travels through context like `dense`, so
 * a nested `List` under a parent row inherits it and draws the branch.
 * See `List.tsx`.
 *
 * ## The subheader
 *
 * `ListSubheader` was left out while no design drew one. The navigation
 * sheet (4564:6085) now does — a mono section label over the switcher's
 * rows and the sidebar's — so it is wrapped, and `List`'s `subheader`
 * prop takes it. See `ListSubheader.tsx`.
 */

/** Removed from `List`. Documented above. */
type LockedListProp = 'disablePadding';

/**
 * The list's treatment.
 *
 *   - `default` — the list frame: 16px bands under a hairline, for an
 *     index of rows inside a page.
 *   - `nav` — the sidebar: 28px rows on 4px corners, 4px apart, for app
 *     navigation inside a `Drawer`.
 */
export type ListVariant = 'default' | 'nav';

/** The props `List` adds to MUI's. */
interface ListOwnProps {
  /**
   * The treatment — the list frame's bands, or the sidebar's rows.
   * Inherited by a nested `List`, the way `dense` is.
   *
   * @default 'default'
   */
  variant?: ListVariant;
}

/** Removed from `ListItem` and `ListItemButton`. Documented above. */
type LockedRowProp = 'divider';

/**
 * MUI's `ListTypeMap` with the locked prop removed, so the component
 * keeps its polymorphic root while refusing the prop that would
 * silently do nothing.
 */
export interface ListTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'ul',
> {
  props: AdditionalProps &
    ListOwnProps &
    Omit<MuiListTypeMap<object, RootComponent>['props'], LockedListProp>;
  defaultComponent: RootComponent;
}

/**
 * Props for the Neoflo `List`.
 *
 * `dense`, `subheader`, `component`, `sx`, and `classes` all behave
 * exactly as documented for MUI `List`. `dense` still reaches every row
 * through MUI's list context; it changes the type rather than the row's
 * 16px inset, which the design holds at both densities.
 */
export type ListProps<
  RootComponent extends React.ElementType = 'ul',
  AdditionalProps = object,
> = Omit<MuiListProps<RootComponent, AdditionalProps>, LockedListProp> &
  ListOwnProps;

/**
 * MUI's `ListItemTypeMap` with `divider` removed, keeping the
 * polymorphic root.
 */
export interface ListItemTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'li',
> {
  props: AdditionalProps &
    Omit<MuiListItemTypeMap<object, RootComponent>['props'], LockedRowProp>;
  defaultComponent: RootComponent;
}

/**
 * Props for the Neoflo `ListItem` — a row that displays but does not
 * respond.
 *
 * `secondaryAction` is the sheet's whole `Action` axis. Unlike MUI's, it
 * is laid out in flow rather than absolutely positioned, so the row's
 * text shortens to make room for it instead of running underneath — see
 * `ListItem.tsx`.
 */
export type ListItemProps<
  RootComponent extends React.ElementType = 'li',
  AdditionalProps = object,
> = Omit<MuiListItemProps<RootComponent, AdditionalProps>, LockedRowProp>;

/**
 * MUI's `ListItemButtonTypeMap` with `divider` removed, keeping the
 * polymorphic root and `ButtonBase`'s bare-`href` shorthand.
 */
export type ListItemButtonTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'div',
> = {
  props: AdditionalProps &
    Omit<
      MuiListItemButtonTypeMap<object, RootComponent>['props'],
      LockedRowProp
    >;
  defaultComponent: RootComponent;
};

/**
 * Props for the Neoflo `ListItemButton` — a row that responds to the
 * pointer and the keyboard.
 *
 * This is the element that carries the sheet's `State` axis: `hovered`
 * and `focused` are CSS, and `disabled` is MUI's own prop. `selected` is
 * MUI's too, and the one state the sheet does not draw — see
 * `ListItemButton.tsx`.
 */
export type ListItemButtonProps<
  RootComponent extends React.ElementType = 'div',
  AdditionalProps = object,
> = Omit<
  MuiListItemButtonProps<RootComponent, AdditionalProps>,
  LockedRowProp
>;

/**
 * Props for the Neoflo `ListItemText` — the row's title and optional
 * subtitle.
 *
 * Identical to MUI's. The generics are MUI's own, kept so
 * `slots.primary` / `slots.secondary` still type-check against the
 * element each is swapped for.
 */
export type ListItemTextProps<
  PrimaryTypographyComponent extends React.ElementType = 'span',
  SecondaryTypographyComponent extends React.ElementType = 'p',
> = MuiListItemTextProps<
  PrimaryTypographyComponent,
  SecondaryTypographyComponent
>;

/**
 * Props for the Neoflo `ListItemIcon` — the leading glyph slot.
 * Identical to MUI's.
 */
export type ListItemIconProps = MuiListItemIconProps;

/**
 * Props for the Neoflo `ListItemAvatar` — the leading avatar slot.
 * Identical to MUI's.
 */
export type ListItemAvatarProps = MuiListItemAvatarProps;

/** Removed from `ListSubheader`. See `ListSubheader.tsx`. */
type LockedSubheaderProp = 'color';

/**
 * MUI's `ListSubheaderTypeMap` with `color` removed, keeping the
 * polymorphic root.
 */
export interface ListSubheaderTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'li',
> {
  props: AdditionalProps &
    Omit<
      MuiListSubheaderTypeMap<object, RootComponent>['props'],
      LockedSubheaderProp
    >;
  defaultComponent: RootComponent;
}

/**
 * Props for the Neoflo `ListSubheader` — the label over a group of rows.
 *
 * MUI's, minus `color`. `disableSticky`, `disableGutters`, `inset`,
 * `component`, and `sx` all behave as documented for MUI.
 */
export type ListSubheaderProps<
  RootComponent extends React.ElementType = 'li',
  AdditionalProps = object,
> = Omit<
  MuiListSubheaderProps<RootComponent, AdditionalProps>,
  LockedSubheaderProp
>;
