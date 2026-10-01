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
 * from the Figma `style` axis; `social` sits outside the ladder
 * entirely.
 *
 *   - `contained` — solid fill, highest emphasis
 *   - `outline`   — 1px border, transparent fill
 *   - `text`      — label only, lowest emphasis
 *   - `social`    — near-white card inside a neutral hairline; the
 *                   sign-in CTA, neutral only
 *
 * Wider than `ActionAppearance` by exactly one value. That union is
 * shared with `IconButton`, and `social` is drawn for a labelled button
 * only, so it is added here rather than there.
 */
export type ButtonAppearance = ActionAppearance | 'social';

/**
 * Control height: `sm` = 28px, `md` = 32px, `lg` = 40px, `xl` = 48px.
 *
 * `xl` is the page-level size — the one action a screen exists for,
 * beside its title. It is not a size for rows of controls.
 */
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Props for the Neoflo `Button`.
 *
 * Extends MUI's `ButtonProps` minus the props we remap (`variant`,
 * `size`, `color`). Everything else — `onClick`, `startIcon`,
 * `endIcon`, `loading`, `disabled`, `href`, `sx` — passes through.
 */
export interface ButtonProps
  extends Omit<MuiButtonProps, 'variant' | 'size' | 'color'> {
  /**
   * Colour role. Ignored when `appearance="social"`, which is drawn in
   * one neutral treatment only — it is the button a brand logo sits
   * inside, and a coloured one would compete with it.
   *
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /** Visual emphasis. @default 'contained' */
  appearance?: ButtonAppearance;
  /**
   * Control size. `xl` is for the page's single call to action, beside
   * its title; `sm`–`lg` are the ladder a caller walks to fit a control
   * into a row.
   *
   * Defaults to `'lg'` when `appearance="social"`, the size the sign-in
   * button is drawn at; `'md'` for every other appearance.
   *
   * @default 'md' ('lg' for appearance="social")
   */
  size?: ButtonSize;
}
