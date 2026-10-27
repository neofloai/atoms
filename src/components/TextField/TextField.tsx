'use client';

import * as React from 'react';
import { TextField as MuiTextField } from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  FIELD_BOX_RADIUS,
  FIELD_CAPTION_TYPE,
  FIELD_CONTENT_HEIGHT_PX,
  FIELD_HEIGHT_BY_SIZE,
  FIELD_MULTILINE_PADDING_BLOCK_PX,
  FIELD_STACK_GAP_PX,
  outlinedFieldStyles,
} from '../_shared/fieldStyles';
import { Skeleton } from '../Skeleton';
import {
  ForgotPasswordRow,
  PasswordRequirements,
  PasswordStack,
  PasswordToggle,
} from './passwordParts';

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
 * Width of a field that is not `fullWidth`, which is what MUI's input
 * measures at its default 20-character size in 13px type, plus the box's
 * inset. Matched so a loading field takes the same room as a loaded one.
 */
const SKELETON_FIELD_WIDTH_PX = 160;

/** The sheet's label and helper bars are 16 tall. */
const SKELETON_BAR_HEIGHT_PX = 16;

/** The loaded helper row: 14px of caption type with `Scale/100` round it. */
const FIELD_HELPER_ROW_HEIGHT_PX =
  FIELD_CAPTION_TYPE.leading + 2 * FIELD_STACK_GAP_PX;

/**
 * The `skeleton` state (node 3179:106644): a bar for the label, one for the
 * field and one for the helper, stacked at the field's own gap.
 *
 * Each bar stands in only for a row the loaded field will have, and the
 * field bar is the loaded field's height, so nothing moves when the value
 * arrives. The sheet draws the field bar 36 tall at `lg` too, which would
 * make a `lg` form jump 4px per field; see DESIGNER_QUESTIONS.md #74.
 *
 * The label and helper bars are the sheet's 48 and 80 wide on the 8px
 * `rounded` radius `Skeleton` already has. The field bar takes the field's
 * 4px corner.
 */
const SkeletonStack = styled('div', {
  shouldForwardProp: (prop) => prop !== 'neofloFullWidth',
})<{ neofloFullWidth?: boolean }>(({ neofloFullWidth }) => ({
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: FIELD_STACK_GAP_PX,
  verticalAlign: 'top',
  width: neofloFullWidth ? '100%' : SKELETON_FIELD_WIDTH_PX,
  maxWidth: '100%',
}));

const FieldBar = styled(Skeleton)({ borderRadius: FIELD_BOX_RADIUS });

/**
 * The helper bar's slot: the helper row is `Scale/100` + 14 + `Scale/100`,
 * so the 16px bar is centred in 22 to keep the stack its loaded height.
 */
const HelperSlot = styled('div')({
  paddingBlock: (FIELD_HELPER_ROW_HEIGHT_PX - SKELETON_BAR_HEIGHT_PX) / 2,
});

