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

import {
  OUTLINE_BORDER_WIDTH_PX,
  paired,
  pairedFocusRing,
} from '../_shared/actionStyles';

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
 * Figma label spec, resynced against the pill (node 986:18006,
 * Sans/B1/Medium) and the 20px tag (node 3156:83830, Sans/B2/Regular).
 * Both pill heights share this ramp — Figma's `small` axis changes only
 * the vertical padding, not the type.
 */
const bigLabelType = typography.body.b1;
const smallLabelType = typography.body.b2;

/** The two pill heights, from the `small` axis of node 986:18006. */
const PILL_HEIGHT_PX = 36;
const DENSE_PILL_HEIGHT_PX = 32;

/**
 * Vertical padding for the dense pill. Figma types a raw `6` here (node
 * 3476:14579) instead of binding a Scale variable, and 6 is not on the
 * component spacing ladder (4/8/12/24) — so it stays a literal rather
 * than getting a token it has no claim to. See DESIGNER_QUESTIONS.md #30.
 */
const DENSE_PADDING_Y_PX = 6;

/**
 * Pill geometry. Every `md` chip reserves the 1px border that `outline`
 * and `selected` draw and subtracts it from the padding, so the outer
 * box is identical across appearance and selection. That is how Figma
 * draws it — every symbol in 986:18006 measures 79x36 (79x32 dense),
 * because Figma strokes inside the frame while a CSS border sits outside
 * the content box. Without the reservation an outlined chip renders 2px
 * wider than a filled one and toggling `selected` reflows the row.
 */
function pillSizeStyles(dense: boolean): CSSObject {
  const paddingY = dense ? DENSE_PADDING_Y_PX : spacing.component.xs;
  return {
    height: dense ? DENSE_PILL_HEIGHT_PX : PILL_HEIGHT_PX,
    padding: `${paddingY - OUTLINE_BORDER_WIDTH_PX}px ${
      spacing.component.sm - OUTLINE_BORDER_WIDTH_PX
    }px`,
    gap: spacing.component.xs,
    borderRadius: radius.sm,
    borderWidth: OUTLINE_BORDER_WIDTH_PX,
    borderStyle: 'solid',
    fontSize: bigLabelType.size,
    fontWeight: fontWeights.medium,
    lineHeight: `${bigLabelType.leading}px`,
    letterSpacing: `${bigLabelType.letterSpacing}em`,
  };
}

/**
 * Width of the tag's optional outline.
 *
 * The status sheet (node 1308:88266) draws it at 0.5. It ships at 1: a
 * half-pixel border is a physical pixel on a 2x screen and either a full
 * one or nothing on a 1x screen, depending on how the browser rounds, so
 * the drawn value is the one thing here that cannot be relied on to
 * render. See DESIGNER_QUESTIONS.md #61.
 */
const TAG_BORDER_WIDTH_PX = 1;

/**
 * 20px flat tag geometry (node 3156:83830), with or without the outline
 * `bordered` adds. A separate component set from the pill: its own type
 * ramp, radius, and colour roles.
 *
 * The original set drew no border on any swatch, which is why this was a
 * flat `border: none` until the status sheet turned up wanting one.
 *
 * A bordered tag gives its two border widths back out of the inline
 * padding, the same trade `Button`'s `outline` makes: a CSS border sits
 * outside the content box, so without this a bordered tag would be 2px
 * wider than a plain one and a column of mixed statuses would not line
 * up. The height is pinned at 20 either way, so only the inline axis
 * needs the adjustment.
 */
function tagSizeStyles(bordered: boolean): CSSObject {
  return {
    height: 20,
    paddingBlock: spacing.component.xxs,
    paddingInline: bordered
      ? spacing.component.xs - TAG_BORDER_WIDTH_PX
      : spacing.component.xs,
    gap: spacing.component.xxs,
    borderRadius: radius.xs,
    ...(bordered
      ? { borderWidth: TAG_BORDER_WIDTH_PX, borderStyle: 'solid' }
      : { border: 'none' }),
    fontSize: smallLabelType.size,
    fontWeight: fontWeights.regular,
    lineHeight: `${smallLabelType.leading}px`,
    letterSpacing: `${smallLabelType.letterSpacing}em`,
  };
}

