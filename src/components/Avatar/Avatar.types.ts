import type { AvatarProps as MuiAvatarProps } from '@mui/material';

/**
 * Avatar diameter, mapped from the Figma `size` axis (node 981:16471):
 * `lg` = 40px, `md` = 32px, `sm` = 24px.
 */
export type AvatarSize = 'sm' | 'md' | 'lg';

/**
 * Corner treatment, mapped from the Figma `roundness` axis. Matches the
 * design's own Code Connect mapping onto MUI Avatar variants:
 * `round` -> circular, `mid` -> rounded, `sharp` -> square.
 */
export type AvatarShape = 'round' | 'mid' | 'sharp';

/**
 * Background colour role for text / icon avatars (ignored when `src`
 * renders an image). `accent` is the Figma default (a subtle primary
 * tint — confirmed against node 981:16471, replacing the orange fill
 * assumed from the older sheet); the rest mirror the semantic palette
 * used across action controls.
 */
export type AvatarColor =
  | 'accent'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning';

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
  /** Background colour role for text / icon content. @default 'accent' */
  color?: AvatarColor;
  /** Show a status dot at the bottom-right. @default false */
  badge?: boolean;
  /** Status dot colour. @default 'success' */
  badgeColor?: AvatarBadgeColor;
}
