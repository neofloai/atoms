'use client';

import * as React from 'react';
import { Badge as MuiBadge, badgeClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  fontFamilies,
  fontWeights,
  icon,
  radius,
  spacing,
  surface,
  text,
  typography,
} from '@/src/tokens';

import { paired } from '../_shared/actionStyles';

import type { BadgeProps as MuiBadgeProps } from '@mui/material';
import type { ModeToken } from '@/src/tokens';
import type { BadgeColor, BadgeProps } from './Badge.types';

/**
 * Neoflo colour role -> MUI palette role. Only `information` is renamed;
 * the rest already share MUI's word.
 *
 * The mapped value is forwarded so MUI still emits its own
 * `.MuiBadge-colorError`-style hook and its palette fill underneath.
 * Every colour below is then repainted from tokens by `roleStyles` —
 * a wrapper's `& .MuiBadge-badge` (0,2,0) outranks the prop-keyed
 * `variants` MUI declares inside the badge slot's own class (0,1,0).
 */
const muiColorMap: Record<BadgeColor, NonNullable<MuiBadgeProps['color']>> = {
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  error: 'error',
  warning: 'warning',
  information: 'info',
};

interface RoleTokens {
  /** Fill behind the count. */
  fill: ModeToken;
  /** The count's digits. */
  ink: ModeToken;
  /** Fill of the `dot` — see `DOT_SIZE_PX`. */
  mark: ModeToken;
}

/**
 * Colour per role.
 *
 * `fill` + `ink` are the system's filled treatment, the same pairing
 * `_shared/actionStyles.ts` gives a `contained` Button: the role's
 * `surface.<role>.default` under its `text.<role>.caption`, except
 * `primary`, whose fill is the one saturated brand colour and so takes
 * the on-colour heading slot instead. Reusing that pairing rather than
 * inventing one keeps a `warning` badge the same yellow as a `warning`
 * button.
 *
 * `mark` is a *different* rung on purpose. A `dot` has no digits, so its
 * fill is the whole signal, and the pale fills above have nothing to
 * read against at 8px — `surface.error.default` is `red/75`, which on a
 * white page is very nearly white. So the dot draws in the role's accent
 * ink (`icon.<role>.accent`), which is the token group meant for small
 * graphic marks and lands on the saturated middle of each ladder. On
 * `primary` the two happen to be the same colour, which is why a primary
 * dot and a primary count match exactly and the others are a shade
 * apart.
 *
 * `secondary` is the neutral role — MUI's `'default'` — and has no
 * accent rung, so its mark uses `icon.default.body`.
 */
const roleTokens: Record<BadgeColor, RoleTokens> = {
  primary: {
    fill: surface.primary.default,
    ink: text.default.headingOnColor,
    mark: icon.primary.accent,
  },
  secondary: {
    fill: surface.default.default,
    ink: text.default.body,
    mark: icon.default.body,
  },
  success: {
    fill: surface.success.default,
    ink: text.success.caption,
    mark: icon.success.accent,
  },
  error: {
    fill: surface.error.default,
    ink: text.error.caption,
    mark: icon.error.accent,
  },
  warning: {
    fill: surface.warning.default,
    ink: text.warning.caption,
    mark: icon.warning.accent,
  },
  information: {
    fill: surface.information.default,
    ink: text.information.caption,
    mark: icon.information.accent,
  },
};

/**
 * Height of the counter, and its minimum width — equal, so a
 * single-digit count is a circle and only two or more digits stretch it
 * into a pill. 20px is the same height as `Chip`'s flat tag, which is
 * the other 12px indicator in the library; it is not on a token ladder
 * (neither spacing nor radius has a 20 rung), so it is carried here the
 * way `Chip` carries its own heights.
 */
const COUNT_SIZE_PX = 20;

/**
 * Diameter of the `dot`. Matches the status dot `Avatar` draws through
 * this same MUI component, so the two read as one mark at one size.
 */
const DOT_SIZE_PX = 8;

interface StyledBadgeProps {
  neofloColor: BadgeColor;
}

const StyledBadge = styled(MuiBadge, {
  shouldForwardProp: (prop) => prop !== 'neofloColor',
})<StyledBadgeProps>(({ theme, neofloColor }) => {
  const role = roleTokens[neofloColor];
  return {
    // Only the badge itself is restyled. The root stays MUI's
    // `inline-flex` wrapper, and the badge keeps MUI's absolute
    // positioning, its `--Badge-inset` / `--Badge-translate` variables
    // (written as inline styles from `anchorOrigin` + `overlap`), its
    // `zIndex: 1`, and its scale-out transition for `invisible`.
    [`& .${badgeClasses.badge}`]: {
      height: COUNT_SIZE_PX,
      minWidth: COUNT_SIZE_PX,
      // MUI pads `0 6px`; 6 is not on the spacing ladder, and at 4 a
      // two-digit count still clears `minWidth`.
      padding: `0 ${spacing.component.xxs}px`,
      borderRadius: radius.full,
      fontFamily: fontFamilies.product.sans,
      fontSize: typography.body.b2.size,
      fontWeight: fontWeights.medium,
      letterSpacing: `${typography.body.b2.letterSpacing}em`,
      ...paired(theme, { backgroundColor: role.fill, color: role.ink }),
    },
    // Same (0,2,0) weight as the rule above, so this would win on order
    // alone; the extra class makes it (0,3,0) and independent of the
    // order Emotion happens to emit them in.
    [`& .${badgeClasses.badge}.${badgeClasses.dot}`]: {
      height: DOT_SIZE_PX,
      minWidth: DOT_SIZE_PX,
      padding: 0,
      ...paired(theme, { backgroundColor: role.mark }),
    },
  };
});

/**
 * Count or status mark anchored to the corner of another element.
 *
 * Wraps MUI `Badge` unchanged apart from colour: `color` takes the
 * Neoflo role names (`information` for MUI's `info`, `secondary` for its
 * neutral `default`) and every role is painted from the semantic
 * surface / text / icon tokens. MUI keeps the whole of the rest — the
 * `standard` / `dot` shape axis, `max` clamping to `99+`, `showZero`,
 * `invisible` with its scale-out transition, the four `anchorOrigin`
 * corners and their `overlap` offsets, and rendering standalone when
 * there is no child.
 *
 * @example Count on an icon button
 * <Badge badgeContent={4} color="error">
 *   <IconButton aria-label="4 unread notifications">
 *     <BellIcon />
 *   </IconButton>
 * </Badge>
 *
 * @example Status dot over an avatar
 * <Badge variant="dot" color="success" overlap="circular">
 *   <Avatar>OP</Avatar>
 * </Badge>
 *
 * @example Standalone
 * <Badge badgeContent="Beta" color="information" />
 *
 * @see Related: Avatar, Chip, IconButton
 */
export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ color = 'primary', ...rest }, ref) => (
    <StyledBadge
      ref={ref}
      color={muiColorMap[color]}
      neofloColor={color}
      {...rest}
    />
  )
);

Badge.displayName = 'Badge';