/** Icon glyph size per chip size, from the two Figma component sets. */
const iconSizeStyles: Record<ChipSize, CSSObject> = {
  md: { width: 20, height: 20 },
  sm: { width: 12, height: 12 },
};

interface BigRoleTokens {
  bg: ModeToken;
  bgHover: ModeToken;
  bgPressed: ModeToken;
  /**
   * Fill for `selected` at `contained`. Every role takes its hover fill
   * here except `secondary` (keeps its resting fill, so the border is
   * the whole affordance) and `warning` (takes its *pressed* fill).
   */
  bgSelected: ModeToken;
  /** Fill for `selected` at `outline` — differs from the above on `secondary`. */
  bgSelectedOutline: ModeToken;
  text: ModeToken;
  outlineBorder: ModeToken;
  /**
   * Border `selected` draws. At `outline` this is already `outlineBorder`;
   * at `contained` it is the only thing separating selected from hovered.
   * Figma draws it on `primary` (986:17936) and `secondary` (986:17934)
   * only — see the note on `bigChipStyles`.
   */
  selectedBorder: ModeToken;
  focusRing: ModeToken;
}

/**
 * Colour roles for the pill (node 986:18006, resynced 2026-08-11).
 * Unlike Button/IconButton, every role here — including `primary` —
 * uses a pale/subtle fill with its own accent colour as the label at
 * `contained`, never a saturated fill with a white label. That's a
 * real difference from the shared `../_shared/actionStyles` role
 * table (tuned for Button), not a bug, so Chip keeps its own table
 * instead of reusing it.
 *
 * Every value below was read off an individual cell of 986:18006, and
 * the `state` axis there is `enabled / hovered / selected / pressed /
 * disabled`. There is no `focused` cell for either appearance, at either
 * height — the focus-visible treatment is ours, not Figma's.
 */
const bigRoleTokens: Record<
  'primary' | 'secondary' | 'success' | 'error' | 'warning',
  BigRoleTokens
> = {
  primary: {
    bg: surface.primary.subtle,
    bgHover: surface.primary.subtleHover,
    bgPressed: surface.primary.defaultPressed,
    bgSelected: surface.primary.subtleHover,
    bgSelectedOutline: surface.primary.subtleHover,
    text: text.primary[2],
    outlineBorder: border.primary.default,
    selectedBorder: border.primary.default,
    focusRing: border.primary.focus,
  },
  secondary: {
    bg: surface.default.default,
    bgHover: surface.default.defaultHover,
    bgPressed: surface.default.defaultPressed,
    // The one role whose selected fill is its *resting* fill (986:17934)
    // rather than its hover fill, while its outlined twin does take the
    // hover fill (986:17986).
    bgSelected: surface.default.default,
    bgSelectedOutline: surface.default.defaultHover,
    text: text.default.b1,
    // The neutral role is the one place where the outline border and the
    // selected border are different tokens: `border.layers.card2` for
    // the outline, one step darker for selection.
    outlineBorder: border.layers.card2,
    selectedBorder: border.default.default,
    focusRing: border.default.defaultPressed,
  },
  success: {
    bg: surface.success.subtle,
    bgHover: surface.success.subtleHover,
    bgPressed: surface.success.subtlePressed,
    bgSelected: surface.success.subtleHover,
    bgSelectedOutline: surface.success.subtleHover,
    text: text.success[2],
    outlineBorder: border.success.default,
    selectedBorder: border.success.default,
    focusRing: border.success.focus,
  },
  error: {
    bg: surface.error.subtle,
    bgHover: surface.error.subtleHover,
    bgPressed: surface.error.subtlePressed,
    bgSelected: surface.error.subtleHover,
    bgSelectedOutline: surface.error.subtleHover,
    text: text.error[2],
    outlineBorder: border.error.default,
    selectedBorder: border.error.default,
    focusRing: border.error.focus,
  },
  warning: {
    bg: surface.warning.subtle,
    bgHover: surface.warning.subtleHover,
    bgPressed: surface.warning.subtlePressed,
    // Warning is the only role whose selected fill is its pressed tint
    // rather than its hover tint (986:17972, 986:17996) — kept literal.
    bgSelected: surface.warning.subtlePressed,
    bgSelectedOutline: surface.warning.subtlePressed,
    text: text.warning[2],
    outlineBorder: border.warning.default,
    selectedBorder: border.warning.default,
    focusRing: border.warning.focus,
  },
};

