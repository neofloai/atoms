'use client';

import * as React from 'react';
import { Chip as MuiChip } from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  border,
  fontFamilies,
  fontWeights,
  radius,
  spacing,
  surface,
  text,
  typography,
} from '@/src/tokens';

import { focusRing, paired } from '../_shared/actionStyles';

import type { CSSObject, Theme } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';
import type {
  ChipAppearance,
  ChipProps,
  ChipSize,
  ChipVariant,
} from './Chip.types';

const muiVariantMap: Record<ChipAppearance, 'filled' | 'outlined'> = {
  contained: 'filled',
  outline: 'outlined',
};

/**
 * Figma label spec, resynced against the 36px pill (node 986:18006,
 * Sans/B1/Medium) and the 20px tag (node 3156:83830, Sans/B2/Regular).
 */
const bigLabelType = typography.body.b1;
const smallLabelType = typography.body.b2;

/** Pill/tag dimensions from the two Figma component sets. */
const sizeStyles: Record<ChipSize, CSSObject> = {
  md: {
    height: 36,
    padding: `${spacing.component.xs}px ${spacing.component.sm}px`,
    gap: spacing.component.xs,
    borderRadius: radius.sm,
    fontSize: bigLabelType.size,
    fontWeight: fontWeights.medium,
    lineHeight: `${bigLabelType.leading}px`,
    letterSpacing: `${bigLabelType.letterSpacing}em`,
  },
  sm: {
    height: 20,
    padding: `${spacing.component.xxs}px ${spacing.component.xs}px`,
    gap: spacing.component.xxs,
    borderRadius: radius.xs,
    fontSize: smallLabelType.size,
    fontWeight: fontWeights.regular,
    lineHeight: `${smallLabelType.leading}px`,
    letterSpacing: `${smallLabelType.letterSpacing}em`,
  },
};

/** Icon glyph size per chip size, from the two Figma component sets. */
const iconSizeStyles: Record<ChipSize, CSSObject> = {
  md: { width: 20, height: 20 },
  sm: { width: 12, height: 12 },
};

interface BigRoleTokens {
  bg: ModeToken;
  bgHover: ModeToken;
  bgFocus: ModeToken;
  bgPressed: ModeToken;
  text: ModeToken;
  outlineBorder: ModeToken;
  focusRing: ModeToken;
}

/**
 * Colour roles for the 36px pill (node 986:18006, resynced 2026-07-29).
 * Unlike Button/IconButton, every role here — including `primary` —
 * uses a pale/subtle fill with its own accent colour as the label at
 * `contained`, never a saturated fill with a white label. That's a
 * real difference from the shared `../_shared/actionStyles` role
 * table (tuned for Button), not a bug, so Chip keeps its own table
 * instead of reusing it.
 */
const bigRoleTokens: Record<
  'primary' | 'secondary' | 'success' | 'error' | 'warning',
  BigRoleTokens
> = {
  primary: {
    bg: surface.primary.subtle,
    bgHover: surface.primary.subtleHover,
    bgFocus: surface.primary.subtleHover,
    bgPressed: surface.primary.defaultPressed,
    text: text.primary.caption,
    outlineBorder: border.primary.default,
    focusRing: border.primary.focus,
  },
  secondary: {
    bg: surface.default.default,
    bgHover: surface.default.defaultHover,
    bgFocus: surface.default.defaultHover,
    bgPressed: surface.default.defaultPressed,
    text: text.default.body,
    outlineBorder: border.layers.card2,
    focusRing: border.default.defaultPressed,
  },
  success: {
    bg: surface.success.subtle,
    bgHover: surface.success.subtleHover,
    bgFocus: surface.success.subtleHover,
    bgPressed: surface.success.subtlePressed,
    text: text.success.caption,
    outlineBorder: border.success.default,
    focusRing: border.success.focus,
  },
  error: {
    bg: surface.error.subtle,
    bgHover: surface.error.subtleHover,
    bgFocus: surface.error.subtleHover,
    bgPressed: surface.error.subtlePressed,
    text: text.error.caption,
    outlineBorder: border.error.default,
    focusRing: border.error.focus,
  },
  warning: {
    bg: surface.warning.subtle,
    bgHover: surface.warning.subtleHover,
    // Figma's own sheet uses the *pressed* tint for `focused`, not the
    // hover tint every other role uses — kept literal, not normalised.
    bgFocus: surface.warning.subtlePressed,
    bgPressed: surface.warning.subtlePressed,
    text: text.warning.caption,
    outlineBorder: border.warning.default,
    focusRing: border.warning.focus,
  },
};

