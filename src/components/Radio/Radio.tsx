'use client';

import * as React from 'react';
import { Radio as MuiRadio } from '@mui/material';
import { styled } from '@mui/material/styles';

import { paired } from '../_shared/actionStyles';
import {
  SELECTOR_BORDER_WIDTH_PX,
  SELECTOR_SIZE_PX,
  selectorInsetPx,
  selectorTokens,
} from '../_shared/selectorStyles';
import { SelectorFormControlLabel } from '../_shared/SelectorLabel';

import type { RadioProps, RadioSize } from './Radio.types';

/**
 * Clear space between the ring and the dot — 2 at both sizes, which is
 * what makes the dot 10 inside a 16px control and 6 inside a 12px one
 * (`16 - 2 * (1 + 2)`).
 *
 * The sheet (node 3653:28080) positions the dot rather than sizing it,
 * at `left: 2, top: 2` inside the stroke; this is the same fact read
 * from the other end, and stated this way the two sizes stay consistent
 * if either diameter moves.
 */
const DOT_GAP_PX = 2;

function dotSizePx(size: RadioSize): number {
  return SELECTOR_SIZE_PX[size] - 2 * (SELECTOR_BORDER_WIDTH_PX + DOT_GAP_PX);
}

/*
 * The ring is drawn rather than glyphed, which is the change from the
 * first pass at this component.
 *
 * Until now the control was two Phosphor icons — `RadioButton` for the
 * ring, a pair of `Circle`s for the selected state — because the old
 * selector sheet (node 2080:23677) drew it as an icon. The
 * `radio-button` frame does not: it is a bordered `div` with a
 * background fill, a stroke that changes colour per state, and an
 * ellipse placed inside it. A glyph cannot do that. Its ring and its
 * fill are one colour, so there is nowhere to put the surface behind
 * it, and its stroke is a path width rather than a border, so it does
 * not stay 1px as the control shrinks from 16 to 12.
 *
 * Two spans and a border reproduce the frame exactly, and every state
 * below is a colour on one of them.
 *
 * The dot is in the *unchecked* glyph too, held at `scale(0)`, which is
 * how MUI's own `RadioButtonIcon` does it and the only way the dot can
 * grow. `SwitchBase` renders `checked ? checkedIcon : icon`, so if the
 * two differed the dot would mount already full size and there would be
 * nothing to animate from; identical elements reconcile to the same DOM
 * node, and only the root's `Mui-checked` class changes under it.
 *
 * A component rather than a bare element because MUI clones whatever it
 * is given and adds `fontSize` to it — meaningless to a span, and React
 * would put it on the DOM.
 */
function RadioGlyph() {
  return (
    <span className="NeofloRadio-ring">
      <span className="NeofloRadio-dot" />
    </span>
  );
}

RadioGlyph.displayName = 'RadioGlyph';

const ringGlyph = <RadioGlyph />;

interface StyledRadioProps {
  neofloSize: RadioSize;
}

/*
 * TODO(DESIGNER_QUESTIONS.md #50): the `radio-button` frame draws five
 * states — enabled, hover, selected, selected-disabled, disabled — and
 * every colour in it resolves to an exact token. What it does not draw
 * is focus-visible or pressed, so both stay MUI's default; and it
 * exports light values only, so each dark value is the token's own dark
 * rung rather than a designer's pairing. The four places it disagrees
 * with the checkbox frame beside it are settled in `selectorStyles.ts`,
 * not here.
 */
