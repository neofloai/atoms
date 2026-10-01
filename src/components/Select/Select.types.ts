import type * as React from 'react';
import type { TextFieldProps as MuiTextFieldProps } from '@mui/material';

/**
 * Validation status of the field, mapped from the Figma `textFiled`
 * axis (error / success / warning variants). Tints the field and
 * colours its border, helper text and caret. Omit for the neutral state.
 */
export type SelectStatus = 'error' | 'success' | 'warning';

/**
 * Field height: `md` = 36px, `lg` = 40px — the same two heights as
 * `TextField`, so a select and a text field line up in one form row.
 */
export type SelectSize = 'md' | 'lg';

/**
 * Props for the Neoflo `Select`.
 *
 * Built on MUI's `<TextField select>` composition, so it inherits the
 * same label / helper text / status anatomy as `TextField`. Options
 * are passed as `children`, using MUI's `MenuItem` directly (there is
 * no separate `options` prop).
 *
 * Extends MUI's `TextFieldProps` minus the props we remap or manage
 * internally (`variant`, `color`, `error`, `size`, `slotProps`,
 * `select`) and the multi-line props, which don't apply to a select.
 */
export interface SelectProps
  extends Omit<
    MuiTextFieldProps,
    | 'variant'
    | 'color'
    | 'error'
    | 'size'
    | 'slotProps'
    | 'select'
    | 'multiline'
    | 'rows'
    | 'minRows'
    | 'maxRows'
  > {
  /** Validation status. Tints the field and colours its border and helper text. */
  status?: SelectStatus;
  /** Field height. @default 'md' */
  size?: SelectSize;
  /** `MenuItem` options rendered in the dropdown. */
  children: React.ReactNode;
  /** Allows selecting more than one option; `value` must be an array. */
  multiple?: boolean;
  /**
   * Renders the selected value(s) instead of MUI's default (which
   * looks up the matching `MenuItem`'s children). Required when
   * `multiple` is set and a custom summary (e.g. comma-joined labels)
   * is wanted instead of MUI's default array-to-string conversion.
   */
  renderValue?: (value: unknown) => React.ReactNode;
}
