'use client';

import * as React from 'react';
import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';

import { fontWeights, radius, spacing } from '@/src/tokens';

import { appearanceStyles } from '../_shared/actionStyles';

import type { CSSObject } from '@mui/material/styles';
import type {
  ButtonAppearance,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from './Button.types';

/**
 * Figma label spec is "Sans/B1/Medium": DM Sans, 500 weight, 13px over
 * a 20px leading, -1% tracking — confirmed live against the Figma
 * component (node 983:17179). This is a deliberate one-off deviation
 * from `theme.typography.fontFamily` (Plus Jakarta Sans): DM Sans
 * hasn't been adopted as the system-wide UI font yet, so it's pinned
 * locally here rather than promoted to `typography.ts`/`fontFamilies`.
 */
const LABEL_FONT_FAMILY =
  'var(--font-dm-sans, "DM Sans"), system-ui, -apple-system, sans-serif';
const LABEL_FONT_SIZE_PX = 13;
const LABEL_LEADING_PX = 20;
const LABEL_LETTER_SPACING_PX = -0.13;

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

/** Control heights from the Figma component set (node 983:17179). */
const sizeStyles: Record<ButtonSize, CSSObject> = {
  lg: {
    minHeight: 44,
    padding: `${spacing.component.sm}px`,
  },
  md: {
    minHeight: 36,
    padding: `${spacing.component.xs}px ${spacing.component.sm}px`,
  },
  sm: {
    minHeight: 32,
    padding: `${spacing.component.xxs}px ${spacing.component.sm}px`,
  },
};

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
  borderRadius: radius.full,
  fontFamily: LABEL_FONT_FAMILY,
  fontSize: LABEL_FONT_SIZE_PX,
  fontWeight: fontWeights.medium,
  lineHeight: `${LABEL_LEADING_PX}px`,
  letterSpacing: `${LABEL_LETTER_SPACING_PX}px`,
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
  ...sizeStyles[neofloSize],
  ...appearanceStyles(theme, neofloVariant, neofloAppearance),
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
