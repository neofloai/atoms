'use client';

import * as React from 'react';
import { Avatar as MuiAvatar, Badge as MuiBadge } from '@mui/material';
import { styled } from '@mui/material/styles';

import { colors, fontWeights, surface, text, typography } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';

import type { ModeToken } from '@/src/tokens';
import type {
  AvatarBadgeColor,
  AvatarColor,
  AvatarProps,
  AvatarShape,
  AvatarSize,
} from './Avatar.types';

/**
 * Figma `roundness` axis -> MUI Avatar `variant`. Mirrors the mapping
 * the design team authored in Code Connect: round = circular,
 * mid = rounded (uses `theme.shape.borderRadius`), sharp = square.
 */
const muiVariantMap: Record<AvatarShape, 'circular' | 'rounded' | 'square'> = {
  round: 'circular',
  mid: 'rounded',
  sharp: 'square',
};

interface SizeSpec {
  /** Avatar diameter in px. */
  box: number;
  /** Initials font size in px. */
  font: number;
  /** Icon glyph size in px. */
  icon: number;
}

/** Diameters from the Figma component set; text uses the B1/B2/Caption scale. */
const sizeStyles: Record<AvatarSize, SizeSpec> = {
  lg: { box: 40, font: typography.body.b1.size, icon: 24 },
  md: { box: 32, font: typography.body.b2.size, icon: 20 },
  sm: { box: 24, font: typography.body.caption.size, icon: 16 },
};

interface RoleColor {
  bg: ModeToken;
  fg: ModeToken;
}

/**
 * Background + content colour per role. `accent` is the Figma default
 * (orange/500); the others reuse the shared semantic surface tokens so
 * avatars track the palette in both colour schemes.
 */
const colorTokens: Record<AvatarColor, RoleColor> = {
  accent: {
    bg: { light: colors.orange[500], dark: colors.orange[500] },
    fg: text.default.headingOnColor,
  },
  primary: { bg: surface.primary.default, fg: text.default.headingOnColor },
  secondary: { bg: surface.default.defaultPressed, fg: text.default.heading },
  success: { bg: surface.success.default, fg: text.default.headingOnColor },
  error: { bg: surface.error.default, fg: text.default.headingOnColor },
  warning: { bg: surface.warning.default, fg: text.default.headingOnColor },
};

const badgeColorTokens: Record<AvatarBadgeColor, ModeToken> = {
  success: surface.success.default,
  error: surface.error.default,
  warning: surface.warning.default,
  neutral: surface.default.defaultPressed,
};

/** Status-dot diameter per avatar size. */
const dotSize: Record<AvatarSize, number> = { lg: 10, md: 8, sm: 6 };

interface StyledAvatarProps {
  neofloSize: AvatarSize;
  neofloColor: AvatarColor;
}

const StyledAvatar = styled(MuiAvatar, {
  shouldForwardProp: (prop) =>
    prop !== 'neofloSize' && prop !== 'neofloColor',
})<StyledAvatarProps>(({ theme, neofloSize, neofloColor }) => {
  const size = sizeStyles[neofloSize];
  const role = colorTokens[neofloColor];
  return {
    width: size.box,
    height: size.box,
    fontFamily: theme.typography.fontFamily,
    fontSize: size.font,
    fontWeight: fontWeights.medium,
    ...paired(theme, { backgroundColor: role.bg, color: role.fg }),
    '& svg': { width: size.icon, height: size.icon },
    '& .MuiSvgIcon-root': { fontSize: size.icon },
  };
});

interface StyledBadgeProps {
  neofloBadgeColor: AvatarBadgeColor;
  neofloSize: AvatarSize;
}

const StyledBadge = styled(MuiBadge, {
  shouldForwardProp: (prop) =>
    prop !== 'neofloBadgeColor' && prop !== 'neofloSize',
})<StyledBadgeProps>(({ theme, neofloBadgeColor, neofloSize }) => {
  const dot = dotSize[neofloSize];
  return {
    '& .MuiBadge-badge': {
      minWidth: dot,
      height: dot,
      padding: 0,
      borderRadius: '50%',
      ...paired(theme, { backgroundColor: badgeColorTokens[neofloBadgeColor] }),
      // White ring so the dot reads against the avatar and the page.
      boxShadow: `0 0 0 2px ${(theme.vars ?? theme).palette.background.paper}`,
    },
  };
});

/**
 * Branded avatar for users and entities. Wraps MUI `Avatar` with the
 * Neoflo API from the Product Design System Figma (node 978:17187):
 * three sizes, three corner treatments, six colour roles, an optional
 * status badge, and text / icon / image content.
 *
 * Content follows MUI conventions: pass `src` for a photo, otherwise
 * `children` render initials or an icon.
 *
 * @example Initials
 * <Avatar>OP</Avatar>
 *
 * @example Photo with online badge
 * <Avatar src="/users/olivia.jpg" alt="Olivia Park" badge />
 *
 * @see Related: Chip
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      size = 'md',
      shape = 'round',
      color = 'accent',
      badge = false,
      badgeColor = 'success',
      ...rest
    },
    ref
  ) => {
    const avatar = (
      <StyledAvatar
        ref={ref}
        variant={muiVariantMap[shape]}
        neofloSize={size}
        neofloColor={color}
        {...rest}
      />
    );

    if (!badge) return avatar;

    return (
      <StyledBadge
        overlap={shape === 'round' ? 'circular' : 'rectangular'}
        variant="dot"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        neofloBadgeColor={badgeColor}
        neofloSize={size}
      >
        {avatar}
      </StyledBadge>
    );
  }
);

Avatar.displayName = 'Avatar';