interface SmallRoleTokens {
  bg: ModeToken;
  text: ModeToken;
}

/**
 * Colour roles for the 20px flat tag (node 3156:83830, added
 * 2026-07-29). The sheet draws no hover/pressed/focus states — every
 * swatch is a single flat colour — and each role happens to pick a
 * different tier of its own ladder (not a uniform "always subtle" or
 * "always default" rule), so these are copied literally per role
 * rather than derived from a pattern.
 *
 * `orange` and `purple` moved slot in the 2026-08-11 token sync, which
 * replaced their hand-guessed singletons with the full four-rung ladder:
 * the sheet's swatches are `orange/600` and `purple/400`, which are that
 * ladder's `accent` and `onColorHover` rungs. Same rendered colour in
 * light mode as before, and a real dark value instead of a mirror of
 * light.
 */
const smallRoleTokens: Record<ChipVariant, SmallRoleTokens> = {
  secondary: { bg: surface.layers.card3, text: text.default.subtle },
  primary: { bg: surface.primary.subtle, text: text.primary.accent },
  warning: { bg: surface.warning.subtleHover, text: text.warning.caption },
  purple: { bg: surface.purple.default, text: text.purple.onColorHover },
  success: { bg: surface.success.subtleHover, text: text.success.onColorHover },
  orange: { bg: surface.orange.default, text: text.orange.accent },
  error: { bg: surface.error.subtlePressed, text: text.error.onColorHover },
  information: {
    bg: surface.information.default,
    text: text.information.onColorHover,
  },
};

const bigRoleFallback = bigRoleTokens.secondary;

/**
 * Full state styling for the 36px pill. `information` / `orange` /
 * `purple` have no pill drawn in Figma yet, so they fall back to the
 * `secondary` look rather than rendering unstyled.
 */
function bigChipStyles(
  theme: Theme,
  variant: ChipVariant,
  appearance: ChipAppearance
): CSSObject {
  const role =
    variant === 'information' || variant === 'orange' || variant === 'purple'
      ? bigRoleFallback
      : bigRoleTokens[variant];

  if (appearance === 'contained') {
    return {
      ...paired(theme, { backgroundColor: role.bg, color: role.text }),
      '&:hover': paired(theme, { backgroundColor: role.bgHover }),
      '&:active': paired(theme, { backgroundColor: role.bgPressed }),
      '&.Mui-focusVisible': {
        ...paired(theme, { backgroundColor: role.bgFocus }),
        ...focusRing(theme, role.focusRing),
      },
      '&.Mui-disabled': paired(theme, {
        backgroundColor: surface.disabled.default,
        color: text.disabled.default,
      }),
    };
  }

  return {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderStyle: 'solid',
    ...paired(theme, { color: role.text, borderColor: role.outlineBorder }),
    '&:hover': paired(theme, { backgroundColor: role.bgHover }),
    '&:active': paired(theme, { backgroundColor: role.bgPressed }),
    '&.Mui-focusVisible': {
      ...paired(theme, { backgroundColor: role.bgFocus }),
      ...focusRing(theme, role.focusRing),
    },
    '&.Mui-disabled': paired(theme, {
      color: text.disabled.default,
      // The sheet's error/warning outline-disabled swatches point at
      // `icon/disabled/default` instead of `border/disabled/default`
      // (the other three roles all use the latter) — read as an
      // authoring slip in Figma, so kept consistent here.
      borderColor: border.disabled.default,
    }),
  };
}

