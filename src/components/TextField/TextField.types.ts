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

/** One rule a new password has to meet, for the password variant's checklist. */
export interface PasswordRequirement {
  /** What the rule asks for, e.g. "At least one number". */
  label: React.ReactNode;
  /** Whether the current value meets it. */
  met: boolean;
}

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
  /**
   * Renders the field's skeleton in its place while its value loads: a
   * bar for the label, one for the field and one for the helper text,
   * each only when the loaded field has that row, and the field bar at
   * the loaded field's height so nothing moves when the value arrives.
   *
   * @default false
   */
  loading?: boolean;

  /* ---------------------------------------------- the password variant */

  /**
   * The rules a new password has to meet, listed under the field with a
   * cross until each is met and a tick after. Pass it when the field
   * creates a password; leave it out when it signs someone in. The field
   * does not test the value — work out `met` from it, so the rules stay
   * yours to define. Only read when `type="password"`.
   */
  requirements?: readonly PasswordRequirement[];
  /**
   * Shown right-aligned under the field: the way back for someone who
   * has forgotten their password. Pass a `Link` with `color="secondary"`;
   * it takes the row's type. Only read when `type="password"`.
   */
  forgotPassword?: React.ReactNode;
  /** Whether the password shows as text. Controlled. Only read when `type="password"`. */
  visible?: boolean;
  /**
   * Whether the password starts out as text. Uncontrolled. Only read
   * when `type="password"`.
   *
   * @default false
   */
  defaultVisible?: boolean;
  /** Called with the new state when the toggle is pressed. */
  onVisibleChange?: (visible: boolean) => void;
  /** The toggle's label while the password is hidden. @default 'Show password' */
  showPasswordLabel?: string;
  /** The toggle's label while the password shows. @default 'Hide password' */
  hidePasswordLabel?: string;
}
