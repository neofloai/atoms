'use client';

import * as React from 'react';
import {
  MenuItem as MuiMenuItem,
  avatarClasses,
  listClasses,
  listItemIconClasses,
  listItemTextClasses,
  menuItemClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  border,
  fontWeights,
  radius,
  spacing,
  surface,
  text,
} from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import { modePair } from '../_shared/devMarks';

import type { ExtendButtonBase } from '@mui/material';
import type { ModeToken } from '@/src/tokens';
import type {
  MenuItemProps,
  MenuItemTypeMap,
  MenuItemVariant,
} from './MenuItem.types';

/**
 * Figma tone -> label colour.
 *
 * One token per tone drives both the label and the glyph. The design
 * gives `text/*` and `icon/*` the same value in every tone (`b1`
 * `#31302e`, `b2` `#6d6b68`, `primary/3`, `error/4` `#cc337f`), and
 * Phosphor icons paint with `currentColor`, so a single `color` on the
 * root covers both — no separate icon rule, and no icon token this
 * system does not already have.
 *
 * `action` maps to `text.primary[3]` (`colors.primary[500]`,
 * `#4949dc`). That value was briefly out of step with the Figma board;
 * the 11 August primitive export settled it and the raw scale now
 * carries it (DESIGNER_QUESTIONS.md #22). Referencing the token rather
 * than the hex is what made that a no-op here.
 *
 * `error` is the account flyout's "Sign out" row (node 4564:6199),
 * which binds `text/error/4` and `icon/error/4` — the same rung in both
 * modes, so it needs no pairing of its own.
 */
const toneTokens: Record<MenuItemVariant, ModeToken> = {
  primary: text.default.b1,
  secondary: text.default.b2,
  action: text.primary[3],
  error: text.error[4],
};

/**
 * The selected fill — `surface/default/2`, the rung the navigation sheet
 * (4564:6085) puts behind the current workspace in its switcher and
 * behind the current page in the rail.
 *
 * Its light half is `surface.default.defaultHover` (`grey/200`), the
 * token whose light value the sheet binds. Its dark half is
 * `grey/950`, which is the exact fill of the `card 2` panel this row
 * sits in — selected would be invisible in dark mode. The dark half
 * moves one rung up the same ladder to `defaultPressed` (`grey/900`),
 * the first step that reads against the panel. The sheet draws no dark
 * mode; see DESIGNER_QUESTIONS.md #71.
 */
const SELECTED_FILL = modePair(
  surface.default.defaultHover,
  surface.default.defaultPressed
);

interface StyledMenuItemProps {
  neofloVariant: MenuItemVariant;
}

