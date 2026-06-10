'use client';

import * as React from 'react';
import { Button as MuiButton } from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  border,
  fontWeights,
  radius,
  spacing,
  surface,
  text,
  typography,
} from '@/src/tokens';

import type { CSSObject, Theme } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';
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

/** Width of the focus-visible ring around the control. */
const FOCUS_RING_WIDTH_PX = 3;

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

interface RoleTokens {
  containedBg: ModeToken;
  containedBgHover: ModeToken;
  containedBgPressed: ModeToken;
  containedText: ModeToken;
  accentText: ModeToken;
  outlineBorder: ModeToken;
  outlineBorderHover: ModeToken;
  subtleHoverBg: ModeToken;
  subtlePressedBg: ModeToken;
  focusRing: ModeToken;
}

/**
 * Figma `type` axis -> semantic tokens. `secondary` maps to the
 * neutral `default` token group (grey surfaces, heading text); the
 * remaining roles use their own colour group.
 */
const roleTokens: Record<ButtonVariant, RoleTokens> = {
  primary: {
    containedBg: surface.primary.default,
    containedBgHover: surface.primary.defaultHover,
    containedBgPressed: surface.primary.defaultPressed,
    containedText: text.default.headingOnColor,
    accentText: text.primary.heading,
    outlineBorder: border.primary.default,
    outlineBorderHover: border.primary.defaultHover,
    subtleHoverBg: surface.primary.subtleHover,
    subtlePressedBg: surface.primary.subtlePressed,
    focusRing: border.primary.focus,
  },
  secondary: {
    containedBg: surface.default.default,
    containedBgHover: surface.default.defaultHover,
    containedBgPressed: surface.default.defaultPressed,
    containedText: text.default.heading,
    accentText: text.default.heading,
    outlineBorder: border.default.default,
    outlineBorderHover: border.default.defaultHover,
    subtleHoverBg: surface.default.default,
    subtlePressedBg: surface.default.defaultHover,
    focusRing: border.default.defaultPressed,
  },
  success: {
    containedBg: surface.success.default,
    containedBgHover: surface.success.defaultHover,
    containedBgPressed: surface.success.defaultPressed,
    containedText: text.default.headingOnColor,
    accentText: text.success.heading,
    outlineBorder: border.success.default,
    outlineBorderHover: border.success.defaultHover,
    subtleHoverBg: surface.success.subtleHover,
    subtlePressedBg: surface.success.subtlePressed,
    focusRing: border.success.focus,
  },
  error: {
    containedBg: surface.error.default,
    containedBgHover: surface.error.defaultHover,
    containedBgPressed: surface.error.defaultPressed,
    containedText: text.default.headingOnColor,
    accentText: text.error.heading,
    outlineBorder: border.error.default,
    outlineBorderHover: border.error.defaultHover,
    subtleHoverBg: surface.error.subtleHover,
    subtlePressedBg: surface.error.subtlePressed,
    focusRing: border.error.focus,
  },
  warning: {
    containedBg: surface.warning.default,
    containedBgHover: surface.warning.defaultHover,
    containedBgPressed: surface.warning.defaultPressed,
    containedText: text.default.headingOnColor,
    accentText: text.warning.heading,
    outlineBorder: border.warning.default,
    outlineBorderHover: border.warning.defaultHover,
    subtleHoverBg: surface.warning.subtleHover,
    subtlePressedBg: surface.warning.subtlePressed,
    focusRing: border.warning.focus,
  },
};

/**
 * Expands `{ light, dark }` token pairs into a CSS object: light
 * values inline, dark values behind `theme.applyStyles('dark', ...)`.
 */
function paired(
  theme: Theme,
  styles: Record<string, ModeToken>
): CSSObject {
  const light: CSSObject = {};
  const dark: CSSObject = {};
  for (const [property, token] of Object.entries(styles)) {
    light[property] = token.light;
    dark[property] = token.dark;
  }
  return { ...light, ...theme.applyStyles('dark', dark) };
}

function focusRing(theme: Theme, token: ModeToken): CSSObject {
  return {
    boxShadow: `0 0 0 ${FOCUS_RING_WIDTH_PX}px ${token.light}`,
    ...theme.applyStyles('dark', {
      boxShadow: `0 0 0 ${FOCUS_RING_WIDTH_PX}px ${token.dark}`,
    }),
  };
}

function appearanceStyles(
  theme: Theme,
  variant: ButtonVariant,
  appearance: ButtonAppearance
): CSSObject {
  const role = roleTokens[variant];

  if (appearance === 'contained') {
    return {
      ...paired(theme, {
        backgroundColor: role.containedBg,
        color: role.containedText,
      }),
      '&:hover': paired(theme, { backgroundColor: role.containedBgHover }),
      '&:active': paired(theme, { backgroundColor: role.containedBgPressed }),
      '&.Mui-focusVisible': {
        ...paired(theme, { backgroundColor: role.containedBgHover }),
        ...focusRing(theme, role.focusRing),
      },
      '&.Mui-disabled': paired(theme, {
        backgroundColor: surface.disabled.default,
        color: text.disabled.default,
      }),
    };
  }

  if (appearance === 'outline') {
    return {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderStyle: 'solid',
      ...paired(theme, {
        color: role.accentText,
        borderColor: role.outlineBorder,
      }),
      '&:hover': paired(theme, {
        backgroundColor: role.subtleHoverBg,
        borderColor: role.outlineBorderHover,
      }),
      '&:active': paired(theme, { backgroundColor: role.subtlePressedBg }),
      '&.Mui-focusVisible': focusRing(theme, role.focusRing),
      '&.Mui-disabled': paired(theme, {
        color: text.disabled.default,
        borderColor: border.disabled.default,
      }),
    };
  }

  return {
    backgroundColor: 'transparent',
    ...paired(theme, { color: role.accentText }),
    '&:hover': paired(theme, { backgroundColor: role.subtleHoverBg }),
    '&:active': paired(theme, { backgroundColor: role.subtlePressedBg }),
    '&.Mui-focusVisible': focusRing(theme, role.focusRing),
    '&.Mui-disabled': paired(theme, { color: text.disabled.default }),
  };
}

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
 * @see Related: IconButton (planned)
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
