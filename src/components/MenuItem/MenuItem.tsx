'use client';

import * as React from 'react';
import {
  MenuItem as MuiMenuItem,
  listClasses,
  listItemIconClasses,
  listItemTextClasses,
  menuItemClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { border, radius, spacing, surface, text } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';

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
 * gives `text/*` and `icon/*` the same value in all three tones
 * (`b1` `#31302e`, `b2` `#6d6b68`, `primary/3`), and Phosphor icons
 * paint with `currentColor`, so a single `color` on the root covers
 * both — no separate icon rule, and no icon token this system does not
 * already have.
 *
 * `action` maps to `text.primary.accent` (`colors.primary[500]`,
 * `#4949dc`). That value was briefly out of step with the Figma board;
 * the 11 August primitive export settled it and the raw scale now
 * carries it (DESIGNER_QUESTIONS.md #22). Referencing the token rather
 * than the hex is what made that a no-op here.
 */
const toneTokens: Record<MenuItemVariant, ModeToken> = {
  primary: text.default.body,
  secondary: text.default.caption,
  action: text.primary.accent,
};

interface StyledMenuItemProps {
  neofloVariant: MenuItemVariant;
}

const StyledMenuItem = styled(MuiMenuItem, {
  shouldForwardProp: (prop) => prop !== 'neofloVariant',
})<StyledMenuItemProps>(({ theme, neofloVariant }) => ({
  borderRadius: radius.sm,
  // Figma spaces the glyph from the label with `Scale/100`; MUI does it
  // with a 36px `ListItemIcon` column instead, which is neutralised
  // below so both compositions land on the same 4px gap.
  gap: spacing.component.xxs,
  paddingBlock: spacing.component.xs,
  // The design's item is 36px tall: 8 + 20 (B1 leading) + 8. MUI floors
  // items at 48px and only releases that to `auto` from `sm` up, so
  // without this the item would be 12px taller on a phone than in the
  // spec — the one place MUI's Material density would show through.
  minHeight: 'auto',
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
  // than a Neoflo variant, and it changes the type only: the 8px inset
  // is held at both densities, which lands a dense row on 8 + 16 + 8 =
  // 32px — exactly MUI's documented dense height, without inventing a
  // second inset value the design never specified.
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

  // Hover deliberately departs from the Figma value. The `menu-item`
  // sheet tints hover with `surface.layers.card2` — the same token the
  // panel it sits in is filled with (node 3228:62331), so inside a Menu
  // that hover is exactly invisible. The item sheet was drawn on the
  // page surface, where that tint reads fine; the composed menu
  // is what ships. Moving one rung up the same ladder to `card3`
  // preserves the intent (hover is one layer above its surface) with
  // the smallest possible deviation. Tracked in DESIGNER_QUESTIONS.md #23.
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
  [`&.${menuItemClasses.selected}`]: {
    ...paired(theme, { backgroundColor: surface.primary.subtle }),
    // Stay in the primary family once selected, instead of dropping
    // back to the neutral hover tint.
    [`&:hover, &.${menuItemClasses.focusVisible}`]: {
      ...paired(theme, { backgroundColor: surface.primary.subtleHover }),
      '@media (hover: none)': {
        ...paired(theme, { backgroundColor: surface.primary.subtle }),
      },
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
  // `palette.action.active`. The design puts the glyph 4px from the
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
 * Product Design System Figma (node 3204:121756): three label tones,
 * 8px corners, an 8px inset, a 4px glyph gap, and hover / selected /
 * focus / disabled styling in both colour schemes.
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
 * 4px gap.
 *
 * @example A menu with all three tones
 * <Menu anchorEl={anchorEl} open={open} onClose={close}>
 *   <MenuItem selected onClick={close}>
 *     <PencilSimpleIcon size={16} />
 *     Rename
 *   </MenuItem>
 *   <MenuItem variant="secondary" disabled>
 *     Last edited 2 days ago
 *   </MenuItem>
 *   <MenuItem variant="action" onClick={close}>
 *     <PlusIcon size={16} />
 *     New folder
 *   </MenuItem>
 * </Menu>
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