const StyledMenuItem = styled(MuiMenuItem, {
  shouldForwardProp: (prop) => prop !== 'neofloVariant',
})<StyledMenuItemProps>(({ theme, neofloVariant }) => ({
  borderRadius: radius.xs,
  // `Scale/250` between the glyph and the label. MUI does it with a 36px
  // `ListItemIcon` column instead, which is neutralised below so both
  // compositions land on the same 12px gap.
  gap: spacing.component.sm,
  // A 28px row: 4 + 20 (B1 leading) + 4. The flyout (4564:6122) draws
  // `Scale/200` padding inside a fixed 28px box, which a 20px line
  // cannot honour on the block axis — the box wins, so the 8px is
  // horizontal only and 4px is what is left above and below.
  //
  // `minHeight: auto` because MUI floors items at 48px and only releases
  // that from `sm` up, so without it the row would be 20px taller on a
  // phone than in the spec.
  paddingBlock: spacing.component.xxs,
  minHeight: 'auto',
  // Every row in the flyout is `Sans/B1/Medium`. The theme's `body1` —
  // which MUI gives a menu item — is the Regular rung of the same size.
  fontWeight: fontWeights.medium,
  // Figma gives the label `word-break: break-word` over `min-width: 0`,
  // so a long label wraps inside the panel. MUI defaults to `nowrap`,
  // which instead widens the panel to fit — and cannot be rescued with
  // `text-overflow: ellipsis` because of a long-standing flexbox bug
  // that MUI documents as a Menu limitation. Following the design here
  // is both faithful and the better behaviour; `sx={{ whiteSpace:
  // 'nowrap' }}` puts MUI's back if a menu needs it.
  whiteSpace: 'normal',
  wordBreak: 'break-word',
  backgroundColor: 'transparent',
  ...paired(theme, { color: toneTokens[neofloVariant] }),

  // Horizontal inset stays on MUI's `gutters` class so `disableGutters`
  // keeps working; only the value changes, 16px -> `Scale/200`.
  [`&.${menuItemClasses.gutters}`]: {
    paddingInline: spacing.component.xs,
  },
  // The design specifies one density, so `dense` is MUI's knob rather
  // than a Neoflo variant, and it changes the type only: the 4px block
  // inset is held at both densities, which lands a dense row on 4 + 16 +
  // 4 = 24px.
  //
  // Asserted explicitly, and against two selectors, for two reasons.
  // Without it the result would depend on stylesheet insertion order
  // against MUI's own `dense` padding. And MUI 9.2.0 derives the two
  // halves of `dense` from different places — `MenuItem.js` builds
  // `ownerState.dense` from the inherited list context (line 204) but
  // computes the class names from the raw props (line 208) — so a row
  // that inherits `dense` from `slotProps={{ list: { dense: true } }}`
  // gets the dense *styles* without the `MuiMenuItem-dense` *class*.
  // Matching on the list's class as well covers the inherited case, so
  // both routes produce the same row.
  [`&.${menuItemClasses.dense}, .${listClasses.dense} &`]: {
    paddingBlock: spacing.component.xxs,
  },
  // A row that leads with an avatar — a workspace, a person — takes the
  // full `Scale/200` inset on every side, as the switcher draws it
  // (4564:6374): 8 + 24 + 8 = 40. The 28px text row only gives up its
  // block padding because a 20px line cannot fill it; a 24px avatar can.
  [`&:has(> .${avatarClasses.root})`]: {
    paddingBlock: spacing.component.xs,
  },
  // MUI draws `divider` from `palette.divider`, which in dark mode is
  // darker than the panel it sits on and reads as a smudge rather than
  // a line; the panel's own border token is the right hairline. The
  // full shorthand is restated rather than just the colour, so the rule
  // stands on its own instead of depending on being inserted after
  // MUI's `borderBottom` shorthand. `Menu` styles a standalone
  // `Divider` with the same token, so the two agree.
  [`&.${menuItemClasses.divider}`]: {
    borderBottomStyle: 'solid',
    borderBottomWidth: 1,
    backgroundClip: 'padding-box',
    ...paired(theme, { borderBottomColor: border.layers.card2 }),
  },

  // Hover is `card 3`, one layer above whatever the panel is. The
  // navigation flyouts draw no hover at all, and the older `menu-item`
  // sheet tinted it with `card 2` — the panel's own dark fill, so it
  // vanished inside a Menu. `card 3` keeps the intent (hover is one rung
  // above its surface) on both the flyout's near-white and the dark
  // `card 2`. Tracked in DESIGNER_QUESTIONS.md #23.
  '&:hover': {
    ...paired(theme, { backgroundColor: surface.layers.card3 }),
    // Matches MUI: a touch device has no hover to leave behind.
    '@media (hover: none)': { backgroundColor: 'transparent' },
  },
  // Keyboard focus is not drawn in Figma, but arrow-key navigation is
  // how a menu is meant to be operated, so it cannot be left unstyled.
  // It borrows hover's tint rather than the 3px ring the action
  // controls use, which would be clipped by the panel's 4px inset.
  [`&.${menuItemClasses.focusVisible}`]: paired(theme, {
    backgroundColor: surface.layers.card3,
  }),
  // Selected is a neutral fill, not a primary tint: the flyout marks the
  // current workspace with `surface/default/2` and a trailing check, and
  // the rail marks the current page with the same fill. The fill holds
  // under the pointer — a selected row does not have a hover state of
  // its own in the design, and dropping back to the hover tint would read
  // as the selection going away.
  [`&.${menuItemClasses.selected}`]: {
    ...paired(theme, { backgroundColor: SELECTED_FILL }),
    [`&:hover, &.${menuItemClasses.focusVisible}`]: {
      ...paired(theme, { backgroundColor: SELECTED_FILL }),
    },
  },
  // MUI fades the whole row to 38% opacity. This system has a disabled
  // text token, which keeps the label legible-but-inert and matches
  // every other disabled control here.
  [`&.${menuItemClasses.disabled}`]: {
    opacity: 1,
    ...paired(theme, { color: text.disabled.default }),
  },

  // MUI's icon slot reserves a 36px column and paints from
  // `palette.action.active`. The design puts the glyph 12px from the
  // label (the root `gap` above) and tints it with the item's tone.
  [`& .${listItemIconClasses.root}`]: {
    minWidth: 0,
    marginRight: 0,
    color: 'inherit',
  },
  [`& .${listItemTextClasses.root}`]: {
    margin: 0,
  },
}));

