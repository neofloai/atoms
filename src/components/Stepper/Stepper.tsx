'use client';

import * as React from 'react';
import { Stepper as MuiStepper } from '@mui/material';

import { StepConnector } from './StepConnector';

import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { StepperProps, StepperTypeMap } from './Stepper.types';

/*
 * `connector` is a default rather than a value passed after the spread, so
 * `connector={null}` still removes the line: a JS default only fills in for
 * `undefined`, and MUI drops the connector on falsiness. Same reason
 * `AccordionSummary`'s caret is a default.
 */
const StepperBase = React.forwardRef(function Stepper(
  {
    orientation = 'vertical',
    connector = <StepConnector />,
    ...rest
  }: StepperProps,
  ref: React.Ref<HTMLDivElement>
) {
  return (
    <MuiStepper
      ref={ref}
      orientation={orientation}
      connector={connector}
      {...rest}
    />
  );
});

StepperBase.displayName = 'Stepper';

/**
 * A run of steps down the page, with a line threading them together.
 * Wraps MUI `Stepper` with the Neoflo API from the Product Design System
 * Figma (node 3663:40573).
 *
 * A step is a 12px indicator column — an 8px dot, or a tapered pin on the
 * last one — with a 2px rule running down it, and everything else 16px to
 * its right on a single 28px margin. Colour is the only thing that moves:
 * the dot and the line go from `surface/primary/default` to
 * `surface/default/2` at the point the run stops being done. The header
 * stays the same ink and weight the whole way down.
 *
 * MUI's model is untouched and is the point of the component. `activeStep`
 * drives the states in a linear flow — the steps before it complete, the
 * one at it active, the rest not yet reached — and `completed` on a step
 * takes over when the order is not an index.
 *
 * Two things worth knowing:
 *
 * - **`orientation` defaults to `'vertical'` here**, where MUI defaults to
 *   `'horizontal'`. Every cell in the design is vertical; horizontal is
 *   not drawn anywhere, so it still works and still reads from the same
 *   tokens, but it is the vertical set turned on its side rather than a
 *   specified treatment. This is the only MUI default the family moves.
 * - **`StepContent` is hidden until its step is active.** That is MUI's
 *   wizard behaviour. For the timeline the design draws — every
 *   description visible at once — put `expanded` on each `Step`.
 *
 * @example A wizard: one description at a time, driven by activeStep
 * <Stepper activeStep={step}>
 *   <Step>
 *     <StepLabel>Campaign settings</StepLabel>
 *     <StepContent>Name it and pick a budget.</StepContent>
 *   </Step>
 *   <Step>
 *     <StepLabel>Ad group</StepLabel>
 *     <StepContent>Choose who sees it.</StepContent>
 *   </Step>
 *   <Step>
 *     <StepLabel>Review</StepLabel>
 *   </Step>
 * </Stepper>
 *
 * @example A timeline: everything visible, states set per step
 * <Stepper activeStep={-1}>
 *   {events.map((event) => (
 *     <Step key={event.id} expanded completed={event.done}>
 *       <StepLabel>{event.title}</StepLabel>
 *       <StepContent>{event.detail}</StepContent>
 *     </Step>
 *   ))}
 * </Stepper>
 *
 * Cast to an `OverridableComponent` so the root stays swappable, the call
 * `Card` and `Accordion` both document.
 *
 * @see Related: Step, StepLabel, StepContent, StepCollapse, Divider
 */
export const Stepper = StepperBase as OverridableComponent<StepperTypeMap>;
