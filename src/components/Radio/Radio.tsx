'use client';

import * as React from 'react';
import { Radio as MuiRadio } from '@mui/material';
import { styled } from '@mui/material/styles';

import { icon, surface } from '@/src/tokens';

import { CircleIcon, RadioButtonIcon } from '@/src/icons';

import { paired } from '../_shared/actionStyles';
import { SelectorFormControlLabel } from '../_shared/SelectorLabel';

import type { RadioProps } from './Radio.types';

/** Glyph size from the Figma selector set (node 2080:23677). */
const GLYPH_SIZE_PX = 24;

/**
 * Matches the inner-circle extent of the sheet's RadioButtonIcon glyph
 * (12px inside the 24px frame).
 */
const DOT_SIZE_PX = 12;

/*
 * The selected state is two-tone — dark outer ring, primary filled
 * dot — which no single Phosphor glyph provides, so it is composed
 * from two CircleIcon glyphs coloured independently below.
 */
const checkedGlyph = (
  <span className="NeofloRadio-checkedGlyph">
    <CircleIcon size={GLYPH_SIZE_PX} />
    <CircleIcon size={DOT_SIZE_PX} weight="fill" className="NeofloRadio-dot" />
  </span>
);

/*
 * TODO(DESIGNER_QUESTIONS.md #14): the Figma selector sheet renders
 * the selected radio in flat grey (an apparent export inconsistency);
 * the design reference provided on 10 June shows a dark outer ring
 * with a primary filled dot, which is what is implemented. Hover /
 * focus-visible states and dark-mode values remain unconfirmed, so
 * interaction behaviour stays MUI default and colours are token-only.
 */
const StyledRadio = styled(MuiRadio)(({ theme }) => ({
  ...paired(theme, { color: icon.default.placeholder }),
  '&.Mui-checked': paired(theme, { color: icon.default.heading }),
  '& .NeofloRadio-checkedGlyph': {
    position: 'relative',
    display: 'inline-flex',
  },
  '& .NeofloRadio-dot': {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    ...paired(theme, { color: surface.primary.default }),
  },
  '&.Mui-disabled': paired(theme, { color: icon.disabled.default }),
  '&.Mui-disabled .NeofloRadio-dot': paired(theme, {
    color: icon.disabled.default,
  }),
}));

/**
 * Branded radio button. Wraps MUI `Radio` with the Phosphor glyphs
 * from the Product Design System Figma selector set (node 2080:23677)
 * — concentric-ring RadioButtonIcon outline unselected, dark ring with
 * a primary filled dot selected — with token colours and disabled
 * styling in both colour schemes. Interaction behaviour stays MUI
 * default.
 *
 * Place radios inside a `RadioGroup` to get single selection and
 * keyboard navigation. Pass `label` to render a clickable label
 * beside the control; without one, supply an `aria-label`.
 *
 * @example Inside a group
 * <RadioGroup value={plan} onChange={handlePlanChange}>
 *   <Radio value="starter" label="Starter" />
 *   <Radio value="pro" label="Pro" />
 * </RadioGroup>
 *
 * @example Standalone, no visible label
 * <Radio value="row-1" aria-label="Select row" checked={isSelected} onChange={handleSelect} />
 */
export const Radio = React.forwardRef<HTMLButtonElement, RadioProps>(
  ({ label, 'aria-label': ariaLabel, ...rest }, ref) => {
    const control = (
      <StyledRadio
        ref={ref}
        icon={<RadioButtonIcon size={GLYPH_SIZE_PX} />}
        checkedIcon={checkedGlyph}
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

Radio.displayName = 'Radio';
