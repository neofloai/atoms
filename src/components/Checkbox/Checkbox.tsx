'use client';

import * as React from 'react';
import { Checkbox as MuiCheckbox } from '@mui/material';
import { styled } from '@mui/material/styles';

import { paired } from '../_shared/actionStyles';
import {
  SELECTOR_BORDER_WIDTH_PX,
  SELECTOR_SIZE_PX,
  selectorInsetPx,
  selectorTokens,
} from '../_shared/selectorStyles';
import { SelectorFormControlLabel } from '../_shared/SelectorLabel';

import type { CheckboxProps, CheckboxSize } from './Checkbox.types';

/**
 * The box's corner — `Scale/50` = 2 on the sheet (node 3205:121943).
 *
 * A literal rather than a token: the `radius` ladder starts at 4 and
 * has no 2 on it, the same gap `Card`'s 16px padding falls into. See
 * DESIGNER_QUESTIONS.md #50.
 */
const BOX_RADIUS_PX = 2;

interface GlyphSpec {
  readonly width: number;
  readonly height: number;
  readonly viewBox: string;
  readonly d: string;
  readonly strokeWidth: number;
}

/*
 * The tick and the dash, verbatim from the sheet's own vectors rather
 * than approximated with a Phosphor glyph.
 *
 * The old implementation used `CheckSquare` and `MinusSquare` — one
 * glyph carrying both the box and the mark — because the previous
 * selector sheet drew the control as an icon. This one does not: the
 * box is a `div` with a fill, a 1px stroke and a 2px corner, and the
 * mark is a bare polyline laid on top. That split is the whole point of
 * the new design, since the box and the mark are different colours in
 * every state, and one glyph has only one `currentColor`.
 *
 * So the box is drawn in CSS below and these are the marks: three
 * points for the tick, two for the dash, `currentColor` so the state
 * rules can recolour them, and each size's own path because the sheet
 * scales the two by different amounts (the `sm` tick thins its stroke
 * to 1.2, the `sm` dash keeps 1.5).
 */
const CHECK_GLYPH: Record<CheckboxSize, GlyphSpec> = {
  sm: {
    width: 7.2,
    height: 5.4,
    viewBox: '0 0 7.2 5.4',
    d: 'M0.6 3L2.65717 4.6L6.6 0.6',
    strokeWidth: 1.2,
  },
  md: {
    width: 9.5,
    height: 7.8375,
    viewBox: '0 0 9.5 7.8375',
    d: 'M0.75 4.35L3.03572 6.75L8.75 0.75',
    strokeWidth: 1.5,
  },
};

const DASH_GLYPH: Record<CheckboxSize, GlyphSpec> = {
  sm: {
    width: 7.5,
    height: 1.5,
    viewBox: '0 0 7.5 1.5',
    d: 'M0.75 0.75H6.75',
    strokeWidth: 1.5,
  },
  md: {
    width: 9.5,
    height: 1.5,
    viewBox: '0 0 9.5 1.5',
    d: 'M0.75 0.75H8.75',
    strokeWidth: 1.5,
  },
};

function CheckboxGlyph({ mark }: { mark?: GlyphSpec }) {
  return (
    <span className="NeofloCheckbox-box">
      {mark && (
        <svg
          width={mark.width}
          height={mark.height}
          viewBox={mark.viewBox}
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d={mark.d}
            stroke="currentColor"
            strokeWidth={mark.strokeWidth}
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}

CheckboxGlyph.displayName = 'CheckboxGlyph';

interface StyledCheckboxProps {
  neofloSize: CheckboxSize;
}

/*
 * TODO(DESIGNER_QUESTIONS.md #50): the `checkbox` frame draws six
 * states — enabled, hover, selected, unselect, selected-disabled,
 * unselect-disabled — and every colour in it resolves to an exact
 * token. What it does not draw is focus-visible, pressed, or a hovered
 * control that is already checked, so all three stay MUI's default; and
 * it exports light values only, so each dark value is the token's own
 * dark rung rather than a designer's pairing. The four places it
 * disagrees with the radio frame beside it are settled in
 * `selectorStyles.ts`, not here.
 */
const StyledCheckbox = styled(MuiCheckbox, {
  shouldForwardProp: (prop) => prop !== 'neofloSize',
})<StyledCheckboxProps>(({ theme, neofloSize }) => ({
  padding: selectorInsetPx(neofloSize),

  '& .NeofloCheckbox-box': {
    // `border-box`, so the ring eats into the 16 rather than adding to
    // it — the sheet's symbol measures 16 with its stroke already in it.
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: SELECTOR_SIZE_PX[neofloSize],
    height: SELECTOR_SIZE_PX[neofloSize],
    borderRadius: BOX_RADIUS_PX,
    borderWidth: SELECTOR_BORDER_WIDTH_PX,
    borderStyle: 'solid',
    ...paired(theme, {
      backgroundColor: selectorTokens.restingFill,
      borderColor: selectorTokens.restingBorder,
    }),
  },

  '&:hover .NeofloCheckbox-box': paired(theme, {
    backgroundColor: selectorTokens.hoverFill,
    borderColor: selectorTokens.hoverBorder,
  }),

  // Checked and indeterminate are one cell on the sheet: the box fills
  // with the accent and the mark changes from a tick to a dash. The
  // border takes the fill's own colour rather than being dropped, so the
  // box stays 16 across all six states instead of gaining back the two
  // pixels the ring was eating.
  [`&.Mui-checked .NeofloCheckbox-box,
    &.MuiCheckbox-indeterminate .NeofloCheckbox-box`]: paired(theme, {
    backgroundColor: selectorTokens.accent,
    borderColor: selectorTokens.accent,
    color: selectorTokens.onAccent,
  }),

  // Last, so it outranks the hover and checked rules at equal
  // specificity. MUI already stops the pointer on a disabled control,
  // so the hover half is ordering rather than a live conflict.
  '&.Mui-disabled .NeofloCheckbox-box': paired(theme, {
    backgroundColor: selectorTokens.disabledFill,
    borderColor: selectorTokens.disabledBorder,
    color: selectorTokens.disabledMark,
  }),
}));

/**
 * Branded checkbox. Wraps MUI `Checkbox` with the box from the Product
 * Design System `checkbox` set (node 3205:121943): a 1px ring on a
 * `card 1` fill, tinting to `primary/subtle` under the pointer, filling
 * solid with the brand accent and a white tick when checked — a dash in
 * the same box when indeterminate — and going flat grey when disabled.
 *
 * `size` is the sheet's `Small` axis — `md` is a 16px box, `sm` is 12.
 * Both sit in the same 32px target, so a mixed column still lines up
 * and the hover halo does not shrink with the box.
 *
 * Every colour is shared with `Radio` through `selectorStyles.ts`, so
 * the two controls cannot drift apart in a form that uses both.
 *
 * Pass `label` to render a clickable label beside the control.
 *
 * @example Labelled checkbox
 * <Checkbox label="Remember me" defaultChecked />
 *
 * @example The smaller control
 * <Checkbox size="sm" label="Include archived" />
 *
 * @example Controlled, no visible label
 * <Checkbox aria-label="Select row" checked={isSelected} onChange={handleToggle} />
 */
export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ label, size = 'md', 'aria-label': ariaLabel, ...rest }, ref) => {
    const control = (
      <StyledCheckbox
        ref={ref}
        neofloSize={size}
        icon={<CheckboxGlyph />}
        checkedIcon={<CheckboxGlyph mark={CHECK_GLYPH[size]} />}
        indeterminateIcon={<CheckboxGlyph mark={DASH_GLYPH[size]} />}
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
