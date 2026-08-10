'use client';

import * as React from 'react';
import { Checkbox as MuiCheckbox } from '@mui/material';
import { styled } from '@mui/material/styles';

import { icon, surface } from '@/src/tokens';

import { CheckSquareIcon, MinusSquareIcon, SquareIcon } from '@/src/icons';

import { paired } from '../_shared/actionStyles';
import { SelectorFormControlLabel } from '../_shared/SelectorLabel';

import type { CheckboxProps } from './Checkbox.types';

/** Glyph size from the Figma selector set (node 2080:23677). */
const GLYPH_SIZE_PX = 24;

/*
 * TODO(DESIGNER_QUESTIONS.md #14): the Figma selector sheet shows a
 * success-green checked fill, no hover / focus-visible states, and
 * unresolved dark-mode values. The Phosphor SquareIcon /
 * CheckSquareIcon glyphs are confirmed; until the rest is answered,
 * the checked state maps to the primary token instead of green and
 * interaction behaviour stays MUI default.
 */
const StyledCheckbox = styled(MuiCheckbox)(({ theme }) => ({
  ...paired(theme, { color: icon.default.placeholder }),
  '&.Mui-checked, &.MuiCheckbox-indeterminate': paired(theme, {
    color: surface.primary.default,
  }),
  '&.Mui-disabled': paired(theme, { color: icon.disabled.default }),
}));

/**
 * Branded checkbox. Wraps MUI `Checkbox` with the Phosphor glyphs from
 * the Product Design System Figma selector set (node 2080:23677) —
 * SquareIcon outline unchecked, filled CheckSquareIcon checked — with
 * token colours: primary checked fill, grey unchecked outline, and
 * disabled styling in both colour schemes. Interaction behaviour stays
 * MUI default.
 *
 * Pass `label` to render a clickable label beside the control; without
 * one, supply an `aria-label`.
 *
 * @example Labelled checkbox
 * <Checkbox label="Remember me" defaultChecked />
 *
 * @example Controlled, no visible label
 * <Checkbox aria-label="Select row" checked={isSelected} onChange={handleToggle} />
 */
export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ label, 'aria-label': ariaLabel, ...rest }, ref) => {
    const control = (
      <StyledCheckbox
        ref={ref}
        icon={<SquareIcon size={GLYPH_SIZE_PX} />}
        checkedIcon={<CheckSquareIcon size={GLYPH_SIZE_PX} weight="fill" />}
        indeterminateIcon={<MinusSquareIcon size={GLYPH_SIZE_PX} weight="fill" />}
        // The accessible name must land on the native input, not the
        // wrapping button, for assistive tech to announce it.
        slotProps={{ input: { 'aria-label': ariaLabel } }}
        {...rest}
      />
    );

    if (label === undefined || label === null) {
      return control;
    }

    return <SelectorFormControlLabel control={control} label={label} />;
  }
);

Checkbox.displayName = 'Checkbox';
