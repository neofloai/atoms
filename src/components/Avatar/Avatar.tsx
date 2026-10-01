'use client';

import * as React from 'react';
import {
  Avatar as MuiAvatar,
  Badge as MuiBadge,
  avatarClasses,
  badgeClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  border,
  fontWeights,
  icon,
  radius,
  surface,
  text,
  typography,
} from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import { modePair } from '../_shared/devMarks';

import type { CSSObject } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';
import type {
  AvatarBadgeColor,
  AvatarColor,
  AvatarProps,
  AvatarShape,
  AvatarSize,
} from './Avatar.types';

/**
 * Figma `Shape` axis -> MUI Avatar `variant`. `variant` only names the
 * shape here — the corner itself is set in `cornerRadius`, because MUI's
 * `rounded` reads `theme.shape.borderRadius` (8px) and the sheet draws
 * 4px.
 */
const muiVariantMap: Record<AvatarShape, 'circular' | 'rounded' | 'square'> = {
  round: 'circular',
  mid: 'rounded',
  sharp: 'square',
};

/**
 * The sheet's `square` binds its `borderradius` variable, 4px, which is
 * `radius.xs`. `circle` is drawn as a 100px radius; 50% is the same
 * circle at any size.
 */
const cornerRadius: Record<AvatarShape, string | number> = {
  round: '50%',
  mid: radius.xs,
  sharp: 0,
};

/**
 * The 0.5px hairline every avatar is drawn with. The sheet halves it
 * again to 0.25 at `sm` and `xs`; that ships as 0.5 too, because a
 * browser paints neither width thinner than one device pixel, so on a
 * 2x screen both are the same line and on a 1x screen both round up to
 * a full one.
 */
const HAIRLINE_PX = 0.5;

interface SizeSpec {
  /** Avatar diameter in px. */
  box: number;
  /** Initials: size, leading and tracking. */
  type: { size: number; leading: number; letterSpacing: number };
  /** Icon glyph size in px. */
  glyph: number;
  /** Status dot diameter, ring included. */
  dot: number;
  /** The dot's ring. */
  ring: number;
  /**
   * Where the dot's box sits from the avatar's bottom and right edges,
   * on a circle and on the two cornered shapes. Negative overhangs.
   */
  dotInset: { round: number; cornered: number };
}

/**
 * Per-size geometry (node 978:17187).
 *
 * Initials are `Sans/H6/Medium` at `lg`, `Sans/B1/Medium` at `md` and
 * `Sans/B3/Medium` at `sm` and `xs`. The `md` label is 14px, a literal
 * for the same reason as the text field's: `typography.body.b1` is 13,
 * while this sheet's B1 is 14. Its leading and tracking agree with `b1`
 * and are read from it. B3 is the 10px `caption` slot.
 *
 * The dot's inset is read off the sheet, which places it a little
 * differently in nearly every cell; these are the values it uses most.
 */
const sizeStyles: Record<AvatarSize, SizeSpec> = {
  lg: {
    box: 44,
    type: typography.headings.h6,
    glyph: 24,
    dot: 8,
    ring: 1,
    dotInset: { round: 1.5, cornered: -0.5 },
  },
  md: {
    box: 36,
    type: { ...typography.body.b1, size: 14 },
    glyph: 16,
    dot: 8,
    ring: 1,
    dotInset: { round: -0.5, cornered: -0.5 },
  },
  sm: {
    box: 24,
    type: typography.body.caption,
    glyph: 16,
    dot: 6,
    ring: 0.5,
    dotInset: { round: -0.25, cornered: -0.25 },
  },
  xs: {
    box: 20,
    type: typography.body.caption,
    glyph: 14,
    dot: 4,
    ring: 0.5,
    dotInset: { round: 0.75, cornered: -0.25 },
  },
};

interface RoleColor {
  bg: ModeToken;
  line: ModeToken;
  ink: ModeToken;
}

/**
 * Fill, hairline and ink per role (node 978:17187). Seven of the eight
 * hues bind raw ramp steps — `<hue>/100` or `/200` for the fill,
 * `<hue>/300` for the line — which carry no dark half, so each pair is
 * assembled with `modePair` from two semantic tokens:
 *
 * - **Light** is the token whose light value is exactly the step the
 *   sheet binds, so the light scheme renders as drawn.
 * - **Dark** follows one rule for every hue, since the sheet draws no
 *   dark avatar: the fill is the hue's `/800` and the line its `/700`,
 *   under the ink's own dark rung (`/100`–`/300`). Taking the light
 *   token's dark half instead lands each hue on a different rung — a
 *   saturated `primary/600` disc beside a near-black blue one — and
 *   loses the line on `primary` and `error`, where it equals the fill.
 *
 * Two light values have no exact token:
 *
 * - `purple/300` has none. Its line is `surface.purple.defaultPressed`
 *   (`purple/200`), the rung the chip outlines purple in.
 * - `information` (blue) is inked in `text/primary/1` on the sheet, not
 *   `text/information/1`. Followed as drawn.
 *
 * `secondary` is the sheet's grey, which binds semantic tokens already
 * and is used as it is. The ink also colours an icon: the glyph is drawn
 * in `icon/<role>/1`, which has the same values as the `text` rung.
 *
 * See DESIGNER_QUESTIONS.md #70.
 */
