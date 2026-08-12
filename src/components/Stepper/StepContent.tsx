'use client';

import * as React from 'react';
import {
  StepContent as MuiStepContent,
  stepContentClasses,
  useStepContext,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { paired } from '../_shared/actionStyles';
import {
  CONTENT_PADDING_LEFT_PX,
  LINE_INSET_PX,
  LINE_WIDTH_PX,
  descriptionType,
  ink,
  line,
} from './stepperTokens';

import type { StepContentProps } from './Stepper.types';

interface ContentState {
  neofloDone: boolean;
}

const StyledStepContent = styled(MuiStepContent, {
  shouldForwardProp: (prop) => prop !== 'neofloDone',
})<ContentState>(({ theme, neofloDone }) => ({
  /*
   * The line beside the content, and the content's own inset. The border
   * starts at 5px so it continues the connector's rule exactly, spends
   * 2px on itself, and the 21px of padding lands the text on the same
   * 28px as the header above it.
   */
  marginLeft: LINE_INSET_PX,
  paddingLeft: CONTENT_PADDING_LEFT_PX,
  paddingRight: 0,
  borderLeftStyle: 'solid',
  borderLeftWidth: LINE_WIDTH_PX,

  ...descriptionType,
  ...paired(theme, {
    borderLeftColor: neofloDone ? line.done : line.pending,
    color: ink.description,
  }),

  /*
   * No line under the last step — the pin's taper is the end of it.
   *
   * MUI already does this, via a `last` variant that sets
   * `borderLeft: none`. Restated because that variant lives inside MUI's
   * own class while the 2px longhand above lives in this wrapper's, which
   * is injected afterwards and would otherwise put the border back.
   */
  [`&.${stepContentClasses.last}`]: {
    borderLeftWidth: 0,
  },
}));

/**
 * The region beside the line: a step's description, and any buttons under
 * it. Wraps MUI `StepContent`.
 *
 * This is what separates Figma's three content cells from each other —
 * `title` has no `StepContent`, `text` has a description in one, `action`
 * has a description and buttons. There is no prop for which of the three
 * you get; it is what you put in here.
 *
 * ## It is hidden until the step is active
 *
 * That is MUI's behaviour and it is kept: `StepContent` mounts inside a
 * `Collapse` that opens when its step becomes active, which is what a
 * wizard wants. Figma draws a timeline instead, every description visible
 * at once — for that, put `expanded` on each `Step`. The switch is MUI's
 * own, so nothing here needed inventing.
 *
 * ## Spacing inside it
 *
 * Figma stacks the description and the button row 16px apart. That is
 * `Stack spacing={2}`, and it is left to the caller rather than imposed
 * here: MUI wraps these children in a `Collapse`, so a gap set on this
 * element would not reach them.
 *
 * @example Figma's `text` cell
 * <Step expanded>
 *   <StepLabel>Set a budget</StepLabel>
 *   <StepContent>
 *     For each ad campaign that you create, control how much you are
 *     willing to spend.
 *   </StepContent>
 * </Step>
 *
 * @example Figma's `action` cell
 * <Step expanded>
 *   <StepLabel>Set a budget</StepLabel>
 *   <StepContent>
 *     <Stack spacing={2}>
 *       <span>Control how much you are willing to spend.</span>
 *       <Stack direction="row" spacing={1}>
 *         <Button size="sm">Continue</Button>
 *         <Button size="sm" variant="secondary">Back</Button>
 *       </Stack>
 *     </Stack>
 *   </StepContent>
 * </Step>
 *
 * @see Related: Stepper, Step, StepLabel, StepCollapse
 */
export const StepContent = React.forwardRef<HTMLDivElement, StepContentProps>(
  (props, ref) => {
    const stepContext = useStepContext();
    // The line beside the content is coloured the same way the dot above
    // it is, so it reads the step's state from the context MUI already
    // provides rather than from a prop of its own.
    const neofloDone =
      'active' in stepContext
        ? stepContext.active || stepContext.completed
        : false;

    return (
      <StyledStepContent ref={ref} neofloDone={neofloDone} {...props} />
    );
  }
);

StepContent.displayName = 'StepContent';
