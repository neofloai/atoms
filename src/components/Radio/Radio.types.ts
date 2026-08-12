import type * as React from 'react';
import type {
  RadioGroupProps as MuiRadioGroupProps,
  RadioProps as MuiRadioProps,
} from '@mui/material';

/**
 * Props for the Neoflo `Radio`.
 *
 * Extends MUI's `RadioProps` minus the props we manage internally
 * (`color`, `size`, and the icon slots — the design system fixes the
 * glyphs). Everything else — `checked`, `value`, `onChange`,
 * `disabled`, `sx` — passes through to the control.
 */
export interface RadioProps
  extends Omit<MuiRadioProps, 'color' | 'size' | 'icon' | 'checkedIcon'> {
  /**
   * Visible label rendered beside the control.
   */
  label?: React.ReactNode;
}

/**
 * Props for the Neoflo `RadioGroup`. Direct passthrough of MUI's
 * `RadioGroupProps` — the group is pure behaviour (shared `name`,
 * single selection, keyboard navigation) with no visual styling.
 */
export type RadioGroupProps = MuiRadioGroupProps;