interface SmallRoleTokens {
  bg: ModeToken;
  text: ModeToken;
  /**
   * Drawn only when `bordered` is set. `border/<role>/default` wherever
   * the collection has one; `orange` and `purple` have no border ramp at
   * all, so they take the darkest rung of their own `default` surface
   * ladder, which is the nearest thing to the separation the named
   * border tokens give the other six. See DESIGNER_QUESTIONS.md #61.
   */
  border: ModeToken;
}

/**
 * Colour roles for the 20px flat tag (node 3156:83830). The sheet draws
 * no hover/pressed/focus/selected states — every swatch is a single flat
 * colour — and each role picks a different rung of its own ladder (not a
 * uniform "always subtle" or "always default" rule), so these are copied
 * literally per role rather than derived from a pattern.
 *
 * The token names below are Figma's own, so a rung in the sheet is the
 * rung in the code: `text/information/3` is `text.information[3]`. The
 * 2026-08-11 cross-check corrected two that had been read a step off —
 * `secondary` draws `text/default/b2` (grey/650) not the lighter
 * `subtle`, and `information` draws `text/information/3` (blue/500) not
 * `/4` (blue/400).
 */
const smallRoleTokens: Record<ChipVariant, SmallRoleTokens> = {
  secondary: {
    bg: surface.layers.card3,
    text: text.default.b2,
    border: border.default.default,
  },
  primary: {
    bg: surface.primary.subtle,
    text: text.primary[3],
    border: border.primary.default,
  },
  warning: {
    bg: surface.warning.subtleHover,
    text: text.warning[2],
    border: border.warning.default,
  },
  purple: {
    bg: surface.purple.default,
    text: text.purple[4],
    border: surface.purple.defaultPressed,
  },
  success: {
    bg: surface.success.subtleHover,
    text: text.success[4],
    border: border.success.default,
  },
  orange: {
    bg: surface.orange.default,
    text: text.orange[3],
    border: surface.orange.defaultPressed,
  },
  error: {
    bg: surface.error.subtlePressed,
    text: text.error[4],
    border: border.error.default,
  },
  information: {
    bg: surface.information.default,
    text: text.information[3],
    border: border.information.default,
  },
};

const bigRoleFallback = bigRoleTokens.secondary;

/**
 * Full state styling for the pill. `information` / `orange` / `purple`
 * have no pill drawn in Figma yet, so they fall back to the `secondary`
 * look rather than rendering unstyled.
 *
 * `selected` is applied as the base rather than layered on top, because
 * it is a persistent state: hover and press still read over it, which is
 * a combination Figma does not draw.
 *
 * One deliberate extrapolation. Figma draws the selected border on
 * `primary` and `secondary` only; on `success` / `error` / `warning` the
 * selected cell carries a stray 72px ellipse instead (see
 * DESIGNER_QUESTIONS.md #30) and no border, which would leave those
 * three roles' selected state pixel-identical to their hover state.
 * Since selection has to survive the pointer leaving, the border is
 * applied on all five.
 */
