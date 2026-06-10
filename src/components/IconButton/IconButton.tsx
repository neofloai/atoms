'use client';

import * as React from 'react';
import { IconButton as MuiIconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

import { radius, spacing } from '@/src/tokens';

import { appearanceStyles } from '../_shared/actionStyles';

import type { CSSObject } from '@mui/material/styles';
import type {
  IconButtonAppearance,
  IconButtonProps,
  IconButtonSize,
  IconButtonVariant,
} from './IconButton.types';

/**
 * Square control dimensions from the Figma component set
 * (node 983:17632): 48 / 40 / 32px with a 24px glyph, so padding is
 * 12 / 8 / 4px respectively.
 */
const sizeStyles: Record<IconButtonSize, CSSObject> = {
  lg: {
    width: 48,
    height: 48,
    padding: `${spacing.component.sm}px`,
  },
  md: {
    width: 40,
    height: 40,
    padding: `${spacing.component.xs}px`,
  },
  sm: {
    width: 32,
    height: 32,
    padding: `${spacing.component.xxs}px`,
  },
};

interface StyledIconButtonProps {
  neofloVariant: IconButtonVariant;
  neofloAppearance: IconButtonAppearance;
  neofloSize: IconButtonSize;
}

const StyledIconButton = styled(MuiIconButton, {
  shouldForwardProp: (prop) =>
    prop !== 'neofloVariant' &&
    prop !== 'neofloAppearance' &&
    prop !== 'neofloSize',
})<StyledIconButtonProps>(
  ({ theme, neofloVariant, neofloAppearance, neofloSize }) => ({
    // The design uses an 8px corner radius, not MUI's default circle.
    borderRadius: radius.sm,
    ...sizeStyles[neofloSize],
    ...appearanceStyles(theme, neofloVariant, neofloAppearance),
  })
);

/**
 * Branded icon-only action button. Wraps MUI `IconButton` with the
 * Neoflo API from the Product Design System Figma (node 983:16220):
 * five colour roles, three emphasis levels, three square sizes, full
 * hover / pressed / focus / disabled state styling in both colour
 * schemes.
 *
 * Always provide an `aria-label` — the control has no visible text.
 *
 * @example Primary action
 * <IconButton aria-label="Save to favourites"><Heart /></IconButton>
 *
 * @example Low-emphasis destructive action
 * <IconButton variant="error" appearance="text" aria-label="Delete"><Trash /></IconButton>
 *
 * @see Related: Button
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    { variant = 'primary', appearance = 'contained', size = 'md', ...rest },
    ref
  ) => (
    <StyledIconButton
      ref={ref}
      neofloVariant={variant}
      neofloAppearance={appearance}
      neofloSize={size}
      {...rest}
    />
  )
);

IconButton.displayName = 'IconButton';
