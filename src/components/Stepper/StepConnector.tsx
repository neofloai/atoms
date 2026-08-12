'use client';

import * as React from 'react';
import {
  StepConnector as MuiStepConnector,
  stepConnectorClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { paired } from '../_shared/actionStyles';
import {
  LINE_INSET_PX,
  LINE_WIDTH_PX,
  STEP_GAP_PX,
  line,
} from './stepperTokens';

import type { StepConnectorProps } from './Stepper.types';

/**
 * The line between two steps. Wraps MUI `StepConnector`.
 *
 * `Stepper` supplies one of these by default, so most callers never name
 * it. What it changes from MUI:
 *
 * - **2px, not 1px** (`Scale/50`), and inset 5px rather than 12px, so the
 *   rule runs down the centre of the 12px indicator column instead of
 *   under the middle of MUI's 24px numbered circle.
 * - **16px minimum, not 24px.** `Scale/300` is the bare line between one
 *   step and the next, and it is the whole height of Figma's `title`
 *   cell once the 20px header is taken off: 20 + 16 = 36.
 * - **Two colours instead of one.** MUI paints every connector from
 *   `palette.StepConnector.border`; the design splits it, colouring the
 *   line the same way it colours the dot above it.
 *
 * The `Mui-active` case is coloured with `Mui-completed` rather than
 * against it. MUI hands each connector the state of the step it sits
 * *above*, so the segment leading into the step you are on belongs to the
 * part of the run already travelled.
 */
const StyledStepConnector = styled(MuiStepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.vertical}`]: {
    marginLeft: LINE_INSET_PX,
    padding: 0,
  },

  [`& .${stepConnectorClasses.line}`]: {
    ...paired(theme, { borderColor: line.pending }),
  },

  [`&.${stepConnectorClasses.vertical} .${stepConnectorClasses.line}`]: {
    borderLeftWidth: LINE_WIDTH_PX,
    minHeight: STEP_GAP_PX,
  },

  [`&.${stepConnectorClasses.horizontal} .${stepConnectorClasses.line}`]: {
    borderTopWidth: LINE_WIDTH_PX,
  },

  [`&.${stepConnectorClasses.active} .${stepConnectorClasses.line}`]: paired(
    theme,
    { borderColor: line.done }
  ),
  [`&.${stepConnectorClasses.completed} .${stepConnectorClasses.line}`]: paired(
    theme,
    { borderColor: line.done }
  ),
}));

export const StepConnector = React.forwardRef<HTMLDivElement, StepConnectorProps>(
  (props, ref) => <StyledStepConnector ref={ref} {...props} />
);

StepConnector.displayName = 'StepConnector';