function bigChipStyles(
  theme: Theme,
  variant: ChipVariant,
  appearance: ChipAppearance,
  selected: boolean
): CSSObject {
  const role =
    variant === 'information' || variant === 'orange' || variant === 'purple'
      ? bigRoleFallback
      : bigRoleTokens[variant];

  if (appearance === 'contained') {
    // One `paired` call per selector — see `pairedFocusRing`'s note on
    // why two of them in the same rule lose their dark values.
    const base: Record<string, ModeToken> = {
      backgroundColor: selected ? role.bgSelected : role.bg,
      color: role.text,
    };
    if (selected) {
      base.borderColor = role.selectedBorder;
    }

    return {
      // Reserved by `pillSizeStyles`; only `selected` colours it in.
      borderColor: 'transparent',
      ...paired(theme, base),
      '&:hover': paired(theme, { backgroundColor: role.bgHover }),
      '&:active': paired(theme, { backgroundColor: role.bgPressed }),
      '&.Mui-focusVisible': pairedFocusRing(
        theme,
        { backgroundColor: role.bgHover },
        role.focusRing
      ),
      '&.Mui-disabled': {
        borderColor: 'transparent',
        ...paired(theme, {
          backgroundColor: surface.disabled.default,
          color: text.disabled.default,
        }),
      },
    };
  }

  const base: Record<string, ModeToken> = {
    color: role.text,
    // Constant across every interactive state, selection included.
    borderColor: role.outlineBorder,
  };
  // Left out entirely when unselected, so the literal `transparent`
  // below holds in *both* schemes rather than only in light.
  if (selected) {
    base.backgroundColor = role.bgSelectedOutline;
  }

  return {
    backgroundColor: 'transparent',
    ...paired(theme, base),
    '&:hover': paired(theme, { backgroundColor: role.bgHover }),
    '&:active': paired(theme, { backgroundColor: role.bgPressed }),
    '&.Mui-focusVisible': pairedFocusRing(
      theme,
      { backgroundColor: role.bgHover },
      role.focusRing
    ),
    '&.Mui-disabled': {
      backgroundColor: 'transparent',
      ...paired(theme, {
        color: text.disabled.default,
        // The sheet's error/warning outline-disabled swatches point at
        // `icon/disabled/default` instead of `border/disabled/default`
        // (the other three roles all use the latter) — read as an
        // authoring slip in Figma, so kept consistent here.
        borderColor: border.disabled.default,
      }),
    },
  };
}

/** Flat styling for the 20px tag — no interaction states in Figma. */
function smallChipStyles(
  theme: Theme,
  variant: ChipVariant,
  bordered: boolean
): CSSObject {
  const role = smallRoleTokens[variant];

  // One `paired` call per selector: two of them spread into the same
  // rule would drop the first one's dark block. See `pairedFocusRing`.
  return {
    ...paired(theme, {
      backgroundColor: role.bg,
      color: role.text,
      ...(bordered ? { borderColor: role.border } : {}),
    }),
    '&.Mui-disabled': paired(theme, {
      backgroundColor: surface.disabled.default,
      color: text.disabled.default,
      // The outline greys with the rest of it. Left on the role's colour
      // it would be the loudest thing on a chip that is meant to read as
      // switched off.
      ...(bordered ? { borderColor: border.disabled.default } : {}),
    }),
  };
}

/**
 * Chips reuse the shared `paired`/`focusRing` helpers but hover and
 * press only apply to clickable chips, so the generic `:hover` /
 * `:active` selectors are rescoped onto `.MuiChip-clickable`. `selected`
 * is deliberately *not* rescoped — it is a state of the data, not of the
 * pointer. The small tag has no such states to rescope.
 */
