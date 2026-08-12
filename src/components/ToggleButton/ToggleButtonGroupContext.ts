'use client';

import * as React from 'react';

import type {
  ToggleButtonAppearance,
  ToggleButtonColor,
  ToggleButtonSize,
} from './ToggleButton.types';

/**
 * Group defaults for the three renamed props, passed down to every
 * child `ToggleButton`.
 *
 * MUI already forwards `color`, `size`, `fullWidth`, and `disabled` from
 * `ToggleButtonGroup` to its children through
 * `ToggleButtonGroupContext`, resolving them as `own prop > context >
 * theme default`. This context mirrors that mechanism for the Neoflo
 * names, and it is not optional: the wrapper maps `sm`/`md` and the
 * house colour roles to MUI's words *before* handing them over, so every
 * child would otherwise pass MUI an explicit `size` and `color` of its
 * own and silently win over whatever the group put in MUI's context.
 *
 * Internal — not exported from the package. Consumers set these props on
 * `ToggleButtonGroup` and never see the context.
 */
export interface ToggleButtonGroupContextValue {
  color?: ToggleButtonColor;
  size?: ToggleButtonSize;
  appearance?: ToggleButtonAppearance;
}

export const ToggleButtonGroupContext =
  React.createContext<ToggleButtonGroupContextValue>({});
