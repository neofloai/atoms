import type { ButtonProps as MuiButtonProps } from '@mui/material';
import type { ReactNode } from 'react';
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
  /**
   * The menu's options, as `MenuItem`s. Passing it makes this a split
   * button: the label keeps its own action, and a caret beside it — a
   * second, separate button — opens the menu anchored to the whole
   * control. The menu closes when an option is chosen.
   *
   * Drawn for `primary` and `secondary`, `contained` and `outline`, at
   * `sm`, `md` and `lg`. Ignored when `appearance="social"`.
   *
   * With a menu, `onClick`, `href`, `type`, `loading`, `startIcon`,
   * `endIcon` and the rest of the MUI props belong to the label's
   * button, and `ref` points at it; `className`, `style` and `sx` land
   * on the control as a whole. `disabled` and `fullWidth` apply to both
   * halves.
   */
  menu?: ReactNode;
  /**
   * Label of the caret button, which has no text of its own.
   * Only read when `menu` is set.
   *
   * @default 'More options'
   */
  menuLabel?: string;
}
