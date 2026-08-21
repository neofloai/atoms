'use client';

import * as React from 'react';
import { TextField as MuiTextField } from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  border,
  fontWeights,
  icon,
  radius,
  spacing,
  surface,
  text,
  typography,
} from '@/src/tokens';
import { CaretDownIcon } from '@/src/icons';

import { paired } from '../_shared/actionStyles';
import { ASTERISK_GAP_PX } from '../_shared/fieldStyles';

import type { CSSObject } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';
import type { SelectProps, SelectStatus } from './Select.types';

/**
 * Field inset + icon/text gap (Scale/200), matching `TextField` (node
 * 3179:106156) — this Select shares the same field anatomy (node
 * 3179:107344).
 */
const FIELD_PADDING_PX = spacing.component.xs;

const statusBorderTokens: Record<SelectStatus, ModeToken> = {
  error: border.error.focus,
  success: border.success.focus,
  warning: border.warning.focus,
};

/**
 * Label + helper text colour per status — identical mapping to
 * `TextField`'s (the Figma numbered accent variables resolve to the
 * same tokens in both components).
 */
const statusTextTokens: Record<SelectStatus, ModeToken> = {
  error: text.error.onColorHover,
  success: text.success.onColorHover,
  warning: text.warning.caption,
};

interface StyledSelectProps {
  neofloStatus?: SelectStatus;
}

const StyledSelect = styled(MuiTextField, {
  shouldForwardProp: (prop) => prop !== 'neofloStatus',
})<StyledSelectProps>(({ theme, neofloStatus }) => {
  const labelFont: CSSObject = {
    fontFamily: theme.typography.fontFamily,
    fontSize: typography.body.b2.size,
    fontWeight: fontWeights.regular,
    lineHeight: `${typography.body.b2.leading}px`,
  };

  const fieldFont: CSSObject = {
    fontFamily: theme.typography.fontFamily,
    fontSize: typography.body.b1.size,
    fontWeight: fontWeights.regular,
    lineHeight: `${typography.body.b1.leading}px`,
    letterSpacing: `${typography.body.b1.letterSpacing}em`,
  };

  const helperFont: CSSObject = {
    fontFamily: theme.typography.fontFamily,
    fontSize: typography.body.caption.size,
    fontWeight: fontWeights.regular,
    lineHeight: `${typography.body.caption.leading}px`,
    letterSpacing: `${typography.body.caption.letterSpacing}em`,
  };

  const styles: CSSObject = {
    // Static label above the field, matching TextField's anatomy.
    '& .MuiInputLabel-root': {
      position: 'static',
      transform: 'none',
      maxWidth: 'none',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      // Packed from the start. `TextField` spreads its label row so the
      // character counter can sit at the far end; a `Select` has no
      // counter, so copying that left the required asterisk — which MUI
      // renders as a sibling of the label text, not inside it — as the
      // only other flex item, thrown to the opposite edge of the field.
      justifyContent: 'flex-start',
      padding: `0 ${FIELD_PADDING_PX}px`,
      marginBottom: spacing.component.xxs,
      ...labelFont,
      ...paired(theme, { color: text.default.placeholder }),
      '&.Mui-focused': paired(theme, { color: text.default.placeholder }),
      '&.Mui-disabled': paired(theme, { color: text.disabled.default }),
      // The space in MUI's " *" collapses at the start of a flex item.
      '& .MuiFormLabel-asterisk': { marginLeft: ASTERISK_GAP_PX },
    },
    '& .MuiOutlinedInput-root': {
      borderRadius: radius.sm,
      // Inset from the border on every edge; `gap` spaces the
      // icon/value apart from each other, not from the box edges.
      padding: FIELD_PADDING_PX,
      gap: FIELD_PADDING_PX,
      cursor: 'pointer',
      ...fieldFont,
      // Resting value text reads a step lighter than TextField's
      // input text (Figma's `text/default/b2`, not `b1`) — it only
      // reaches full body strength while the menu is open.
      ...paired(theme, {
        color: text.default.caption,
        backgroundColor: surface.layers.page,
      }),
      '& .MuiOutlinedInput-notchedOutline': {
        borderWidth: 1,
        ...paired(theme, { borderColor: border.layers.card1 }),
        '& legend': { width: 0 },
      },
      '&:hover:not(.Mui-focused):not(.Mui-disabled)': paired(theme, {
        backgroundColor: surface.layers.card1,
      }),
      // Open state connects visually into the menu below (node
      // 3179:107379): square off the bottom corners and swap the
      // resting border for a bottom accent line, rather than a full
      // focus-ring colour change. Value text also steps up to full
      // body strength.
      '&.Mui-focused': {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        ...paired(theme, {
          backgroundColor: surface.layers.card1,
          color: text.default.body,
        }),
        '& .MuiOutlinedInput-notchedOutline': {
          borderWidth: 1,
          ...paired(theme, {
            borderColor: border.layers.card1,
            borderBottomColor: border.primary.focus,
          }),
        },
      },
      '&.Mui-disabled': {
        cursor: 'default',
        ...paired(theme, {
          color: text.disabled.default,
          backgroundColor: surface.disabled.default,
        }),
        '& .MuiOutlinedInput-notchedOutline': paired(theme, {
          borderColor: border.layers.card2,
        }),
      },
    },
    // MUI reserves fixed padding on the value slot for the arrow icon;
    // our icon flows through the root's `gap` instead, so it's zeroed.
    '& .MuiSelect-select.MuiSelect-select': {
      padding: 0,
      minHeight: 'auto',
      display: 'flex',
      alignItems: 'center',
    },
    // MUI absolutely positions the arrow at the box edge by default;
    // switching to static lets it sit in the flex flow after the
    // value, spaced by the root's `gap` like TextField's adornments.
    // The built-in 180deg open-state rotation still applies untouched.
    '& .MuiSelect-icon': {
      position: 'static',
      top: 'auto',
      right: 'auto',
      width: 16,
      height: 16,
      ...paired(theme, { color: icon.default.caption }),
      '&.Mui-disabled': paired(theme, { color: icon.disabled.default }),
    },
    '& .MuiFormHelperText-root': {
      margin: `${spacing.component.xxs}px 0 0`,
      padding: `0 ${FIELD_PADDING_PX}px`,
      ...helperFont,
      ...paired(theme, { color: text.default.placeholder }),
      '&.Mui-disabled': paired(theme, { color: text.disabled.default }),
    },
  };

  if (!neofloStatus) {
    // No status: a value present tints the resting box the same way
    // TextField's "filled" state does (node 3179:107344's `filled`
    // variant) — skipped once a status colours the border instead.
    styles['& .MuiOutlinedInput-root'] = {
      ...(styles['& .MuiOutlinedInput-root'] as CSSObject),
      '&[data-has-value="true"]:not(.Mui-focused):not(.Mui-disabled)': {
        ...paired(theme, { backgroundColor: surface.layers.card1 }),
        '& .MuiOutlinedInput-notchedOutline': paired(theme, {
          borderColor: border.layers.card2,
        }),
      },
    };
  } else {
    // Status colour wins over the resting, hover, and open borders,
    // and recolours the label + helper text.
    styles[
      [
        '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline',
        '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline',
        '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline',
      ].join(', ')
    ] = paired(theme, { borderColor: statusBorderTokens[neofloStatus] });
    styles['& .MuiInputLabel-root'] = {
      ...(styles['& .MuiInputLabel-root'] as CSSObject),
      ...paired(theme, { color: statusTextTokens[neofloStatus] }),
    };
    styles['& .MuiFormHelperText-root'] = {
      ...(styles['& .MuiFormHelperText-root'] as CSSObject),
      ...paired(theme, { color: statusTextTokens[neofloStatus] }),
    };
  }

  return styles;
});

