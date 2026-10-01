import type { AvatarProps as MuiAvatarProps } from '@mui/material';

/**
 * Avatar diameter, mapped from the Figma `size` axis (node 978:17187):
 * `lg` = 44px, `md` = 36px, `sm` = 24px, `xs` = 20px. `xs` holds a
 * single initial — two letters do not fit at 10px in a 20px box.
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg';

/**
 * Corner treatment, mapped from the Figma `Shape` axis: `round` is the
 * sheet's `circle`, `mid` its `square` (4px corners) and `sharp` its
 * `sharp` (none).
 */
export type AvatarShape = 'round' | 'mid' | 'sharp';

/**
 * Colour role for initials and icon avatars — a pale fill, a hairline a
 * rung deeper, and a dark ink, all from one hue. Ignored when an image
 * renders. Named as `Chip`'s small tag names the same eight hues: the
 * sheet's blue is `information`, green `success`, yellow `warning`, red
 * `error` and grey `secondary`.
 */
export type AvatarColor =
  | 'primary'
  | 'purple'
  | 'information'
  | 'success'
  | 'warning'
  | 'orange'
  | 'error'
  | 'secondary';

/** Colour of the status `badge` dot. */
export type AvatarBadgeColor = 'success' | 'error' | 'warning' | 'neutral';

/**
 * Props for the Neoflo `Avatar`.
 *
 * Extends MUI's `AvatarProps` minus the props we remap (`variant`).
 * Content is driven the MUI way: `src` / `srcSet` render an image,
 * otherwise `children` render initials or an icon.
 */
export interface AvatarProps extends Omit<MuiAvatarProps, 'variant'> {
  /** Diameter. @default 'md' */
  size?: AvatarSize;
  /** Corner treatment. @default 'round' */
  shape?: AvatarShape;
  /** Colour role for initials and icon content. @default 'primary' */
  color?: AvatarColor;
  /** Show a status dot at the bottom-right. @default false */
  badge?: boolean;
  /** Status dot colour. @default 'success' */
  badgeColor?: AvatarBadgeColor;
}
