'use client';

import * as React from 'react';
import { Checkbox as MuiCheckbox, FormControlLabel } from '@mui/material';
import { styled } from '@mui/material/styles';

import { fontWeights, icon, surface, text, typography } from '@/src/tokens';

import { CheckSquare, MinusSquare, Square } from '@/src/icons';

import { paired } from '../_shared/actionStyles';

import type { CheckboxProps } from './Checkbox.types';

/** Glyph size from the Figma selector set (node 2080:23677). */
const GLYPH_SIZE_PX = 24;

/*
 * TODO(DESIGNER_QUESTIONS.md #14): the Figma selector sheet shows a
 * success-green checked fill, no hover / focus-visible states, and
 * unresolved dark-mode values. The Phosphor Square / CheckSquare
 * glyphs are confirmed; until the rest is answered, the checked state
 * maps to the primary token instead of green and interaction
 * behaviour stays MUI default.
 */
const StyledCheckbox = styled(MuiCheckbox)(({ theme }) => ({
  ...paired(theme, { color: icon.default.placeholder }),
  '&.Mui-checked, &.MuiCheckbox-indeterminate': paired(theme, {
    color: surface.primary.default,
  }),
  '&.Mui-disabled': paired(theme, { color: icon.disabled.default }),
}));

const StyledFormControlLabel = styled(FormControlLabel)(({ theme }) => ({
  marginLeft: 0,
  marginRight: 0,
  '& .MuiFormControlLabel-label': {
    fontFamily: theme.typography.fontFamily,
    fontSize: typography.body.b1.size,
    fontWeight: fontWeights.medium,
    lineHeight: `${typography.body.b1.leading}px`,
    ...paired(theme, { color: text.default.body }),
    '&.Mui-disabled': paired(theme, { color: text.disabled.default }),
  },
}));

/**
 * Branded checkbox. Wraps MUI `Checkbox` with the Phosphor glyphs from
 * the Product Design System Figma selector set (node 2080:23677) —
 * Square outline unchecked, filled CheckSquare checked — with token
 * colours: primary checked fill, grey unchecked outline, and disabled
 * styling in both colour schemes. Interaction behaviour stays MUI
 * default.
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
        icon={<Square size={GLYPH_SIZE_PX} />}
        checkedIcon={<CheckSquare size={GLYPH_SIZE_PX} weight="fill" />}
        indeterminateIcon={<MinusSquare size={GLYPH_SIZE_PX} weight="fill" />}
        // The accessible name must land on the native input, not the
        // wrapping button, for assistive tech to announce it.
        slotProps={{ input: { 'aria-label': ariaLabel } }}
        {...rest}
      />
    );

    if (label === undefined || label === null) {
      return control;
    }

    return <StyledFormControlLabel control={control} label={label} />;
  }
);

Checkbox.displayName = 'Checkbox';
