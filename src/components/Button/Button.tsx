'use client';

import * as React from 'react';
import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';

import { fontWeights, radius, spacing, typography } from '@/src/tokens';

import { appearanceStyles } from '../_shared/actionStyles';

import type { CSSObject } from '@mui/material/styles';
import type {
  ButtonAppearance,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from './Button.types';

/**
 * Figma label spec is Sans/B2/Bold with a 24px leading (Scale/400).
 * The `typography.body.b2` token currently carries a placeholder 20px
 * leading, so the leading is pinned here until the responsive type
 * tokens are resolved.
 */
const LABEL_LEADING_PX = 24;

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
    minHeight: 48,
    padding: `${spacing.component.sm}px`,
  },
  md: {
    minHeight: 40,
    padding: `${spacing.component.xs}px ${spacing.component.sm}px`,
  },
  sm: {
    minHeight: 32,
    padding: `${spacing.component.xxs}px ${spacing.component.sm}px`,
  },
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
})<StyledButtonProps>(
  ({ theme, neofloVariant, neofloAppearance, neofloSize }) => ({
    borderRadius: radius.sm,
    fontFamily: theme.typography.fontFamily,
    fontSize: typography.body.b2.size,
    fontWeight: fontWeights.bold,
    lineHeight: `${LABEL_LEADING_PX}px`,
    textTransform: 'none',
    boxShadow: 'none',
    '&:hover': { boxShadow: 'none' },
    ...sizeStyles[neofloSize],
    ...appearanceStyles(theme, neofloVariant, neofloAppearance),
  })
);

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