/** Flat styling for the 20px tag — no interaction states in Figma. */
function smallChipStyles(theme: Theme, variant: ChipVariant): CSSObject {
  const role = smallRoleTokens[variant];
  return {
    border: 'none',
    ...paired(theme, { backgroundColor: role.bg, color: role.text }),
    '&.Mui-disabled': paired(theme, {
      backgroundColor: surface.disabled.default,
      color: text.disabled.default,
    }),
  };
}

/**
 * Chips reuse the shared `paired`/`focusRing` helpers but interaction
 * states only apply to clickable chips, so the generic `:hover` /
 * `:active` selectors are rescoped onto `.MuiChip-clickable`. The
 * small tag has no such states to rescope.
 */
function chipStateStyles(
  theme: Theme,
  size: ChipSize,
  variant: ChipVariant,
  appearance: ChipAppearance
): CSSObject {
  if (size === 'sm') {
    return smallChipStyles(theme, variant);
  }

  const {
    ['&:hover']: hover,
    ['&:active']: active,
    ...rest
  } = bigChipStyles(theme, variant, appearance);

  return {
    ...rest,
    '&.MuiChip-clickable:hover': hover as CSSObject,
    '&.MuiChip-clickable:active': active as CSSObject,
  };
}

interface StyledChipProps {
  neofloVariant: ChipVariant;
  neofloAppearance: ChipAppearance;
  neofloSize: ChipSize;
}

const StyledChip = styled(MuiChip, {
  shouldForwardProp: (prop) =>
    prop !== 'neofloVariant' &&
    prop !== 'neofloAppearance' &&
    prop !== 'neofloSize',
})<StyledChipProps>(
  ({ theme, neofloVariant, neofloAppearance, neofloSize }) => ({
    fontFamily: fontFamilies.product.sans,
    ...sizeStyles[neofloSize],
    '& .MuiChip-label': {
      padding: 0,
    },
    '& .MuiChip-deleteIcon, & .MuiChip-icon': {
      color: 'inherit',
      margin: 0,
    },
    '& .MuiChip-icon, & .MuiChip-avatar': {
      ...iconSizeStyles[neofloSize],
    },
    '& .MuiChip-avatar': {
      margin: 0,
    },
    ...chipStateStyles(theme, neofloSize, neofloVariant, neofloAppearance),
  })
);

/**
 * Branded chip for tags, filters, and compact selections. Wraps MUI
 * `Chip` with the Neoflo API from the Product Design System Figma
 * (node 977:17709, resynced 2026-07-29), which turned out to model
 * two distinct components under one `size` axis:
 *
 * - `size="md"` — the 36px pill (node 986:18006): `primary` /
 *   `secondary` / `success` / `error` / `warning`, `contained` /
 *   `outline` emphasis, full hover / pressed / focus-visible /
 *   disabled styling. Every role (including `primary`) fills with a
 *   pale/subtle tint and its own accent colour as the label — not a
 *   saturated fill with a white label like Button's `contained`.
 * - `size="sm"` — the 20px flat tag (node 3156:83830): adds
 *   `information` / `orange` / `purple`, no emphasis axis, no
 *   interaction states (every swatch is a single flat colour).
 *
 * Supports MUI's `avatar`, `icon`, and `onDelete` slots unchanged.
 *
 * @example Status tag
 * <Chip variant="success" label="Active" />
 *
 * @example Removable filter
 * <Chip appearance="outline" label="Design" onDelete={handleRemove} />
 *
 * @example Flat tag
 * <Chip size="sm" variant="purple" label="Design" />
 *
 * @see Related: Button, IconButton
 */
export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    { variant = 'primary', appearance = 'contained', size = 'md', ...rest },
    ref
  ) => (
    <StyledChip
      ref={ref}
      variant={muiVariantMap[appearance]}
      neofloVariant={variant}
      neofloAppearance={appearance}
      neofloSize={size}
      {...rest}
    />
  )
);

Chip.displayName = 'Chip';
