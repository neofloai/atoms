'use client';

import * as React from 'react';
import { IconButton as MuiIconButton } from '@mui/material';
import { styled } from '@mui/material/styles';

import { radius } from '@/src/tokens';

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
 * (node 983:17632): 44 / 36 / 32px, matching `Button`'s control
 * heights. Padding is 0 — the box size and glyph size are both fixed,
 * so centering comes from the flex layout, not padding.
 */
const sizeStyles: Record<IconButtonSize, CSSObject> = {
  lg: {
    width: 44,
    height: 44,
    padding: 0,
  },
  md: {
    width: 36,
    height: 36,
    padding: 0,
  },
  sm: {
    width: 32,
    height: 32,
    padding: 0,
  },
};

/**
 * Icon glyph size per control size (node 983:17632): 24px for
 * `lg`/`md`, dropping to 16px for `sm` — the same `sm` glyph size as
 * `Button`'s start/end icons.
 */
const iconSizeStyles: Record<IconButtonSize, CSSObject> = {
  lg: { width: 24, height: 24 },
  md: { width: 24, height: 24 },
  sm: { width: 16, height: 16 },
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
    // 8px (`Scale/200`), matching Button. Its own component set moved
    // off the circle in the same 11 August update (node 983:17629),
    // so this is not just inherited from Button's shape.
    borderRadius: radius.sm,
    ...sizeStyles[neofloSize],
    // Direct-child selector only -- the loading spinner's `<svg>` is
    // nested several levels deep and must keep its own default size.
    '& > svg': iconSizeStyles[neofloSize],
    ...appearanceStyles(theme, neofloVariant, neofloAppearance, 'iconButton'),
    // MUI hides the glyph behind the spinner via `color: transparent`
    // on this class, but it loses to the `&.Mui-disabled` colour above
    // (loading also sets `disabled`) since both rules tie on
    // specificity and this one is declared first. Re-declaring it last
    // restores the intended precedence.
    '&.MuiIconButton-loading': { color: 'transparent' },
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
 * <IconButton aria-label="Save to favourites"><HeartIcon /></IconButton>
 *
 * @example Low-emphasis destructive action
 * <IconButton variant="error" appearance="text" aria-label="Delete"><TrashIcon /></IconButton>
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