function chipStateStyles(
  theme: Theme,
  size: ChipSize,
  variant: ChipVariant,
  appearance: ChipAppearance,
  selected: boolean,
  bordered: boolean
): CSSObject {
  if (size === 'sm') {
    return smallChipStyles(theme, variant, bordered);
  }

  const {
    ['&:hover']: hover,
    ['&:active']: active,
    ...rest
  } = bigChipStyles(theme, variant, appearance, selected);

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
  neofloDense: boolean;
  neofloSelected: boolean;
  neofloBordered: boolean;
}

const StyledChip = styled(MuiChip, {
  shouldForwardProp: (prop) =>
    prop !== 'neofloVariant' &&
    prop !== 'neofloAppearance' &&
    prop !== 'neofloSize' &&
    prop !== 'neofloDense' &&
    prop !== 'neofloSelected' &&
    prop !== 'neofloBordered',
})<StyledChipProps>(
  ({
    theme,
    neofloVariant,
    neofloAppearance,
    neofloSize,
    neofloDense,
    neofloSelected,
    neofloBordered,
  }) => ({
    fontFamily: fontFamilies.product.sans,
    ...(neofloSize === 'sm'
      ? tagSizeStyles(neofloBordered)
      : pillSizeStyles(neofloDense)),
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
    ...chipStateStyles(
      theme,
      neofloSize,
      neofloVariant,
      neofloAppearance,
      neofloSelected,
      neofloBordered
    ),
  })
);

/**
 * Branded chip for tags, filters, and compact selections. Wraps MUI
 * `Chip` with the Neoflo API from the Product Design System Figma
 * (node 977:17709, resynced 2026-08-11), which models two distinct
 * components under one `size` axis:
 *
 * - `size="md"` — the pill (node 986:18006): `primary` / `secondary` /
 *   `success` / `error` / `warning`, `contained` / `outline` emphasis,
 *   full hover / pressed / selected / disabled styling, and a `dense`
 *   flag for the 32px height. Every role (including `primary`) fills
 *   with a pale/subtle tint and its own accent colour as the label —
 *   not a saturated fill with a white label like Button's `contained`.
 * - `size="sm"` — the 20px flat tag (node 3156:83830): adds
 *   `information` / `orange` / `purple`, no emphasis axis, no
 *   interaction states (every swatch is a single flat colour), and a
 *   `bordered` flag that outlines the fill in the role's own border
 *   token — the Status column treatment. `dense` and `selected` do not
 *   apply.
 *
 * Supports MUI's `avatar`, `icon`, and `onDelete` slots unchanged.
 *
 * @example Status tag
 * <Chip variant="success" label="Active" />
 *
 * @example Removable filter
 * <Chip appearance="outline" label="Design" onDelete={handleRemove} />
 *
 * @example Selectable filter
 * <Chip label="Design" selected={isOn} onClick={toggle} />
 *
 * @example Flat tag
 * <Chip size="sm" variant="purple" label="Design" />
 *
 * @example A status in a table cell
 * <Chip size="sm" variant="information" bordered label="Extraction" />
 *
 * @see Related: Button, IconButton
 */
export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      variant = 'primary',
      appearance = 'contained',
      size = 'md',
      dense = false,
      bordered = false,
      selected,
      ...rest
    },
    ref
  ) => {
    // MUI only makes the chip a button when it is clickable, and
    // `aria-pressed` is meaningless on anything else. Announce the
    // toggle only when the caller opted into `selected` *and* the chip
    // can actually be pressed, so plain navigation chips are unaffected.
    const interactive = rest.clickable ?? Boolean(rest.onClick);

    return (
      <StyledChip
        ref={ref}
        variant={muiVariantMap[appearance]}
        aria-pressed={
          selected !== undefined && interactive ? selected : undefined
        }
        neofloVariant={variant}
        neofloAppearance={appearance}
        neofloSize={size}
        neofloDense={dense}
        neofloSelected={selected ?? false}
        neofloBordered={bordered}
        {...rest}
      />
    );
  }
);

Chip.displayName = 'Chip';