const StyledRadio = styled(MuiRadio, {
  shouldForwardProp: (prop) => prop !== 'neofloSize',
})<StyledRadioProps>(({ theme, neofloSize }) => ({
  padding: selectorInsetPx(neofloSize),

  '& .NeofloRadio-ring': {
    // `border-box`, so the 1px stroke eats into the 16 rather than
    // adding to it — Figma strokes inside the frame, and the sheet's
    // symbol measures 16 with the ring already in it.
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: SELECTOR_SIZE_PX[neofloSize],
    height: SELECTOR_SIZE_PX[neofloSize],
    borderRadius: '50%',
    borderWidth: SELECTOR_BORDER_WIDTH_PX,
    borderStyle: 'solid',
    ...paired(theme, {
      backgroundColor: selectorTokens.restingFill,
      borderColor: selectorTokens.restingBorder,
    }),
  },

  // The dot grows in and shrinks out, on MUI's own curve for exactly
  // this — `easeIn` on the way out, `easeOut` on the way in, both at
  // `shortest`, which is what `RadioButtonIcon` uses. The library adds
  // no motion of its own (DESIGNER_QUESTIONS.md #25), and this is not
  // an addition: it is the animation a MUI radio already had, kept
  // through the change of glyph.
  '& .NeofloRadio-dot': {
    width: dotSizePx(neofloSize),
    height: dotSizePx(neofloSize),
    borderRadius: '50%',
    transform: 'scale(0)',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.easeIn,
      duration: theme.transitions.duration.shortest,
    }),
    ...paired(theme, { backgroundColor: selectorTokens.accent }),
  },

  '&.Mui-checked .NeofloRadio-dot': {
    transform: 'scale(1)',
    transition: theme.transitions.create('transform', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.shortest,
    }),
  },

  // Hover and selected are one cell on the sheet — the ring steps up a
  // rung and the surface behind it tints — so a selected radio and a
  // hovered one are the same ring, and the dot is the only thing that
  // says which is which. Unlike the checkbox, the fill never goes solid:
  // a ring with a hole in it is what makes a radio a radio.
  '&:hover .NeofloRadio-ring, &.Mui-checked .NeofloRadio-ring': paired(theme, {
    backgroundColor: selectorTokens.hoverFill,
    borderColor: selectorTokens.hoverBorder,
  }),

  // Last, so it outranks the hover rule above at the same specificity.
  // MUI already stops the pointer on a disabled control, so this is
  // ordering rather than a live conflict.
  '&.Mui-disabled .NeofloRadio-ring': paired(theme, {
    backgroundColor: selectorTokens.disabledFill,
    borderColor: selectorTokens.disabledBorder,
  }),
  '&.Mui-disabled .NeofloRadio-dot': paired(theme, {
    backgroundColor: selectorTokens.disabledMark,
  }),
}));

/**
 * Branded radio button. Wraps MUI `Radio` with the ring from the
 * Product Design System `radio-button` set (node 3653:28080): a 1px
 * ring on a `card 1` fill, stepping a rung darker and tinting to
 * `primary/subtle` on hover and while selected, with a brand-accent dot
 * centred inside it and a flat grey fill when disabled.
 *
 * `size` is the sheet's `Small` axis — `md` is a 16px control, `sm` is
 * 12. Both sit in the same 32px round target, so a mixed column still
 * lines up and the hover halo does not shrink with the dot.
 *
 * Every colour is shared with `Checkbox` through `selectorStyles.ts`,
 * so the two controls cannot drift apart in a form that uses both.
 *
 * Place radios inside a `RadioGroup` to get single selection and
 * keyboard navigation. Pass `label` to render a clickable label beside
 * the control.
 *
 * @example Inside a group
 * <RadioGroup value={plan} onChange={handlePlanChange}>
 *   <Radio value="starter" label="Starter" />
 *   <Radio value="pro" label="Pro" />
 * </RadioGroup>
 *
 * @example The smaller control
 * <Radio size="sm" value="compact" label="Compact" />
 *
 * @example Standalone, no visible label
 * <Radio value="row-1" aria-label="Select row" checked={isSelected} onChange={handleSelect} />
 */
export const Radio = React.forwardRef<HTMLButtonElement, RadioProps>(
  ({ label, size = 'md', 'aria-label': ariaLabel, ...rest }, ref) => {
    const control = (
      <StyledRadio
        ref={ref}
        neofloSize={size}
        icon={ringGlyph}
        checkedIcon={ringGlyph}
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
