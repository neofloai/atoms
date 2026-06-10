'use client';

import * as React from 'react';
import { TextField as MuiTextField } from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  border,
  fontWeights,
  radius,
  spacing,
  text,
  typography,
} from '@/src/tokens';

import { paired } from '../_shared/actionStyles';

import type { CSSObject } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';
import type { TextFieldProps, TextFieldStatus } from './TextField.types';

/**
 * Figma field spec is Sans/B2/Medium with a 24px leading (Scale/400).
 * The `typography.body.b2` token currently carries a placeholder 20px
 * leading, so the leading is pinned here until the responsive type
 * tokens are resolved.
 */
const FIELD_LEADING_PX = 24;

/**
 * Vertical slot padding (Scale/250). MUI's notched outline is an
 * absolutely-positioned fieldset, so like Figma's inside stroke the
 * 2px border overlays the padding: 24px line + 2 x 12px = 48px tall.
 */
const FIELD_PADDING_BLOCK_PX = 12;

const statusBorderTokens: Record<TextFieldStatus, ModeToken> = {
  error: border.error.default,
  success: border.success.default,
  warning: border.warning.default,
};

const statusHelperTokens: Record<TextFieldStatus, ModeToken> = {
  error: text.error.heading,
  success: text.success.heading,
  warning: text.warning.heading,
};

interface StyledTextFieldProps {
  neofloStatus?: TextFieldStatus;
}

const StyledTextField = styled(MuiTextField, {
  shouldForwardProp: (prop) => prop !== 'neofloStatus',
})<StyledTextFieldProps>(({ theme, neofloStatus }) => {
  const fieldFont: CSSObject = {
    fontFamily: theme.typography.fontFamily,
    fontSize: typography.body.b2.size,
    fontWeight: fontWeights.medium,
    lineHeight: `${FIELD_LEADING_PX}px`,
  };

  const styles: CSSObject = {
    // Static label above the field (the Figma design has no floating
    // label), aligned with the slot's 16px inner padding.
    '& .MuiInputLabel-root': {
      position: 'static',
      transform: 'none',
      maxWidth: 'none',
      padding: `0 ${spacing.component.sm}px`,
      marginBottom: spacing.component.xxs,
      ...fieldFont,
      ...paired(theme, { color: text.default.body }),
      '&.Mui-focused, &.Mui-error': paired(theme, {
        color: text.default.body,
      }),
      '&.Mui-disabled': paired(theme, { color: text.disabled.default }),
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: radius.sm,
      padding: 0,
      ...fieldFont,
      ...paired(theme, { color: text.default.body }),
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: 2,
        ...paired(theme, { borderColor: border.default.default }),
        // The label renders outside the field, so collapse the notch.
        '& legend': { width: 0 },
      },
      '&:hover:not(.Mui-focused):not(.Mui-disabled) .MuiOutlinedInput-notchedOutline':
        paired(theme, { borderColor: border.default.defaultHover }),
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': paired(theme, {
        borderColor: border.primary.default,
      }),
      '&.Mui-disabled': {
        ...paired(theme, { color: text.disabled.default }),
        '& .MuiOutlinedInput-notchedOutline': paired(theme, {
          borderColor: border.disabled.default,
        }),
      },
      '&.MuiInputBase-multiline': {
        padding: `${FIELD_PADDING_BLOCK_PX}px ${spacing.component.sm}px`,
      },
    },
    '& .MuiOutlinedInput-input': {
      height: 'auto',
      padding: `${FIELD_PADDING_BLOCK_PX}px ${spacing.component.sm}px`,
      '&::placeholder': {
        opacity: 1,
        ...paired(theme, { color: text.default.placeholder }),
      },
      '&.Mui-disabled': {
        ...paired(theme, { color: text.disabled.default }),
        WebkitTextFillColor: 'unset',
      },
    },
    // Multiline padding lives on the root, not the textarea.
    '& .MuiInputBase-inputMultiline': { padding: 0 },
    '& .MuiInputAdornment-root': {
      margin: `0 ${spacing.component.sm}px`,
      ...paired(theme, { color: text.default.caption }),
    },
    '& .MuiFormHelperText-root': {
      margin: `${spacing.component.xs}px 0 0`,
      padding: `0 ${spacing.component.sm}px`,
      ...fieldFont,
      ...paired(theme, { color: text.default.caption }),
      '&.Mui-disabled': paired(theme, { color: text.disabled.default }),
    },
  };

  if (neofloStatus) {
    // Status colour wins over the resting, hover, and focused borders.
    styles[
      [
        '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline',
        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline',
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline',
      ].join(', ')
    ] = paired(theme, { borderColor: statusBorderTokens[neofloStatus] });
    styles['& .MuiFormHelperText-root:not(.Mui-disabled)'] = paired(theme, {
      color: statusHelperTokens[neofloStatus],
    });
  }

  return styles;
});

/**
 * Branded text input. Wraps MUI `TextField` with the Neoflo API from
 * the Product Design System Figma (nodes 953:1059 and 973:5904):
 * static label above the field, 2px border with hover / focus /
 * disabled styling, validation statuses that colour the border and
 * helper text, and single or multi-line input in both colour schemes.
 *
 * Multi-line behaviour maps to the Figma variants: `minRows`/`maxRows`
 * grows with content (flexible), `rows` fixes the height and scrolls
 * overflow (inflexible / scroll).
 *
 * @example Labelled field with helper text
 * <TextField label="Email" placeholder="you@neoflo.ai" helperText="Work email preferred" />
 *
 * @example Validation error
 * <TextField label="Amount" status="error" helperText="Amount is required" />
 *
 * @example Fixed-height multi-line
 * <TextField label="Notes" multiline rows={4} />
 */
export const TextField = React.forwardRef<HTMLDivElement, TextFieldProps>(
  ({ status, startAdornment, endAdornment, ...rest }, ref) => (
    <StyledTextField
      ref={ref}
      variant="outlined"
      error={status === 'error'}
      neofloStatus={status}
      slotProps={{
        inputLabel: { shrink: true, disableAnimation: true },
        input: { notched: false, startAdornment, endAdornment },
      }}
      {...rest}
    />
  )
);

TextField.displayName = 'TextField';
