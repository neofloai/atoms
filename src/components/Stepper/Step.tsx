'use client';

import * as React from 'react';
import { Step as MuiStep } from '@mui/material';

import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { StepProps, StepTypeMap } from './Stepper.types';

/*
 * The ref is typed `HTMLDivElement` because that is MUI's declared default
 * component for a step, even though `Step` renders an `li` at runtime.
 * The mismatch is MUI's own and is carried through rather than corrected —
 * narrowing it would make this wrapper's types disagree with the component
 * it wraps.
 */
const StepBase = React.forwardRef(function Step(
  props: StepProps,
  ref: React.Ref<HTMLDivElement>
) {
  return <MuiStep ref={ref} {...props} />;
});

StepBase.displayName = 'Step';

/**
 * One step in a `Stepper`: a `StepLabel`, and optionally a `StepContent`
 * beside the line. Wraps MUI `Step`.
 *
 * A passthrough by design — the whole step is drawn by its children, and
 * MUI's vertical `Step` adds no geometry of its own for the design to
 * disagree with. It is wrapped anyway so the family imports from one place
 * and `index`, `last`, `active`, `completed` and `disabled` keep MUI's
 * exact meanings.
 *
 * Two of those are injected rather than passed. `Stepper` clones its
 * children to hand each one its `index` and whether it is `last`, and
 * publishes them on MUI's `StepContext` — which is where the last step's
 * pin comes from, and why the last step draws no line under it. Passing
 * either explicitly overrides the injected value, as it does in MUI.
 *
 * Cast to an `OverridableComponent` so the root stays swappable, the call
 * `Card` and `Accordion` both document.
 *
 * @example
 * <Step>
 *   <StepLabel>Review and publish</StepLabel>
 * </Step>
 *
 * @example Keep the content open whether or not the step is active
 * <Step expanded completed>
 *   <StepLabel>Budget set</StepLabel>
 *   <StepContent>Capped at 200 a day.</StepContent>
 * </Step>
 *
 * @see Related: Stepper, StepLabel, StepContent, StepCollapse
 */
export const Step = StepBase as OverridableComponent<StepTypeMap>;
