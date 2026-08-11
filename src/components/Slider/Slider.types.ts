import type { SliderProps as MuiSliderProps } from '@mui/material';

/**
 * Slider size, mapped onto MUI's own ramp: `md` = a 4px bar with a 20px
 * thumb, `sm` = 2px with a 12px thumb (and no drop shadow under it).
 */
export type SliderSize = 'sm' | 'md';

/**
 * Props for the Neoflo `Slider`.
 *
 * Extends MUI's `SliderProps` minus three props:
 *
 * - `orientation` — Atoms ships the horizontal slider only, so the
 *   vertical variant MUI also supports is not exposed. A vertical
 *   slider needs a height on every call site and reads its value
 *   bottom-to-top, and no Neoflo surface asks for one; leaving the prop
 *   out keeps that decision in one place instead of in each consumer.
 * - `color` — the design system fixes the rail/track/thumb colours.
 * - `size` — remapped from MUI's `small`/`medium` to the house
 *   `sm`/`md` ramp.
 *
 * Everything else passes through untouched: `value`, `defaultValue`,
 * `onChange`, `onChangeCommitted`, `min`, `max`, `step`, `shiftStep`,
 * `marks`, `scale`, `track`, `disabled`, `disableSwap`,
 * `valueLabelDisplay`, `valueLabelFormat`, `getAriaLabel`,
 * `getAriaValueText`, `name`, `slots`, `slotProps`, and `sx`.
 *
 * Pass an array to `value` / `defaultValue` for a range slider — that is
 * MUI's own two-thumb mode, not a separate component.
 */
export interface SliderProps
  extends Omit<MuiSliderProps, 'orientation' | 'color' | 'size'> {
  /** Bar thickness and thumb size. @default 'md' */
  size?: SliderSize;
}
