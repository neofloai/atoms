'use client';

import * as React from 'react';
import { StepLabel as MuiStepLabel, stepLabelClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import { paired } from '../_shared/actionStyles';
import { StepIndicator } from './StepIndicator';
import {
  CONTENT_INSET_PX,
  STEP_GAP_PX,
  descriptionType,
  errorState,
  ink,
  labelType,
} from './stepperTokens';

import type { StepLabelProps } from './Stepper.types';

/**
 * A step's header row: the indicator and the label beside it. Wraps MUI
 * `StepLabel`.
 *
 * ## The row, transcribed
 *
 * A 12px indicator column, 16px of gap, then the header at 13/20 Medium
 * in `text/default/b1`. That makes the text column start 28px in, and
 * every other part of the step lines up on the same 28px — the
 * description, the buttons, the collapse row's label. The row is exactly
 * as tall as its 20px label; the rhythm between steps comes from the
 * connector, not from padding here.
 *
 * MUI's own row is built around a 24px numbered circle with 8px beside
 * it, and it adds `padding: 8px 0` in vertical orientation. Both go.
 *
 * ## The header does not move with state
 *
 * All ten Figma cells draw the header in the same ink at the same weight
 * — `done` and `not-done` alike. MUI does the opposite: `body2` by
 * default, bumped to `fontWeight: 500` and `text.primary` once a step is
 * active or complete, faded for a disabled one. That is a Material
 * convention rather than this design's, so the label is pinned and state
 * is left to the dot and the line.
 *
 * It matters more than it looks. In a linear stepper MUI marks every step
 * past `activeStep` as disabled, so keeping its fade would grey out the
 * bottom half of a timeline that Figma draws in full-strength ink.
 *
 * @example A header on its own — Figma's `title` cell
 * <Step>
 *   <StepLabel>Campaign created</StepLabel>
 * </Step>
 *
 * @example With a caption that shows whether or not the step is active
 * <Step>
 *   <StepLabel optional="Skipped">Add an ad group</StepLabel>
 * </Step>
 *
 * @see Related: Stepper, Step, StepContent, StepCollapse
 */
const StyledStepLabel = styled(MuiStepLabel)(({ theme }) => ({
  // Figma's row is the height of its label. MUI pads it 8px top and
  // bottom in vertical orientation, which would add 16px to every step.
  [`&.${stepLabelClasses.vertical}`]: {
    padding: 0,
  },

  /*
   * The indicator column plus the gap, as one box: 28px wide with 16px of
   * it padding, which leaves a 12px content area for the dot to centre
   * in. Stated as the total rather than as `width: 12` because
   * `box-sizing: border-box` would otherwise subtract the padding from
   * the 12 and squeeze the dot.
   */
  [`& .${stepLabelClasses.iconContainer}`]: {
    width: CONTENT_INSET_PX,
    paddingRight: STEP_GAP_PX,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  /*
   * Anything in the label container that is not the header — which means
   * `optional` — is a description, so it takes the description's type and
   * ink and the header overrides both. Saves the caller wrapping the
   * caption in a `Typography` to get the design's small text.
   */
  [`& .${stepLabelClasses.labelContainer}`]: {
    ...descriptionType,
    ...paired(theme, { color: ink.description }),

    [`& .${stepLabelClasses.label}`]: {
      ...labelType,
      ...paired(theme, { color: ink.label }),

      // Pinned against MUI's three state overrides, all of which move the
      // header this design keeps still.
      [`&.${stepLabelClasses.active}, &.${stepLabelClasses.completed}, &.${stepLabelClasses.disabled}`]:
        {
          ...labelType,
          ...paired(theme, { color: ink.label }),
        },

      // `error` is the one state that does move it — see `errorState`.
      [`&.${stepLabelClasses.error}`]: paired(theme, {
        color: errorState.label,
      }),
    },
  },
}));

const StepLabelBase = React.forwardRef<HTMLSpanElement, StepLabelProps>(
  ({ slots, ...rest }, ref) => (
    <StyledStepLabel
      ref={ref}
      {...rest}
      // Spread last so replacing the label slot keeps the house
      // indicator, rather than dropping it by passing `slots` at all —
      // the same merge `Tabs` does for its overflow carets.
      slots={{ stepIcon: StepIndicator, ...slots }}
    />
  )
);

StepLabelBase.displayName = 'StepLabel';

export const StepLabel = StepLabelBase;
