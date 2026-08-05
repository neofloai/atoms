import type * as React from 'react';
import type {
  MenuItemProps as MuiMenuItemProps,
  MenuItemTypeMap as MuiMenuItemTypeMap,
} from '@mui/material';

/**
 * Tone of a menu item, mapped from the Figma `menu-item` component set
 * (node 3204:121756).
 *
 * That set puts five values on one `Property 1` axis — `primary`,
 * `secondary`, `action`, `hover`, `selected` — which conflates two
 * different kinds of thing. `hover` and `selected` are *states* MUI
 * already models (the CSS `:hover` pseudo-class and the `selected`
 * prop), and the house rule is to reuse MUI's own machinery rather
 * than invent a prop for behaviour it already expresses
 * (`.cursor/rules/10-mui-usage.mdc`). So they are styled here but not
 * repeated in the API. What is left on the axis is the item's tone,
 * and that is what this union carries:
 *
 *   - `primary`   — the default. Body-strength label
 *                   (`text/default/b1`).
 *   - `secondary` — de-emphasised label (`text/default/b2`), for a row
 *                   that reads as supporting rather than actionable.
 *   - `action`    — accent label (`text/primary/3`), for the row that
 *                   creates something: "New folder", "Invite member".
 *                   One per menu, the way `Button variant="primary"` is
 *                   one per section.
 */
export type MenuItemVariant = 'primary' | 'secondary' | 'action';

/**
 * The one prop this wrapper adds to MUI's `MenuItem`.
 *
 * Additive, not a remap: MUI has no `variant` on `MenuItem`. It does
 * have one on `Menu`, where it means something else entirely — MUI's
 * `variant` selects focus behaviour, this one selects a label tone:
 *
 *   <Menu variant="menu">                MUI's focus behaviour
 *     <MenuItem variant="action" />      the Neoflo tone
 *   </Menu>
 */
export interface MenuItemOwnProps {
  /** Tone of the item. @default 'primary' */
  variant?: MenuItemVariant;
}

/**
 * Props for the Neoflo `MenuItem` — MUI's `MenuItemProps` plus
 * `variant`, with the same two type parameters MUI declares, so the
 * root element stays polymorphic.
 *
 * Nothing is omitted. `selected`, `disabled`, `dense`, `divider`,
 * `disableGutters`, `autoFocus`, `onClick`, `component`, `sx`, and the
 * inherited `ButtonBase` props all apply.
 *
 * The type parameter is what keeps `component` honest. A plain
 * `forwardRef` wrapper would fix the root at `li` and silently drop the
 * element's own props — `<MenuItem component="a" href="…">` would stop
 * type-checking even though it still worked at runtime. Threading
 * `RootComponent` through, and typing the component itself as
 * `ExtendButtonBase` the way MUI does, keeps both the `component` route
 * and `ButtonBase`'s bare-`href` shorthand:
 *
 *   const link: MenuItemProps<'a'> = { href: '/tokens', variant: 'action' };
 */
export type MenuItemProps<
  RootComponent extends React.ElementType = 'li',
  AdditionalProps = object,
> = MuiMenuItemProps<RootComponent, AdditionalProps & MenuItemOwnProps>;

/**
 * MUI's `MenuItemTypeMap` with `variant` folded into its props, for
 * typing the component as `ExtendButtonBase<MenuItemTypeMap>` — the
 * same declaration shape MUI gives its own `MenuItem`.
 *
 * `AdditionalProps` defaults to `object` rather than MUI's `{}`, which
 * this repo's lint config rejects. Equivalent for every use here: both
 * contribute no members to the intersection.
 */
export type MenuItemTypeMap<
  AdditionalProps = object,
  RootComponent extends React.ElementType = 'li',
> = MuiMenuItemTypeMap<AdditionalProps & MenuItemOwnProps, RootComponent>;
