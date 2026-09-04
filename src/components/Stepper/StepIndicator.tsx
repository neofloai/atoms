'use client';

import * as React from 'react';
import { useStepContext } from '@mui/material';
import { styled } from '@mui/material/styles';

import { paired } from '../_shared/actionStyles';
import {
  DOT_RADIUS,
  DOT_SIZE_PX,
  PIN_SIZE_PX,
  dot,
  errorState,
  pin,
} from './stepperTokens';

import type { StepIconProps } from '@mui/material';
import type { ModeToken } from '@/src/tokens';

/**
 * The last step's marker, traced from the Figma set's `last` cells (nodes
 * 3663:40571 and 3663:40569, which export the same path in two fills).
 *
 * A circle of radius 4 centred on (6,4) that tapers to a point at (6,12):
 * the dot and the end of the line drawn as one shape, which is why the
 * last step needs no connector under it.
 */
const PIN_PATH =
  'M10 4C10 8.20914 6.20914 12 6 12C5.79086 12 2 8.20914 2 4C2 1.79086 3.79086 0 6 0C8.20914 0 10 1.79086 10 4Z';

interface IndicatorState {
  /** `active` or `completed` — Figma's `done`. */
  neofloDone: boolean;
  neofloError: boolean;
}

function markerColor(
  { neofloDone, neofloError }: IndicatorState,
  tokens: { done: ModeToken; pending: ModeToken }
): ModeToken {
  if (neofloError) return errorState.dot;
  return neofloDone ? tokens.done : tokens.pending;
}

const forwardState = (prop: string) =>
  prop !== 'neofloDone' && prop !== 'neofloError';

const Dot = styled('span', { shouldForwardProp: forwardState })<IndicatorState>(
  ({ theme, ...state }) => ({
    display: 'block',
    flexShrink: 0,
    width: DOT_SIZE_PX,
    height: DOT_SIZE_PX,
    borderRadius: DOT_RADIUS,
    ...paired(theme, { backgroundColor: markerColor(state, dot) }),
  })
);

const Pin = styled('svg', { shouldForwardProp: forwardState })<IndicatorState>(
  ({ theme, ...state }) => ({
    display: 'block',
    flexShrink: 0,
    width: PIN_SIZE_PX,
    height: PIN_SIZE_PX,
    ...paired(theme, { color: markerColor(state, pin) }),
  })
);

/**
 * What sits in the indicator column beside a step's header: an 8px dot,
 * or the tapered pin on the last step.
 *
 * Fills `StepLabel`'s `stepIcon` slot, so it takes MUI's `StepIconProps`
 * and nothing else, and it reads `last` from MUI's own `StepContext` —
 * the same context `StepLabel` and `StepContent` use — rather than a
 * context of its own.
 *
 * ## No numbers
 *
 * MUI's `StepIcon` draws a 24px circle with the step's index in it, or a
 * check once the step is complete. This design draws neither: an 8px dot
 * in `surface.primary.default` when the step is done and
 * `surface/default/2` when it is not, with the line carrying the rest of
 * the story. `icon` still arrives as `index + 1` — MUI always supplies
 * it — and is deliberately ignored when it is a number.
 *
 * A node is not ignored. `StepLabel icon={<YourGlyph />}` renders inside
 * this column, which is how the collapse row gets its vertical ellipsis
 * without a second slot.
 *
 * Extra props are not spread onto the element. MUI hands a slot component
 * its `ownerState`, and forwarding that to an `svg` or a `span` would put
 * an `ownerState` attribute in the DOM.
 */
export function StepIndicator({
  active = false,
  completed = false,
  error = false,
  icon,
  className,
}: StepIconProps) {
  const stepContext = useStepContext();
  const isLast = 'last' in stepContext ? stepContext.last : false;

  // A caller-supplied node wins over the house marker, at the column's
  // own size. Numbers do not: `icon` is `index + 1` unless overridden,
  // and this design has no numbered steps.
  if (React.isValidElement(icon)) {
    return <>{icon}</>;
  }

  const state: IndicatorState = { neofloDone: active || completed, neofloError: error };

  return isLast ? (
    <Pin className={className} viewBox={`0 0 ${PIN_SIZE_PX} ${PIN_SIZE_PX}`} {...state}>
      <path d={PIN_PATH} fill="currentColor" />
    </Pin>
  ) : (
    <Dot className={className} {...state} />
  );
}

StepIndicator.displayName = 'StepIndicator';