/** The loaded field's box height, for the bar that stands in for it. */
function fieldBoxHeight(
  size: TextFieldSize,
  multiline: boolean | undefined,
  rows: TextFieldProps['rows'],
  minRows: TextFieldProps['minRows']
): number {
  if (!multiline) return FIELD_HEIGHT_BY_SIZE[size];
  const lines = Number(rows ?? minRows ?? 1);
  return lines * FIELD_CONTENT_HEIGHT_PX + 2 * FIELD_MULTILINE_PADDING_BLOCK_PX;
}

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
 * `type="password"` is the password variant (node 4680:7190): the same
 * field with a show / hide toggle at its end, plus, when asked for, a
 * checklist of the rules a new password must meet (`requirements`) and a
 * forgot-password row (`forgotPassword`). Every other prop behaves as it
 * does on any field. `autoComplete` defaults to `new-password` when
 * `requirements` is set and `current-password` otherwise, so a password
 * manager offers to generate one in the first case and fill one in the
 * second.
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
 *
 * @example While the value loads
 * <TextField label="Company name" helperText="As registered" loading={isLoading} />
 *
 * @example Signing in
 * <TextField
 *   type="password"
 *   label="Password"
 *   required
 *   forgotPassword={<Link color="secondary" underline="hover" href="/reset">Forgot password?</Link>}
 * />
 *
 * @example Creating a password
 * <TextField
 *   type="password"
 *   label="New password"
 *   value={value}
 *   onChange={(e) => setValue(e.target.value)}
 *   requirements={[
 *     { label: 'Minimum 8 letters', met: value.length >= 8 },
 *     { label: 'At least one number', met: /\d/.test(value) },
 *     { label: 'At least one special character', met: /[^A-Za-z0-9]/.test(value) },
 *   ]}
 * />
 *
 * @see Related: Select, Link
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
      loading = false,
      type,
      requirements,
      forgotPassword,
      visible: visibleProp,
      defaultVisible = false,
      onVisibleChange,
      showPasswordLabel = 'Show password',
      hidePasswordLabel = 'Hide password',
      autoComplete,
      ...rest
    },
    ref
  ) => {
    const isPassword = type === 'password';
    const [uncontrolledVisible, setUncontrolledVisible] =
      React.useState(defaultVisible);
    const visible = visibleProp ?? uncontrolledVisible;

    const isControlled = value !== undefined;
    const [uncontrolledLength, setUncontrolledLength] = React.useState(
      () => String(defaultValue ?? '').length
    );
    const length = isControlled ? String(value ?? '').length : uncontrolledLength;

    if (loading) {
      const { helperText, fullWidth, multiline, rows, minRows, className, style, sx } =
        rest;
      return (
        <SkeletonStack
          ref={ref}
          aria-busy="true"
          className={className}
          style={style}
          sx={sx}
          neofloFullWidth={fullWidth}
        >
          {label && (
            <Skeleton
              variant="rounded"
              width={48}
              height={SKELETON_BAR_HEIGHT_PX}
            />
          )}
          <FieldBar
            variant="rounded"
            width="100%"
            height={fieldBoxHeight(size, multiline, rows, minRows)}
          />
          {helperText && (
            <HelperSlot>
              <Skeleton
                variant="rounded"
                width={80}
                height={SKELETON_BAR_HEIGHT_PX}
              />
            </HelperSlot>
          )}
        </SkeletonStack>
      );
    }

    const toggleVisible = () => {
      if (visibleProp === undefined) setUncontrolledVisible(!visible);
      onVisibleChange?.(!visible);
    };

    const handleChange = (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
      if (!isControlled) setUncontrolledLength(event.target.value.length);
      onChange?.(event);
    };

    // A caller's own end adornment still renders, before the toggle.
    const end = isPassword ? (
      <React.Fragment>
        {endAdornment}
        <PasswordToggle
          visible={visible}
          onToggle={toggleVisible}
          disabled={rest.disabled}
          controls={rest.id}
          showLabel={showPasswordLabel}
          hideLabel={hidePasswordLabel}
        />
      </React.Fragment>
    ) : (
      endAdornment
    );
    const rows =
      isPassword && (requirements?.length || forgotPassword) ? (
        <React.Fragment>
          {requirements && requirements.length > 0 && (
            <PasswordRequirements requirements={requirements} />
          )}
          {forgotPassword && <ForgotPasswordRow>{forgotPassword}</ForgotPasswordRow>}
        </React.Fragment>
      ) : null;
    const { className, style, sx, ...fieldRest } = rest;

    const field = (
      <StyledTextField
        ref={ref}
        variant="outlined"
        type={isPassword && visible ? 'text' : type}
        autoComplete={
          autoComplete ??
          (isPassword
            ? requirements
              ? 'new-password'
              : 'current-password'
            : undefined)
        }
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
          input: { notched: false, startAdornment, endAdornment: end },
          htmlInput: maxLength === undefined ? undefined : { maxLength },
        }}
        className={rows ? undefined : className}
        style={rows ? undefined : style}
        sx={rows ? undefined : sx}
        {...fieldRest}
      />
    );

    if (!rows) return field;

    return (
      <PasswordStack
        className={className}
        style={style}
        sx={sx}
        neofloFullWidth={rest.fullWidth}
      >
        {field}
        {rows}
      </PasswordStack>
    );
  }
);

TextField.displayName = 'TextField';
