import type {
  CircularProgressProps as MuiCircularProgressProps,
  LinearProgressProps as MuiLinearProgressProps,
} from '@mui/material';

/**
 * Colour role shared by both progress indicators.
 *
 * MUI's own union with one rename — `information` for its `info` — plus
 * `inherit`, which is kept verbatim because it is the mechanism MUI
 * itself uses to put a spinner inside a filled control: MUI `Button`'s
 * default `loadingIndicator` is `<CircularProgress color="inherit"
 * size={16} />`, so the arc picks up the button's label colour instead
 * of the brand blue. Dropping it would break that composition.
 *
 * `inherit` is the one role with no token behind it. The six named
 * roles paint from `icon.<role>.accent`; `inherit` deliberately keeps
 * MUI's `currentColor` behaviour, including the 30%-opacity track a
 * `LinearProgress` draws for it.
 */
export type ProgressColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'information'
  | 'inherit';

/**
 * Props for `CircularProgress`.
 *
 * MUI's props with `color` re-typed to the Neoflo roles. Nothing else
 * is renamed, removed, or re-defaulted:
 *
 *   - `variant` — `'indeterminate'` (default) or `'determinate'`. This
 *     is not the emphasis axis `variant` names on `Button` / `Chip`:
 *     MUI uses the word here for *whether a value is known*, which is
 *     behaviour rather than styling, so it stays as MUI wrote it and
 *     the colour role sits on `color`.
 *   - `value`, `min`, `max` — the determinate value and its scale.
 *     `min` / `max` are MUI 9 additions and default to `0` / `100`.
 *   - `size` — a raw dimension in px (or any CSS length as a string),
 *     default `40`. Kept numeric rather than folded into the house
 *     `sm` / `md` / `lg` ladder: MUI never names sizes here, so there
 *     is no Material word to rename, and the useful values are set by
 *     whatever the spinner sits inside — 16px in a `Button`, 20px in a
 *     dense table row. See `DESIGNER_QUESTIONS.md` #36.
 *   - `thickness` — stroke width in the 44-unit viewBox, default
 *     `3.6`, so it scales with `size` rather than staying a fixed
 *     px count.
 *   - `enableTrackSlot` — mounts the unfilled ring behind the arc.
 *     MUI 9 addition, still `false` by default here; the wrapper only
 *     recolours it.
 *   - `disableShrink` — stops the indeterminate arc from breathing,
 *     leaving a constant-length arc that only rotates.
 *   - `classes`, `sx`, `className`, `style`, and every `span`
 *     attribute, including the `aria-*` a spinner needs.
 */
export interface CircularProgressProps
  extends Omit<MuiCircularProgressProps, 'color'> {
  /**
   * Colour role.
   *
   * @default 'primary'
   */
  color?: ProgressColor;
}

/**
 * Props for `LinearProgress`.
 *
 * MUI's props with `color` re-typed to the Neoflo roles. Nothing else
 * is renamed, removed, or re-defaulted:
 *
 *   - `variant` — `'indeterminate'` (default), `'determinate'`,
 *     `'buffer'`, or `'query'`. As on `CircularProgress` this names
 *     behaviour, not emphasis.
 *   - `value`, `min`, `max` — the determinate value and its scale.
 *   - `valueBuffer` — the second, further-ahead value the `buffer`
 *     variant draws behind the main bar.
 *   - `classes`, `sx`, `className`, `style`, and every `span`
 *     attribute.
 *
 * There is no `size` prop, by MUI's design and left that way: the bar
 * is 4px tall and as wide as its container, so height comes from `sx`
 * and width from the layout around it.
 */
export interface LinearProgressProps
  extends Omit<MuiLinearProgressProps, 'color'> {
  /**
   * Colour role.
   *
   * @default 'primary'
   */
  color?: ProgressColor;
}
