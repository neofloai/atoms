import type { SwitchProps as MuiSwitchProps } from '@mui/material';
import type * as React from 'react';

/**
 * Props for the Neoflo `Switch`.
 *
 * Extends MUI's `SwitchProps` minus `color` — the design system fixes
 * the track/thumb colours. `size` stays MUI's own (`medium` /
 * `small`); the design system only maps colour, not geometry.
 * Everything else — `checked`, `defaultChecked`, `onChange`,
 * `disabled`, `edge`, `sx` — passes through to the control.
 */
export interface SwitchProps extends Omit<MuiSwitchProps, 'color'> {
  /**
   * Visible label rendered beside the control.
   */
  label?: React.ReactNode;
}
