'use client';

import * as React from 'react';
import { Radio as MuiRadio, radioClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import { border, icon, radius, surface } from '@/src/tokens';

import { focusRing, paired } from '../_shared/actionStyles';
import { SelectorFormControlLabel } from '../_shared/SelectorLabel';
import {
  SELECTOR_BOX_CLASS,
  SELECTOR_GLYPH_CLASS,
  SelectorBox,
  SelectorDotGlyph,
  selectorBoxBase,
  selectorGlyphHidden,
  selectorGlyphShown,
} from '../_shared/selectorControl';

import type { RadioProps, RadioSize } from './Radio.types';

/** Class selector for the circle, combined with a state prefix below. */
const BOX = `.${SELECTOR_BOX_CLASS}`;

interface StyledRadioProps {
  neofloSize: RadioSize;
}

const StyledRadio = styled(MuiRadio, {
  shouldForwardProp: (prop) => prop !== 'neofloSize',
})<StyledRadioProps>(({ theme, neofloSize }) => ({
  // Everything MUI brings stays: the ripple, its circular hover tint in
  // the padding around the circle, and the 9px padding itself — which is
  // what makes the pointer target 34px (`md`) / 30px (`sm`) rather than a
  // bare 16px / 12px circle. Only colour, size and shape come from Figma.
  [`& ${BOX}`]: {
    // Figma sets `Scale/400` (24px) on a 16px box, which is simply
    // "at least half the edge". `radius.full` says that directly and
    // keeps the `sm` circle round too, where a literal 24 would also
    // work but only by accident.
    ...selectorBoxBase(neofloSize, radius.full),
    // The fill is constant across resting, hover and selected — only
    // the border moves — so it is set once here and overridden only
    // when disabled.
    ...paired(theme, {
      backgroundColor: surface.layers.card2,
      borderColor: border.primary.default,
    }),
  },

  // Order below is load-bearing: `:hover`, `.Mui-checked` and
  // `.Mui-disabled` all weigh the same against the circle, so a tie is
  // broken by source order — the technique IconButton documents for its
  // loading colour.
  [`&:hover ${BOX}`]: paired(theme, {
    borderColor: border.primary.defaultHover,
  }),

  // The set gives hover and selected the same border, so a hovered
  // unselected radio already looks like a selected one minus the dot.
  // That is as drawn; flagged in DESIGNER_QUESTIONS.md #32.
  [`&.${radioClasses.checked} ${BOX}`]: paired(theme, {
    borderColor: border.primary.defaultHover,
    color: icon.primary.accent,
  }),

  // MUI's own selection animation: the dot stays mounted and grows from
  // `scale(0)`, exactly as `RadioButtonIcon` does it.
  [`& .${SELECTOR_GLYPH_CLASS}`]: selectorGlyphHidden(theme),
  [`&.${radioClasses.checked} .${SELECTOR_GLYPH_CLASS}`]:
    selectorGlyphShown(theme),

  // Neither selector set draws a focus-visible state, and MUI leaves
  // SwitchBase without one, so this is the house ring from `Button` /
  // `IconButton`, unchanged. `Mui-focusVisible` comes from SwitchBase and
  // has no entry in `radioClasses`.
  [`&.Mui-focusVisible ${BOX}`]: focusRing(theme, border.primary.focus),

  // Unlike the checkbox, both disabled radios keep their border.
  [`&.${radioClasses.disabled} ${BOX}`]: paired(theme, {
    backgroundColor: surface.disabled.default,
    borderColor: border.disabled.default,
    color: icon.disabled.default,
  }),
}));

/**
 * Branded radio button. Wraps MUI `Radio` with the circle from the
 * Product Design System Figma component set (node 3653:28080): a
 * 1px-stroked round box at 16px or 12px on `surface/layers/card-2`,
 * holding the set's own 10px / 6px dot when selected, in both colour
 * schemes.
 *
 * The 11 August set replaced the earlier whole-glyph treatment (node
 * 2080:23677, a Phosphor `RadioButtonIcon` with a composed dot).
 * Circle and dot are now separate objects with independent fills, so no
 * single icon glyph can express it.
 *
 * Behaviour is MUI's throughout — `checked`, `value`, `onChange`, form
 * participation, ripple, and the 9px pointer padding are all untouched.
 * Only the visuals are the design system's.
 *
 * Place radios inside a `RadioGroup` to get single selection and
 * keyboard navigation. Pass `label` to render a clickable label beside
 * the control; without one, supply an `aria-label`.
 *
 * @example Inside a group
 * <RadioGroup value={plan} onChange={handlePlanChange}>
 *   <Radio value="starter" label="Starter" />
 *   <Radio value="pro" label="Pro" />
 * </RadioGroup>
 *
 * @example Small, standalone, no visible label
 * <Radio size="sm" value="row-1" aria-label="Select row" checked={isSelected} onChange={handleSelect} />
 *
 * @see Related: Checkbox
 */
export const Radio = React.forwardRef<HTMLButtonElement, RadioProps>(
  ({ label, size = 'md', 'aria-label': ariaLabel, ...rest }, ref) => {
    // One element for both slots. MUI renders `checked ? checkedIcon :
    // icon`, so handing each slot a *different* element remounts the dot
    // and its grow transition never runs; handing them the same one
    // leaves React the same DOM node to animate.
    const box = (
      <SelectorBox>
        <SelectorDotGlyph size={size} />
      </SelectorBox>
    );

    const control = (
      <StyledRadio
        ref={ref}
        neofloSize={size}
        icon={box}
        checkedIcon={box}
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
