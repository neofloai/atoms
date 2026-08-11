'use client';

import * as React from 'react';
import { Checkbox as MuiCheckbox, checkboxClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import { border, icon, surface } from '@/src/tokens';

import { focusRing, paired } from '../_shared/actionStyles';
import { SelectorFormControlLabel } from '../_shared/SelectorLabel';
import {
  SELECTOR_BOX_CLASS,
  SELECTOR_CHECK_CLASS,
  SELECTOR_DASH_CLASS,
  SELECTOR_GLYPH_CLASS,
  SELECTOR_GLYPH_ON_FILL,
  SelectorBox,
  SelectorCheckGlyph,
  SelectorDashGlyph,
  selectorBoxBase,
  selectorGlyphHidden,
  selectorGlyphShown,
} from '../_shared/selectorControl';

import type { CheckboxProps, CheckboxSize } from './Checkbox.types';

/**
 * `Scale/50`. The radius ladder runs 0 / 4 / 8 / 12 / 16 / 24 with no
 * 2px rung, so this stays a literal — the same ladder gap that made
 * `Card` carry its 16px padding raw. See DESIGNER_QUESTIONS.md #32.
 */
const BOX_RADIUS_PX = 2;

/** Class selector for the box, combined with a state prefix below. */
const BOX = `.${SELECTOR_BOX_CLASS}`;

interface StyledCheckboxProps {
  neofloSize: CheckboxSize;
}

const StyledCheckbox = styled(MuiCheckbox, {
  shouldForwardProp: (prop) => prop !== 'neofloSize',
})<StyledCheckboxProps>(({ theme, neofloSize }) => ({
  // Everything MUI brings stays: the ripple, its circular hover tint in
  // the padding around the box, and the 9px padding itself — which is
  // what makes the pointer target 34px (`md`) / 30px (`sm`) rather than
  // a bare 16px / 12px box. Only colour, size and shape come from Figma.
  [`& ${BOX}`]: {
    ...selectorBoxBase(neofloSize, BOX_RADIUS_PX),
    ...paired(theme, {
      backgroundColor: surface.layers.card1,
      borderColor: border.primary.default,
    }),
  },

  // Order below is load-bearing. `:hover`, `.Mui-checked` and
  // `.Mui-disabled` all weigh the same against the box, so a tie is
  // broken by source order — the technique IconButton documents for
  // its loading colour. Read downwards as rising precedence: hover,
  // then checked, then checked-hover, then disabled.
  [`&:hover ${BOX}`]: paired(theme, {
    backgroundColor: surface.primary.subtle,
    borderColor: border.primary.defaultHover,
  }),

  // `unselect` on the Figma axis is the indeterminate dash, and it
  // takes the same fill as `selected` — the two states differ only by
  // which glyph sits inside.
  [`&.${checkboxClasses.checked} ${BOX},
    &.${checkboxClasses.indeterminate} ${BOX}`]: {
    borderColor: 'transparent',
    ...paired(theme, {
      backgroundColor: surface.primary.default,
      color: SELECTOR_GLYPH_ON_FILL,
    }),
  },

  // The set draws no hover for a filled box, which would leave half the
  // states with no pointer feedback once MUI's tint is gone. This is
  // the system's own hover partner for `surface.primary.default` — the
  // pairing `Button` already uses for a contained fill — rather than a
  // new value. Confirm in DESIGNER_QUESTIONS.md #32.
  [`&.${checkboxClasses.checked}:hover ${BOX},
    &.${checkboxClasses.indeterminate}:hover ${BOX}`]: paired(theme, {
    backgroundColor: surface.primary.defaultHover,
  }),

  // Both marks stay mounted in every state so MUI's grow animation can
  // run; CSS decides which one is at full size. When `indeterminate` and
  // `checked` are both set MUI draws the dash, so the check is gated on
  // the dash being absent.
  [`& .${SELECTOR_GLYPH_CLASS}`]: selectorGlyphHidden(theme),
  [`&.${checkboxClasses.checked}:not(.${checkboxClasses.indeterminate})
    .${SELECTOR_CHECK_CLASS}`]: selectorGlyphShown(theme),
  [`&.${checkboxClasses.indeterminate} .${SELECTOR_DASH_CLASS}`]:
    selectorGlyphShown(theme),

  // Neither selector set draws a focus-visible state, and MUI leaves
  // SwitchBase without one, so this is the house ring from `Button` /
  // `IconButton`, unchanged. `Mui-focusVisible` comes from SwitchBase and
  // has no entry in `checkboxClasses`.
  [`&.Mui-focusVisible ${BOX}`]: focusRing(theme, border.primary.focus),

  // Both drawn disabled states are borderless, so the border goes
  // transparent for all three — including disabled-unchecked, which the
  // set never draws. That one renders as a bare grey box; see #32.
  [`&.${checkboxClasses.disabled} ${BOX},
    &.${checkboxClasses.disabled}:hover ${BOX}`]: {
    borderColor: 'transparent',
    ...paired(theme, {
      backgroundColor: surface.disabled.default,
      color: icon.disabled.default,
    }),
  },
}));

/**
 * Branded checkbox. Wraps MUI `Checkbox` with the box from the Product
 * Design System Figma component set (node 3205:121943): a 1px-stroked
 * 2px-radius box at 16px or 12px, filled with `surface/primary/default`
 * when checked or indeterminate, carrying the set's own check mark and
 * dash vectors, in both colour schemes.
 *
 * The 11 August set replaced the earlier whole-glyph treatment (node
 * 2080:23677, a Phosphor `CheckSquareIcon`). Box and mark are now
 * separate objects with independent fills, so no single icon glyph can
 * express it.
 *
 * Behaviour is MUI's throughout — `checked`, `indeterminate`,
 * `onChange`, form participation, ripple, and the 9px pointer padding
 * are all untouched. Only the visuals are the design system's.
 *
 * Pass `label` to render a clickable label beside the control; without
 * one, supply an `aria-label`.
 *
 * @example Labelled checkbox
 * <Checkbox label="Remember me" defaultChecked />
 *
 * @example Small, controlled, no visible label
 * <Checkbox size="sm" aria-label="Select row" checked={isSelected} onChange={handleToggle} />
 *
 * @see Related: Radio
 */
export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ label, size = 'md', 'aria-label': ariaLabel, ...rest }, ref) => {
    // One element for all three slots. MUI renders `checked ? checkedIcon
    // : icon`, so handing each slot a *different* element remounts the
    // mark and its grow transition never runs; handing them the same one
    // leaves React the same DOM node to animate.
    const box = (
      <SelectorBox>
        <SelectorCheckGlyph size={size} />
        <SelectorDashGlyph size={size} />
      </SelectorBox>
    );

    const control = (
      <StyledCheckbox
        ref={ref}
        neofloSize={size}
        icon={box}
        checkedIcon={box}
        indeterminateIcon={box}
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
