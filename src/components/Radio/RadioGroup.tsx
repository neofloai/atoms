'use client';

import * as React from 'react';
import { RadioGroup as MuiRadioGroup } from '@mui/material';

import type { RadioGroupProps } from './Radio.types';

/**
 * Groups `Radio` controls into a single-selection set. Wraps MUI
 * `RadioGroup` unchanged — it is pure behaviour (shared `name`, one
 * selected value, arrow-key navigation) with no visual styling, so
 * there is nothing to rebrand.
 *
 * @example
 * <RadioGroup value={plan} onChange={handlePlanChange}>
 *   <Radio value="starter" label="Starter" />
 *   <Radio value="pro" label="Pro" />
 * </RadioGroup>
 */
export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  (props, ref) => <MuiRadioGroup ref={ref} {...props} />
);

RadioGroup.displayName = 'RadioGroup';
