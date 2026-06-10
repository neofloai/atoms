import type { IconButtonProps as MuiIconButtonProps } from '@mui/material';
import type {
  ActionAppearance,
  ActionVariant,
} from '../_shared/actionStyles';

/**
 * Colour role of the icon button, mapped from the Figma `type` axis.
 * Mirrors `ButtonVariant` so the two controls compose consistently.
 */
export type IconButtonVariant = ActionVariant;

/**
 * Visual emphasis of the icon button, mapped from the Figma `style`
 * axis: solid fill, 1px border, or bare glyph.
 */
export type IconButtonAppearance = ActionAppearance;

/** Square control size: `sm` = 32px, `md` = 40px, `lg` = 48px. */
export type IconButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Neoflo `IconButton`.
 *
 * Extends MUI's `IconButtonProps` minus the props we remap (`size`,
 * `color`). Everything else — `onClick`, `disabled`, `loading`,
 * `href`, `sx` — passes through.
 *
 * Icon-only controls have no visible text: always provide an
 * `aria-label` describing the action.
 */
export interface IconButtonProps
  extends Omit<MuiIconButtonProps, 'size' | 'color'> {
  /** Colour role. @default 'primary' */
  variant?: IconButtonVariant;
  /** Visual emphasis. @default 'contained' */
  appearance?: IconButtonAppearance;
  /** Control size. @default 'md' */
  size?: IconButtonSize;
}
