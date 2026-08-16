import type * as React from 'react';
import type {
  RadioGroupProps as MuiRadioGroupProps,
  RadioProps as MuiRadioProps,
} from '@mui/material';
import type { SelectorSize } from '../_shared/selectorStyles';

/**
 * Control diameter, from the `Small` boolean on the Figma radio set:
 * `md` is 16 (`Small=False`), `sm` is 12 (`Small=True`). The same ramp
 * `Checkbox` takes — they are one sheet.
 */
export type RadioSize = SelectorSize;

/**
 * Props for the Neoflo `Radio`.
 *
 * Extends MUI's `RadioProps` minus the props we manage internally
 * (`color`, and the icon slots — the design system fixes the glyphs)
 * and with `size` remapped from MUI's `small`/`medium` to the house
 * `sm`/`md` ramp. Everything else — `checked`, `value`, `onChange`,
 * `disabled`, `sx` — passes through to the control.
 */
export interface RadioProps
  extends Omit<MuiRadioProps, 'color' | 'size' | 'icon' | 'checkedIcon'> {
  /**
   * Visible label rendered beside the control.
   */
  label?: React.ReactNode;
  /** Control diameter. @default 'md' */
  size?: RadioSize;
}

/**
 * Props for the Neoflo `RadioGroup`. Direct passthrough of MUI's
 * `RadioGroupProps` — the group is pure behaviour (shared `name`,
 * single selection, keyboard navigation) with no visual styling.
 */
export type RadioGroupProps = MuiRadioGroupProps;
