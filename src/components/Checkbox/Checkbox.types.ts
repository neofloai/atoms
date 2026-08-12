import type * as React from 'react';
import type { CheckboxProps as MuiCheckboxProps } from '@mui/material';

/**
 * Props for the Neoflo `Checkbox`.
 *
 * Extends MUI's `CheckboxProps` minus the props we manage internally
 * (`color`, `size`, and the icon slots — the design system fixes the
 * glyphs). Everything else — `checked`, `defaultChecked`, `onChange`,
 * `indeterminate`, `disabled`, `sx` — passes through to the control.
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
}
