import type * as React from 'react';
import type { CheckboxProps as MuiCheckboxProps } from '@mui/material';

/**
 * Checkbox size, from the `small` boolean on the Figma component set
 * (node 3205:121943): `md` is the 16px box (`Scale/300`), `sm` the 12px
 * one (`Scale/250`).
 *
 * Declared as a ramp rather than a `small` flag to match `ButtonSize`,
 * `IconButtonSize` and `ChipSize`. Nothing is being redefined by doing
 * so — the control had no size prop before this.
 */
export type CheckboxSize = 'sm' | 'md';

/**
 * Props for the Neoflo `Checkbox`.
 *
 * Extends MUI's `CheckboxProps` minus the props the design system
 * fixes: `color` and the three icon slots (the box and its glyphs are
 * drawn from the Figma set), plus MUI's own `size` — replaced by the
 * two-rung `size` below, since MUI's `'small' | 'medium'` scales the
 * glyph's font size and the box is no longer a font glyph.
 *
 * Everything else — `checked`, `defaultChecked`, `onChange`,
 * `indeterminate`, `disabled`, `required`, `name`, `value`, `inputRef`,
 * `sx` — passes straight through to MUI.
 */
export interface CheckboxProps
  extends Omit<
    MuiCheckboxProps,
    'color' | 'size' | 'icon' | 'checkedIcon' | 'indeterminateIcon'
  > {
  /**
   * Visible label rendered beside the control. When omitted, provide
   * an `aria-label` instead.
   */
  label?: React.ReactNode;
  /** Box size. @default 'md' */
  size?: CheckboxSize;
}
