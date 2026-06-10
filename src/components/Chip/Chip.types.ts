import type { ChipProps as MuiChipProps } from '@mui/material';
import type {
  ActionAppearance,
  ActionVariant,
} from '../_shared/actionStyles';

/**
 * Colour role of the chip, mapped from the Figma `type` axis. Mirrors
 * `ButtonVariant` so action controls compose consistently.
 */
export type ChipVariant = ActionVariant;

/**
 * Visual emphasis of the chip, mapped from the Figma `filled` axis:
 * `contained` (filled=True) or `outline` (filled=False). Chips have no
 * bare-text style.
 */
export type ChipAppearance = Exclude<ActionAppearance, 'text'>;

/** Pill height: `sm` = 32px, `md` = 40px. */
export type ChipSize = 'sm' | 'md';

/**
 * Props for the Neoflo `Chip`.
 *
 * Extends MUI's `ChipProps` minus the props we remap (`variant`,
 * `size`, `color`). Everything else — `label`, `avatar`, `icon`,
 * `deleteIcon`, `onDelete`, `onClick`, `clickable`, `disabled`, `sx` —
 * passes through.
 */
export interface ChipProps
  extends Omit<MuiChipProps, 'variant' | 'size' | 'color'> {
  /** Colour role. @default 'primary' */
  variant?: ChipVariant;
  /** Visual emphasis. @default 'contained' */
  appearance?: ChipAppearance;
  /** Pill size. @default 'md' */
  size?: ChipSize;
}