/**
 * Branded menu item. Wraps MUI `MenuItem` with the Neoflo API from the
 * Product Design System Figma — the row the navigation flyouts draw
 * (node 4564:6122): four label tones, a 28px row on 4px corners, an 8px
 * inset, a 12px glyph gap, `Sans/B1/Medium` labels, and hover / selected
 * / focus / disabled styling in both colour schemes.
 *
 * The full MUI prop surface is intact — `variant` is additive, since
 * MUI has no `variant` on `MenuItem`. `selected`, `disabled`, `dense`,
 * `divider`, `disableGutters`, `onClick`, `component`, and the
 * inherited `ButtonBase` props all behave as documented, and MUI's menu
 * compositions (`ListItemIcon`, `ListItemText`, a sibling `Divider`,
 * `ListSubheader`) still work.
 *
 * The root stays polymorphic. The export is typed as
 * `ExtendButtonBase<MenuItemTypeMap>` — MUI's own declaration shape for
 * `MenuItem` — rather than as a plain `forwardRef`, which would pin the
 * root at `li` and drop the element's own props: `<MenuItem
 * component="a" href="…">` would have kept working at runtime while
 * failing to compile. `ButtonBase`'s bare-`href` shorthand (no
 * `component` needed) survives for the same reason.
 *
 * Glyphs are 16px in the design. Icons are consumer content, so no size
 * is forced on arbitrary children — pass `size={16}` on the Phosphor
 * icon, or use `ListItemIcon`, which is styled here to give the same
 * 12px gap. A row that leads with a `size="sm"` `Avatar` grows to 40px
 * on its own, which is how the workspace switcher draws it.
 *
 * @example An account menu
 * <Menu anchorEl={anchorEl} open={open} onClose={close}>
 *   <MenuItem onClick={close}>
 *     <GearSixIcon size={16} />
 *     Settings
 *   </MenuItem>
 *   <Divider />
 *   <MenuItem variant="error" onClick={signOut}>
 *     <SignOutIcon size={16} />
 *     Sign out
 *   </MenuItem>
 * </Menu>
 *
 * @example A switcher with the current choice marked
 * <MenuItem selected onClick={close}>
 *   <Avatar size="sm" shape="mid">FI</Avatar>
 *   <Box component="span" sx={{ flex: 1 }}>Finance</Box>
 *   <CheckCircleIcon size={16} />
 * </MenuItem>
 *
 * @example A row that navigates
 * <MenuItem component="a" href="/tokens" target="_blank" rel="noreferrer">
 *   Design tokens
 * </MenuItem>
 *
 * @see Related: Menu, Select
 */
const MenuItemBase = React.forwardRef(function MenuItem(
  { variant = 'primary', ...rest }: MenuItemProps,
  ref: React.Ref<HTMLLIElement>
) {
  return <StyledMenuItem ref={ref} neofloVariant={variant} {...rest} />;
});

MenuItemBase.displayName = 'MenuItem';

export const MenuItem = MenuItemBase as ExtendButtonBase<MenuItemTypeMap>;