function hasValue(value: unknown): boolean {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== '';
}

/**
 * Branded select. Wraps MUI `TextField`'s `select` composition with
 * the Neoflo API from the Product Design System Figma (node
 * 3179:107344): the same static-label-above-field anatomy as
 * `TextField`, a Phosphor caret that flips on open, validation
 * statuses that colour the whole border, and a subtle tint once a
 * value is selected.
 *
 * Options are `MenuItem`s passed as children, same as MUI's own
 * `<TextField select>`.
 *
 * @example Basic select
 * <Select label="Country" defaultValue="us">
 *   <MenuItem value="us">United States</MenuItem>
 *   <MenuItem value="ca">Canada</MenuItem>
 * </Select>
 *
 * @example Validation error
 * <Select label="Plan" status="error" helperText="Choose a plan">
 *   <MenuItem value="pro">Pro</MenuItem>
 * </Select>
 *
 * @see Related: TextField
 */
export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    { status, value, defaultValue, onChange, children, multiple, renderValue, ...rest },
    ref
  ) => {
    const isControlled = value !== undefined;
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
    const currentValue = isControlled ? value : uncontrolledValue;

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
      if (!isControlled) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setUncontrolledValue(event.target.value as any);
      }
      onChange?.(event);
    };

    return (
      <StyledSelect
        ref={ref}
        select
        variant="outlined"
        error={status === 'error'}
        neofloStatus={status}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        slotProps={{
          inputLabel: { shrink: true, disableAnimation: true },
          input: {
            // MUI's OutlinedInput spreads unknown props onto its root
            // DOM node (verified in TextField), which is where the
            // "has a value" tint hook needs to land -- cast needed
            // since the slot type doesn't model arbitrary data-*.
            'data-has-value': hasValue(currentValue),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          select: { IconComponent: CaretDownIcon, multiple, renderValue },
        }}
        {...rest}
      >
        {children}
      </StyledSelect>
    );
  }
);

Select.displayName = 'Select';
