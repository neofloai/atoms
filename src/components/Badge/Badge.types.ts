import type { BadgeProps as MuiBadgeProps } from '@mui/material';

/**
 * Colour role of the badge, mapped onto the semantic token groups the
 * rest of the library uses.
 *
 * The five action roles (`primary`, `secondary`, `success`, `error`,
 * `warning`) are the same set `Button`, `IconButton`, and the `Chip`
 * pill expose. `information` is added because MUI's `Badge` has an
 * `info` colour and the token set carries a full `information` ladder —
 * `Chip`'s 20px tag already exposes it under that name.
 *
 * MUI's `'default'` has no entry here: its neutral grey badge is what
 * this system calls `secondary`.
 */
export type BadgeColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning'
  | 'information';

/**
 * Props for the Neoflo `Badge`.
 *
 * Extends MUI's `BadgeProps` with one substitution: `color` takes the
 * Neoflo colour-role names instead of MUI's palette names.
 *
 * ## Why the colour role is `color` and not `variant`
 *
 * Most controls in this library put the colour role on `variant`
 * (`<Button variant="error">`), because the MUI prop being renamed
 * there is an emphasis axis we call `appearance`. `Badge` is different:
 * MUI's `variant` is the *shape* axis — `'standard'` draws a counter,
 * `'dot'` draws an 8px mark — and there is nothing Material-specific
 * about either word, so it is kept verbatim. That leaves the colour
 * role on `color`, which is also where `Avatar` puts it (`Avatar`
 * renamed MUI's shape axis to `shape` for the same reason).
 *
 * ## Everything else is MUI's, unchanged
 *
 * `badgeContent`, `children`, `variant`, `max` (99), `showZero`,
 * `invisible`, `overlap`, `anchorOrigin`, `component`, `slots`,
 * `slotProps`, `classes`, `sx`, and every `span` attribute pass
 * straight through. So does the behaviour they drive: the count
 * clamping to `99+`, the scale-out transition when the badge goes
 * invisible, the four anchor corners with their circular/rectangular
 * offsets, and rendering standalone when there is no child to hang off.
 */
export interface BadgeProps extends Omit<MuiBadgeProps, 'color'> {
  /**
   * Colour role.
   *
   * Defaults to `'primary'` rather than MUI's `'default'`, matching the
   * `Chip` default — a badge is nearly always drawing attention to
   * something, and the neutral treatment is available as `'secondary'`.
   *
   * @default 'primary'
   */
  color?: BadgeColor;
}
