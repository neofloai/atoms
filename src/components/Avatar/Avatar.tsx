'use client';

import * as React from 'react';
import { Avatar as MuiAvatar, Badge as MuiBadge } from '@mui/material';
import { styled } from '@mui/material/styles';

import { fontWeights, surface, text, typography } from '@/src/tokens';

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
  /** Initials typography slot. */
  type: { size: number; leading: number; letterSpacing: number };
  /** Icon glyph size in px. */
  icon: number;
}

/**
 * Diameters, typography slot, and icon glyph size per size — confirmed
 * against the updated Avatar component set (node 981:16471, 2026-07-29
 * sync). `large` uses the H6 heading rung, not B1 (B1 shrank to 13px in
 * the typography resync, see DESIGNER_QUESTIONS.md #7); `medium` uses
 * B1 (13px); `small` is unchanged (Caption). Icon glyphs are 24px at
 * `lg` and a flat 16px at both `md` and `sm` — previously assumed
 * 24/20/16px, see DESIGNER_QUESTIONS.md #16.
 */
const sizeStyles: Record<AvatarSize, SizeSpec> = {
  lg: { box: 40, type: typography.headings.h6, icon: 24 },
  md: { box: 32, type: typography.body.b1, icon: 16 },
  sm: { box: 24, type: typography.body.caption, icon: 16 },
};

interface RoleColor {
  bg: ModeToken;
  fg: ModeToken;
}

/**
 * Background + content colour per role. `accent` is the Figma default —
 * confirmed against node 981:16471 (2026-07-29 sync) as
 * `surface.primary.subtle` + `text.primary.onColorHover`, replacing the
 * `orange/500` fill assumed from the older sheet (DESIGNER_QUESTIONS.md
 * #16). The others reuse the shared semantic surface tokens so avatars
 * track the palette in both colour schemes.
 */
const colorTokens: Record<AvatarColor, RoleColor> = {
  accent: {
    bg: surface.primary.subtle,
    fg: text.primary.onColorHover,
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

/**
 * Status-dot diameter — a flat 8px across all avatar sizes, confirmed
 * against node 981:16471 (previously assumed to scale 10/8/6px, see
 * DESIGNER_QUESTIONS.md #16).
 */
const BADGE_DOT_SIZE = 8;

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
    fontSize: size.type.size,
    fontWeight: fontWeights.regular,
    lineHeight: `${size.type.leading}px`,
    letterSpacing: `${size.type.letterSpacing}em`,
    ...paired(theme, { backgroundColor: role.bg, color: role.fg }),
    '& svg': { width: size.icon, height: size.icon },
    '& .MuiSvgIcon-root': { fontSize: size.icon },
  };
});

interface StyledBadgeProps {
  neofloBadgeColor: AvatarBadgeColor;
}

const StyledBadge = styled(MuiBadge, {
  shouldForwardProp: (prop) => prop !== 'neofloBadgeColor',
})<StyledBadgeProps>(({ theme, neofloBadgeColor }) => ({
  '& .MuiBadge-badge': {
    minWidth: BADGE_DOT_SIZE,
    height: BADGE_DOT_SIZE,
    padding: 0,
    borderRadius: '50%',
    ...paired(theme, { backgroundColor: badgeColorTokens[neofloBadgeColor] }),
    // Ring so the dot reads against the avatar and the page.
    boxShadow: `0 0 0 2px ${(theme.vars ?? theme).palette.background.paper}`,
  },
}));

/**
 * Branded avatar for users and entities. Wraps MUI `Avatar` with the
 * Neoflo API from the Product Design System Figma (node 981:16471):
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
      >
        {avatar}
      </StyledBadge>
    );
  }
);

Avatar.displayName = 'Avatar';
