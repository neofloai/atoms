'use client';

import * as React from 'react';
import { Chip as MuiChip } from '@mui/material';
import { styled } from '@mui/material/styles';

import { fontWeights, radius, spacing, typography } from '@/src/tokens';

import { appearanceStyles } from '../_shared/actionStyles';

import type { CSSObject, Theme } from '@mui/material/styles';
import type {
  ChipAppearance,
  ChipProps,
  ChipSize,
  ChipVariant,
} from './Chip.types';

/**
 * Figma label spec is Sans/B2/Medium with a 24px leading (Scale/400).
 * The `typography.body.b2` token currently carries a placeholder 20px
 * leading, so the leading is pinned here until the responsive type
 * tokens are resolved.
 */
const LABEL_LEADING_PX = 24;

const muiVariantMap: Record<ChipAppearance, 'filled' | 'outlined'> = {
  contained: 'filled',
  outline: 'outlined',
};

/**
 * Pill dimensions from the Figma component set (node 986:18006):
 * 40 / 32px tall with 24px content, so padding is 8 / 4px.
 */
const sizeStyles: Record<ChipSize, CSSObject> = {
  md: {
    height: 40,
    padding: `${spacing.component.xs}px`,
  },
  sm: {
    height: 32,
    padding: `${spacing.component.xxs}px`,
  },
};

/**
 * Chips reuse the shared action styling but interaction states only
 * apply to clickable chips, so the generic `:hover` / `:active`
 * selectors are rescoped onto `.MuiChip-clickable`.
 */
function chipStyles(
  theme: Theme,
  variant: ChipVariant,
  appearance: ChipAppearance
): CSSObject {
  const {
    ['&:hover']: hover,
    ['&:active']: active,
    ...rest
  } = appearanceStyles(theme, variant, appearance);

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
    // Scale/400 (24px) corner radius: a full pill at both heights.
    borderRadius: radius.xl,
    fontFamily: theme.typography.fontFamily,
    fontSize: typography.body.b2.size,
    fontWeight: fontWeights.medium,
    lineHeight: `${LABEL_LEADING_PX}px`,
    ...sizeStyles[neofloSize],
    '& .MuiChip-label': {
      padding: `0 ${spacing.component.xs}px`,
    },
    '& .MuiChip-deleteIcon, & .MuiChip-icon': {
      color: 'inherit',
      margin: 0,
    },
    '& .MuiChip-avatar': {
      margin: 0,
    },
    ...chipStyles(theme, neofloVariant, neofloAppearance),
  })
);

/**
 * Branded chip for tags, filters, and compact selections. Wraps MUI
 * `Chip` with the Neoflo API from the Product Design System Figma
 * (node 977:17709): five colour roles, contained / outline emphasis,
 * two pill sizes, with hover / pressed / focus styling on clickable
 * chips in both colour schemes.
 *
 * Supports MUI's `avatar`, `icon`, and `onDelete` slots unchanged.
 *
 * @example Status tag
 * <Chip variant="success" label="Active" />
 *
 * @example Removable filter
 * <Chip appearance="outline" label="Design" onDelete={handleRemove} />
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
