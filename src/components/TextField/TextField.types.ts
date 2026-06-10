import type * as React from 'react';
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material';

/**
 * Validation status of the field, mapped from the Figma `type` axis
 * (error / success / warning variants). Colours the border and helper
 * text. Omit for the neutral state.
 */
export type TextFieldStatus = 'error' | 'success' | 'warning';

/**
 * Props for the Neoflo `TextField`.
 *
 * Extends MUI's `TextFieldProps` minus the props we remap or manage
 * internally (`variant`, `color`, `error`, `size`, `slotProps`).
 * Everything else — `label`, `placeholder`, `helperText`, `value`,
 * `onChange`, `multiline`, `rows`, `minRows`, `maxRows`, `fullWidth`,
 * `disabled`, `sx` — passes through.
 */
export interface TextFieldProps
  extends Omit<
    MuiTextFieldProps,
    'variant' | 'color' | 'error' | 'size' | 'slotProps'
  > {
  /** Validation status. Colours the border and helper text. */
  status?: TextFieldStatus;
  /** Element rendered at the start of the input, inside the border. */
  startAdornment?: React.ReactNode;
  /** Element rendered at the end of the input, inside the border. */
  endAdornment?: React.ReactNode;
}