const colorTokens: Record<AvatarColor, RoleColor> = {
  primary: {
    bg: modePair(surface.primary.subtlePressed, surface.primary.subtle),
    line: modePair(border.primary.focus, surface.primary.subtleHover),
    ink: text.primary[1],
  },
  purple: {
    bg: surface.purple.defaultHover,
    line: surface.purple.defaultPressed,
    ink: text.purple[1],
  },
  information: {
    bg: modePair(surface.information.subtle, surface.information.default),
    line: border.information.focus,
    ink: text.primary[1],
  },
  success: {
    bg: surface.success.defaultHover,
    line: border.success.focus,
    ink: text.success[1],
  },
  warning: {
    bg: modePair(surface.warning.default, surface.warning.defaultHover),
    line: modePair(surface.warning.defaultHover, surface.warning.defaultPressed),
    ink: text.warning[0],
  },
  orange: {
    bg: surface.orange.defaultHover,
    line: surface.orange.defaultPressed,
    ink: text.orange[0],
  },
  error: {
    bg: surface.error.defaultHover,
    line: modePair(border.error.focus, surface.error.defaultPressed),
    ink: text.error[1],
  },
  secondary: {
    bg: surface.default.defaultHover,
    line: border.default.default,
    ink: text.default.b3,
  },
};

/**
 * Dot fill. `success` is the sheet's `green/400`; the other three are
 * the same rung of their own ladders, for the presence conventions the
 * sheet does not draw.
 */
const badgeColorTokens: Record<AvatarBadgeColor, ModeToken> = {
  success: icon.success[4],
  error: icon.error[4],
  warning: icon.warning[4],
  neutral: icon.default.subtle,
};

interface StyledAvatarProps {
  neofloSize: AvatarSize;
  neofloShape: AvatarShape;
  neofloColor: AvatarColor;
}

const StyledAvatar = styled(MuiAvatar, {
  shouldForwardProp: (prop) =>
    prop !== 'neofloSize' && prop !== 'neofloShape' && prop !== 'neofloColor',
})<StyledAvatarProps>(({ theme, neofloSize, neofloShape, neofloColor }) => {
  const size = sizeStyles[neofloSize];
  const role = colorTokens[neofloColor];
  return {
    boxSizing: 'border-box',
    width: size.box,
    height: size.box,
    borderRadius: cornerRadius[neofloShape],
    border: `${HAIRLINE_PX}px solid`,
    fontFamily: theme.typography.fontFamily,
    fontSize: size.type.size,
    fontWeight: fontWeights.medium,
    lineHeight: `${size.type.leading}px`,
    letterSpacing: `${size.type.letterSpacing}em`,
    // A photo sits inside a neutral hairline and nothing else.
    ...paired(theme, { borderColor: border.default.default }),
    '& svg': { width: size.glyph, height: size.glyph },
    // MUI marks the avatar `colorDefault` whenever no image is showing —
    // initials, an icon, or a photo that failed to load — so the role
    // colours land exactly when there is no picture to cover them.
    [`&.${avatarClasses.colorDefault}`]: paired(theme, {
      backgroundColor: role.bg,
      borderColor: role.line,
      color: role.ink,
    }),
  } satisfies CSSObject;
});

interface StyledBadgeProps {
  neofloSize: AvatarSize;
  neofloShape: AvatarShape;
  neofloBadgeColor: AvatarBadgeColor;
}

/**
 * The dot is placed by its own inset rather than MUI's anchor, which
 * centres it on the corner (or 14% in, on a circle) — further out than
 * the sheet draws it at every size.
 */
const StyledBadge = styled(MuiBadge, {
  shouldForwardProp: (prop) =>
    prop !== 'neofloSize' &&
    prop !== 'neofloShape' &&
    prop !== 'neofloBadgeColor',
})<StyledBadgeProps>(({ theme, neofloSize, neofloShape, neofloBadgeColor }) => {
  const size = sizeStyles[neofloSize];
  const inset =
    neofloShape === 'round' ? size.dotInset.round : size.dotInset.cornered;
  return {
    [`& .${badgeClasses.badge}`]: {
      boxSizing: 'border-box',
      minWidth: size.dot,
      width: size.dot,
      height: size.dot,
      padding: 0,
      bottom: inset,
      right: inset,
      transform: 'none',
      borderRadius: '50%',
      border: `${size.ring}px solid`,
      ...paired(theme, {
        backgroundColor: badgeColorTokens[neofloBadgeColor],
        borderColor: border.layers.page,
      }),
    },
  };
});

/**
 * Branded avatar for users and entities. Wraps MUI `Avatar` with the
 * Neoflo API from the Product Design System Figma (node 978:17187):
 * four sizes, three corner treatments, eight colour roles, an optional
 * status badge, and text / icon / image content.
 *
 * Content follows MUI conventions: pass `src` for a photo, otherwise
 * `children` render initials or an icon.
 *
 * @example Initials
 * <Avatar>OP</Avatar>
 *
 * @example A colour role
 * <Avatar color="purple">AV</Avatar>
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
      color = 'primary',
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
        neofloShape={shape}
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
        neofloSize={size}
        neofloShape={shape}
        neofloBadgeColor={badgeColor}
      >
        {avatar}
      </StyledBadge>
    );
  }
);

Avatar.displayName = 'Avatar';
