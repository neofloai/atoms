'use client';

import * as React from 'react';
import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';

import { fontFamilies, fontWeights, radius, spacing, typography } from '@/src/tokens';

import {
  appearanceStyles,
  OUTLINE_BORDER_WIDTH_PX,
} from '../_shared/actionStyles';

import type { CSSObject } from '@mui/material/styles';
import type {
  ButtonAppearance,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from './Button.types';

/**
 * Figma label spec is "Sans/B1/Medium" (node 983:17179) — now the
 * system type scale's `typography.body.b1` rung in `fontFamilies.product.sans`
 * (DM Sans), so the label reads from shared tokens instead of pinning
 * its own values.
 */
const LABEL_TYPE = typography.body.b1;

const muiVariantMap: Record<
  ButtonAppearance,
  'contained' | 'outlined' | 'text'
> = {
  contained: 'contained',
  outline: 'outlined',
  text: 'text',
};

const muiSizeMap: Record<ButtonSize, 'small' | 'medium' | 'large'> = {
  sm: 'small',
  md: 'medium',
  lg: 'large',
};

/**
 * Control heights and padding from the Figma component set
 * (node 983:17179): 44 / 36 / 32px, each built from the shared
 * `Scale/*` ladder that also backs `spacing.component`.
 */
const sizeMetrics: Record<
  ButtonSize,
  { readonly height: number; readonly block: number; readonly inline: number }
> = {
  lg: { height: 44, block: spacing.component.sm, inline: spacing.component.sm },
  md: { height: 36, block: spacing.component.xs, inline: spacing.component.sm },
  sm: { height: 32, block: spacing.component.xxs, inline: spacing.component.sm },
};

/**
 * Padding for one size + appearance, in pixels.
 *
 * Two adjustments to the raw Figma numbers, both so the three
 * appearances line up at the same height and left edge the way the
 * component set draws them:
 *
 *   - `outline` gives back its two border widths. Figma strokes sit
 *     *inside* the frame, so its outlined and filled buttons are both
 *     44px at `lg`; a CSS border sits outside the content box, which
 *     would otherwise make ours 46.
 *   - `text` sits flush — Figma gives it `Scale/0` on the inline axis
 *     at every size (node 983:16993), so a text link lines up with the
 *     copy it sits under rather than being inset by the control.
 */
function paddingFor(size: ButtonSize, appearance: ButtonAppearance): CSSObject {
  const { block, inline } = sizeMetrics[size];
  return {
    paddingBlock:
      appearance === 'outline' ? block - OUTLINE_BORDER_WIDTH_PX : block,
    paddingInline: appearance === 'text' ? 0 : inline,
  };
}

/** Icon glyph size per control size, from the Figma component set. */
const iconSizeStyles: Record<ButtonSize, CSSObject> = {
  lg: { width: 20, height: 20 },
  md: { width: 20, height: 20 },
  sm: { width: 16, height: 16 },
};

interface StyledButtonProps {
  neofloVariant: ButtonVariant;
  neofloAppearance: ButtonAppearance;
  neofloSize: ButtonSize;
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop) =>
    prop !== 'neofloVariant' &&
    prop !== 'neofloAppearance' &&
    prop !== 'neofloSize',
})<StyledButtonProps>(({ theme, neofloVariant, neofloAppearance, neofloSize }) => ({
  // 8px (`Scale/200`), not the stadium radius this shipped with — the
  // 11 August update took both action controls off the pill, matching
  // the move Chip already made (DESIGNER_QUESTIONS.md #19).
  borderRadius: radius.sm,
  fontFamily: fontFamilies.product.sans,
  fontSize: LABEL_TYPE.size,
  fontWeight: fontWeights.medium,
  lineHeight: `${LABEL_TYPE.leading}px`,
  letterSpacing: `${LABEL_TYPE.letterSpacing}em`,
  textTransform: 'none',
  boxShadow: 'none',
  gap: spacing.component.xs,
  '&:hover': { boxShadow: 'none' },
  '& .MuiButton-startIcon, & .MuiButton-endIcon': {
    margin: 0,
  },
  '& .MuiButton-startIcon > *, & .MuiButton-endIcon > *': {
    ...iconSizeStyles[neofloSize],
  },
  minHeight: sizeMetrics[neofloSize].height,
  ...paddingFor(neofloSize, neofloAppearance),
  ...appearanceStyles(theme, neofloVariant, neofloAppearance, 'button'),
}));

/**
 * Branded action button. Wraps MUI `Button` with the Neoflo API from
 * the Product Design System Figma (node 983:17180): five colour roles,
 * three emphasis levels, three sizes, full hover / pressed / focus /
 * disabled state styling in both colour schemes.
 *
 * @example Primary call to action
 * <Button variant="primary">Submit</Button>
 *
 * @example Low-emphasis destructive action
 * <Button variant="error" appearance="text">Delete account</Button>
 *
 * @see Related: IconButton
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', appearance = 'contained', size = 'md', ...rest },
    ref
  ) => (
    <StyledButton
      ref={ref}
      variant={muiVariantMap[appearance]}
      size={muiSizeMap[size]}
      disableElevation
      neofloVariant={variant}
      neofloAppearance={appearance}
      neofloSize={size}
      {...rest}
    />
  )
);

Button.displayName = 'Button';
