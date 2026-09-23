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
 * Visual emphasis of the button. `contained`, `outline` and `text` come
 * from the Figma `style` axis; `prominent` sits above all three.
 *
 *   - `prominent` — gradient fill at heading size, highest emphasis
 *   - `contained` — solid fill
 *   - `outline`   — 1px border, transparent fill
 *   - `text`      — label only, lowest emphasis
 *
 * Wider than `ActionAppearance` by exactly one value. That union is
 * shared with `IconButton`, and `prominent` is drawn for a labelled
 * button only, so it is added here rather than there.
 */
export type ButtonAppearance = ActionAppearance | 'prominent';

/**
 * Control height: `sm` = 32px, `md` = 36px, `lg` = 44px.
 *
 * `appearance="prominent"` has one height of its own (48) and ignores
 * this — see `ButtonProps.size`.
 */
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
  /**
   * Control size. Ignored when `appearance="prominent"`, which is drawn
   * at one size only — it is the page's single call to action, and a
   * small one would be a contradiction.
   *
   * @default 'md'
   */
  size?: ButtonSize;
}
