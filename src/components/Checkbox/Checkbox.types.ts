import type * as React from 'react';
import type { CheckboxProps as MuiCheckboxProps } from '@mui/material';
import type { SelectorSize } from '../_shared/selectorStyles';

/**
 * Control size, from the `Small` boolean on the Figma checkbox set:
 * `md` is 16 (`Small=False`), `sm` is 12 (`Small=True`). The same ramp
 * `Radio` takes — they are one sheet.
 */
export type CheckboxSize = SelectorSize;

/**
 * Props for the Neoflo `Checkbox`.
 *
 * Extends MUI's `CheckboxProps` minus the props we manage internally
 * (`color`, and the icon slots — the design system fixes the glyphs)
 * and with `size` remapped from MUI's `small`/`medium` to the house
 * `sm`/`md` ramp. Everything else — `checked`, `defaultChecked`,
 * `onChange`, `indeterminate`, `disabled`, `sx` — passes through to the
 * control.
 */
export interface CheckboxProps
  extends Omit<
    MuiCheckboxProps,
    'color' | 'size' | 'icon' | 'checkedIcon' | 'indeterminateIcon'
  > {
  /**
   * Visible label rendered beside the control.
   */
  label?: React.ReactNode;
  /** Control size. @default 'md' */
  size?: CheckboxSize;
}
