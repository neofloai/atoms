import type * as React from 'react';
import type {
  InputAdornmentProps as MuiInputAdornmentProps,
  TextFieldProps as MuiTextFieldProps,
} from '@mui/material';

/**
 * Props for `InputAdornment` — MUI's, unchanged, re-exported so a
 * consumer typing an adornment of their own never has to import from
 * `@mui/material` either. See `InputAdornment.tsx` for why the component
 * is a re-export rather than a wrapper.
 */
export type InputAdornmentProps = MuiInputAdornmentProps;

/**
 * Validation status of the field, mapped from the Figma `type` axis
 * (error / success / warning variants). Colours the border and helper
 * text. Omit for the neutral state.
 */
export type TextFieldStatus = 'error' | 'success' | 'warning';

/**
 * Field height: `md` = 36px, `lg` = 40px. Label, helper text and the
 * input's type are the same at both; only the field box grows.
 */
export type TextFieldSize = 'md' | 'lg';

/**
 * Props for the Neoflo `TextField`.
 *
 * Extends MUI's `TextFieldProps` minus the props we remap or manage
 * internally (`variant`, `color`, `error`, `size`, `slotProps`) —
 * `size` is replaced by the Neoflo `md` / `lg` ladder.
 * Everything else — `label`, `placeholder`, `helperText`, `value`,
 * `onChange`, `multiline`, `rows`, `minRows`, `maxRows`, `fullWidth`,
 * `disabled`, `sx` — passes through.
 */
export interface TextFieldProps
  extends Omit<
    MuiTextFieldProps,
    'variant' | 'color' | 'error' | 'size' | 'slotProps'
  > {
  /**
   * Validation status. Tints the field and colours its border, helper
   * text and adornment glyphs; the label stays neutral.
   */
  status?: TextFieldStatus;
  /** Field height. @default 'md' */
  size?: TextFieldSize;
  /** Element rendered at the start of the input, inside the border. */
  startAdornment?: React.ReactNode;
  /** Element rendered at the end of the input, inside the border. */
  endAdornment?: React.ReactNode;
  /**
   * Shows a live "length/max" counter next to the label (requires
   * `label`) and enforces it as the native HTML `maxlength`.
   */
  maxLength?: number;
}
