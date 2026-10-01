'use client';

import * as React from 'react';
import { TextField as MuiTextField } from '@mui/material';
import { styled } from '@mui/material/styles';

import { outlinedFieldStyles } from '../_shared/fieldStyles';

import type {
  TextFieldProps,
  TextFieldSize,
  TextFieldStatus,
} from './TextField.types';

interface StyledTextFieldProps {
  neofloStatus?: TextFieldStatus;
  neofloSize: TextFieldSize;
}

/**
 * The field itself is `outlinedFieldStyles`, shared with `Select` and
 * restated for the pickers — see `../_shared/fieldStyles.ts`. Nothing here
 * is specific to a text field except the counter, which that module styles
 * too because the label row it lives in is common to every field.
 */
const StyledTextField = styled(MuiTextField, {
  shouldForwardProp: (prop) => prop !== 'neofloStatus' && prop !== 'neofloSize',
})<StyledTextFieldProps>(({ theme, neofloStatus, neofloSize }) =>
  outlinedFieldStyles(theme, { status: neofloStatus, size: neofloSize })
);

/**
 * Branded text input. Wraps MUI `TextField` with the Neoflo API from
 * the Product Design System Figma (node 3179:106156): static label
 * above the field with an optional character counter, two heights
 * (`md` 36px, `lg` 40px), a 1px border with hover / focus / disabled
 * styling, validation statuses that tint the field and colour its
 * border and helper text, and single or multi-line input in both
 * colour schemes.
 *
 * Multi-line behaviour maps to the Figma variants: `minRows`/`maxRows`
 * grows with content (flexible), `rows` fixes the height and scrolls
 * overflow (inflexible / scroll).
 *
 * @example Labelled field with helper text
 * <TextField label="Email" placeholder="you@neoflo.ai" helperText="Work email preferred" />
 *
 * @example The larger field
 * <TextField size="lg" label="Search invoices" />
 *
 * @example Validation error
 * <TextField label="Amount" status="error" helperText="Amount is required" />
 *
 * @example Character counter
 * <TextField label="Bio" maxLength={100} />
 *
 * @example Fixed-height multi-line
 * <TextField label="Notes" multiline rows={4} />
 */
export const TextField = React.forwardRef<HTMLDivElement, TextFieldProps>(
  (
    {
      status,
      size = 'md',
      startAdornment,
      endAdornment,
      maxLength,
      label,
      value,
      defaultValue,
      onChange,
      ...rest
    },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [uncontrolledLength, setUncontrolledLength] = React.useState(
      () => String(defaultValue ?? '').length
    );
    const length = isControlled ? String(value ?? '').length : uncontrolledLength;

    const handleChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      if (!isControlled) setUncontrolledLength(event.target.value.length);
      onChange?.(event);
    };

    return (
      <StyledTextField
        ref={ref}
        variant="outlined"
        error={status === 'error'}
        neofloStatus={status}
        neofloSize={size}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        label={
          maxLength === undefined || !label ? (
            label
          ) : (
            <React.Fragment>
              {label}
              <span className="Neoflo-TextField-counter">
                {length}/{maxLength}
              </span>
            </React.Fragment>
          )
        }
        slotProps={{
          inputLabel: { shrink: true, disableAnimation: true },
          input: { notched: false, startAdornment, endAdornment },
          htmlInput: maxLength === undefined ? undefined : { maxLength },
        }}
        {...rest}
      />
    );
  }
);

TextField.displayName = 'TextField';
