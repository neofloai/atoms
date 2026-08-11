import type * as React from 'react';
import type {
  RadioGroupProps as MuiRadioGroupProps,
  RadioProps as MuiRadioProps,
} from '@mui/material';

/**
 * Radio size, from the `small` boolean on the Figma component set
 * (node 3653:28080): `md` is the 16px circle (`Scale/300`), `sm` the
 * 12px one (`Scale/250`).
 *
 * Declared as a ramp rather than a `small` flag to match `ButtonSize`,
 * `IconButtonSize` and `ChipSize`. Nothing is being redefined by doing
 * so — the control had no size prop before this.
 */
export type RadioSize = 'sm' | 'md';

/**
 * Props for the Neoflo `Radio`.
 *
 * Extends MUI's `RadioProps` minus the props the design system fixes:
 * `color` and the icon slots (the circle and its dot are drawn from the
 * Figma set), plus MUI's own `size` — replaced by the two-rung `size`
 * below, since MUI's `'small' | 'medium'` scales the glyph's font size
 * and the circle is no longer a font glyph.
 *
 * Everything else — `checked`, `value`, `onChange`, `disabled`,
 * `required`, `name`, `inputRef`, `sx` — passes straight through to MUI.
 */
export interface RadioProps
  extends Omit<MuiRadioProps, 'color' | 'size' | 'icon' | 'checkedIcon'> {
  /**
   * Visible label rendered beside the control. When omitted, provide
   * an `aria-label` instead.
   */
  label?: React.ReactNode;
  /** Circle size. @default 'md' */
  size?: RadioSize;
}

/**
 * Props for the Neoflo `RadioGroup`. Direct passthrough of MUI's
 * `RadioGroupProps` — the group is pure behaviour (shared `name`,
 * single selection, keyboard navigation) with no visual styling.
 *
 * `size` is not among them: the Figma set carries no group-level axis,
 * so each `Radio` takes its own. Set it on every radio in a group.
 */
export type RadioGroupProps = MuiRadioGroupProps;
