'use client';

import * as React from 'react';
import { TextField as MuiTextField } from '@mui/material';
import { styled } from '@mui/material/styles';

import { CaretDownIcon } from '@/src/icons/glyphs';

import { paired } from '../_shared/actionStyles';
import {
  ADORNMENT_GLYPH_PX,
  fieldInk,
  fieldStatusInk,
  outlinedFieldStyles,
} from '../_shared/fieldStyles';

import type { CSSObject } from '@mui/material/styles';
import type { SelectProps, SelectSize, SelectStatus } from './Select.types';

interface StyledSelectProps {
  neofloStatus?: SelectStatus;
  neofloSize: SelectSize;
}

/**
 * The field is `TextField`'s, outright: both are MUI `TextField`s, so
 * `outlinedFieldStyles` styles this one without restating anything. What
 * follows is only what a select adds — its caret, and a pointer cursor.
 *
 * Two things this used to do differently are gone with the 1 October
 * redraw, because the field they belonged to is gone: the resting value
 * read a step lighter (`b2`) than a text field's, and an open select
 * squared off its bottom corners and drew a primary underline to join
 * the menu below. The value now reads `b1` and focus is the same full
 * dark hairline every field uses. The sheet for `Select` itself (node
 * 3179:107344) has not been redrawn — DESIGNER_QUESTIONS.md #67.
 */
const StyledSelect = styled(MuiTextField, {
  shouldForwardProp: (prop) => prop !== 'neofloStatus' && prop !== 'neofloSize',
})<StyledSelectProps>(({ theme, neofloStatus, neofloSize }) => {
  const styles = outlinedFieldStyles(theme, {
    status: neofloStatus,
    size: neofloSize,
  });
  const root = styles['& .MuiOutlinedInput-root'] as CSSObject;
  const tone = neofloStatus ? fieldStatusInk[neofloStatus] : undefined;

  return {
    ...styles,
    '& .MuiOutlinedInput-root': {
      ...root,
      cursor: 'pointer',
      '&.Mui-disabled': {
        ...(root['&.Mui-disabled'] as CSSObject),
        cursor: 'default',
      },
    },
    // MUI reserves fixed padding on the value slot for the arrow icon;
    // the caret flows through the root's `gap` instead, so it's zeroed.
    '& .MuiSelect-select.MuiSelect-select': {
      padding: 0,
      minHeight: 'auto',
      display: 'flex',
      alignItems: 'center',
    },
    // MUI absolutely positions the arrow at the box edge; static lets it
    // sit in the flex flow after the value, spaced by the root's `gap`
    // like any other adornment, and in the same ink. The built-in 180deg
    // open-state rotation still applies.
    '& .MuiSelect-icon': {
      position: 'static',
      top: 'auto',
      right: 'auto',
      width: ADORNMENT_GLYPH_PX,
      height: ADORNMENT_GLYPH_PX,
      // The value slot takes the row's full width, so without this the
      // caret was the flex item that gave way — 12px at `md`, 14 at `lg`.
      flexShrink: 0,
      ...paired(theme, { color: tone ? tone.glyph : fieldInk.glyph }),
      '&.Mui-disabled': paired(theme, { color: fieldInk.disabledGlyph }),
    },
  };
});

/**
 * Branded select. Wraps MUI `TextField`'s `select` composition with
 * the Neoflo API from the Product Design System Figma (node
 * 3179:107344): exactly `TextField`'s field — the same two heights,
 * label row, states and statuses — with a Phosphor caret that flips on
 * open.
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
    {
      status,
      size = 'md',
      value,
      defaultValue,
      onChange,
      children,
      multiple,
      renderValue,
      ...rest
    },
    ref
  ) => {
    return (
      <StyledSelect
        ref={ref}
        select
        variant="outlined"
        error={status === 'error'}
        neofloStatus={status}
        neofloSize={size}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        slotProps={{
          inputLabel: { shrink: true, disableAnimation: true },
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
