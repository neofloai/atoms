import type { ButtonProps as MuiButtonProps } from '@mui/material';
import type {
  ActionAppearance,
  ActionVariant,
} from '../_shared/actionStyles';

/**
 * Colour role of the button, mapped from the Figma `type` axis.
 * `secondary` renders on neutral grey surfaces; all others use their
 * semantic colour scale.
 */
export type ButtonVariant = ActionVariant;

/**
 * Visual emphasis of the button, mapped from the Figma `style` axis.
 *
 *   - `contained` — solid fill, highest emphasis
 *   - `outline`   — 1px border, transparent fill
 *   - `text`      — label only, lowest emphasis
 */
export type ButtonAppearance = ActionAppearance;

/** Control height: `sm` = 32px, `md` = 36px, `lg` = 44px. */
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Props for the Neoflo `Button`.
 *
 * Extends MUI's `ButtonProps` minus the props we remap (`variant`,
 * `size`, `color`). Everything else — `onClick`, `startIcon`,
 * `endIcon`, `loading`, `disabled`, `href`, `sx` — passes through.
 */
export interface ButtonProps
  extends Omit<MuiButtonProps, 'variant' | 'size' | 'color'> {
  /** Colour role. @default 'primary' */
  variant?: ButtonVariant;
  /** Visual emphasis. @default 'contained' */
  appearance?: ButtonAppearance;
  /** Control size. @default 'md' */
  size?: ButtonSize;
}
