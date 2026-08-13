import {
  border,
  elevation,
  fontFamilies,
  fontWeights,
  radius,
  spacing,
  surface,
  text,
  typography,
} from '@/src/tokens';

import type { CSSObject } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';
import type { DatePickerStatus } from './DatePicker.types';

/**
 * Colour and type for the date picker.
 *
 * **The Product Design System draws no date picker.** Searching the Figma
 * library for "date picker" and "calendar" returns the `CalendarBlank`
 * glyph and its siblings from the icon set, and nothing else — there is no
 * component set, no calendar grid, no popover. So unlike every other
 * component in this repo, this file is not a transcription of a node.
 *
 * That does not make it invented, because a date picker is three surfaces
 * and two of them are components the design system already specifies:
 *
 *   - **The field** is a text field. Every value below is read off
 *     `src/components/TextField/TextField.tsx`, which transcribes Figma
 *     node 3179:106156 — the same 8px inset, 8px corners, `layers/page`
 *     fill, 1px `card 1` border, bottom-edge-only focus accent, and the
 *     same three validation statuses. MUI X does not reuse MUI's
 *     `OutlinedInput` here, so the declarations are restated against
 *     `MuiPickersOutlinedInput-*` rather than shared. See
 *     `FIELD_CLASS_NOTE` below.
 *   - **The popover** is a floating panel. Every value is read off
 *     `src/components/Menu/Menu.tsx`, which transcribes node 3228:62331:
 *     `card 2` fill and border, 16px corners, a 4px inset, and
 *     `Shadow/medium`.
 *   - **The calendar grid** — the month header, the weekday row, and the
 *     day / month / year cells — has no precedent in either place. Its
 *     *geometry* is left exactly as MUI X ships it: 36px cells, a 7-column
 *     grid, circular days, 3-or-4-up year buttons. Only its *colour and
 *     type* are moved onto house tokens. Nothing here invents a measurement
 *     the design system has not already made somewhere.
 *
 * The consequence worth stating plainly: the grid is the one part of this
 * component a designer has not signed off, and if a date picker is ever
 * drawn, the grid is what will move. Logged in DESIGNER_QUESTIONS.md #42.
 *
 * ## Why the field styling is restated rather than shared with `TextField`
 *
 * MUI X v9 renders its field through `PickersTextField`, not MUI's
 * `TextField`. It is a parallel implementation with a parallel class tree —
 * `MuiPickersOutlinedInput-root` where MUI has `MuiOutlinedInput-root`,
 * `MuiPickersInputBase-sectionsContainer` where MUI has an `<input>` — so
 * nothing that targets `.MuiOutlinedInput-*` reaches it, and neither does
 * the theme's `MuiTextField` override.
 *
 * The structure differs for a reason: the value is not one input but a span
 * per date section, which is what lets the arrow keys step the month
 * independently of the year. v9 removed the escape hatch that used to render
 * a plain input (`enableAccessibleFieldDOMStructure={false}`), so this is
 * the only field MUI X has.
 *
 * Both copies therefore read from the same tokens. If the Figma field
 * changes, both have to move — that is the cost, and it is recorded here
 * rather than left to be discovered.
 */

/**
 * Inset from the field's border on every edge, and the gap between the
 * value and the calendar button (`Scale/200`). Re-exported from the shared
 * field geometry so this field and `TextField` cannot drift apart.
 */
export { FIELD_PADDING_PX } from '../_shared/fieldStyles';

/** Field corners — 8px, matching `TextField`. */
export const FIELD_RADIUS = radius.sm;

/**
 * The field's content-row height, and the geometry of the calendar and
 * clear buttons inside it, both come from `_shared/fieldStyles.ts` —
 * `TextField` reads the same module, because the two fields sit next to
 * each other in a form and have to measure the same.
 *
 * `FIELD_CONTENT_HEIGHT_PX` is the one value this field has to *restate*
 * rather than inherit: MUI X gives its sections container a `1.4375em`
 * line height, which on the 13px `B1` ramp resolves to 18.69px and lands
 * the field on 34.7px — close enough to look right on its own and clearly
 * wrong beside a text field.
 */
export {
  ADORNMENT_GLYPH_PX as GLYPH_SIZE_PX,
  FIELD_CONTENT_HEIGHT_PX,
} from '../_shared/fieldStyles';

/** The popover's corners and inset, matching `Menu`. */
export const PANEL_RADIUS = radius.lg;
export const PANEL_PADDING_PX = spacing.component.xxs;

/** The popover's drop shadow — Figma `Shadow/medium`, matching `Menu`. */
export const PANEL_ELEVATION = elevation.medium;

/** Border width shared by the field and the popover. */
export const HAIRLINE_WIDTH_PX = 1;

/**
 * A focused day, month or year cell takes the house focus ring at its full
 * `FOCUS_RING_WIDTH_PX`, drawn *inside* the cell rather than around it —
 * the placement `Accordion` introduced. Inset is what makes the full width
 * safe here: the calendar grid has no gutters, so an outer ring would paint
 * over the cell either side of it.
 */

/**
 * The value in the field, and the number in a day cell — `Sans/B1/Regular`,
 * 13/20. `TextField` sets the same on its input.
 */
export const fieldType: CSSObject = {
  fontFamily: fontFamilies.product.sans,
  fontWeight: fontWeights.regular,
  fontSize: typography.body.b1.size,
  lineHeight: `${typography.body.b1.leading}px`,
  letterSpacing: `${typography.body.b1.letterSpacing}em`,
};

/**
 * The label above the field, and the weekday initials across the top of
 * the grid — `Sans/B2/Regular`, 12/16. `TextField`'s label type.
 */
export const labelType: CSSObject = {
  fontFamily: fontFamilies.product.sans,
  fontWeight: fontWeights.regular,
  fontSize: typography.body.b2.size,
  lineHeight: `${typography.body.b2.leading}px`,
};

/** Helper text under the field — `Sans/Caption/Regular`, matching `TextField`. */
export const helperType: CSSObject = {
  fontFamily: fontFamilies.product.sans,
  fontWeight: fontWeights.regular,
  fontSize: typography.body.caption.size,
  lineHeight: `${typography.body.caption.leading}px`,
  letterSpacing: `${typography.body.caption.letterSpacing}em`,
};

/**
 * The month-and-year label in the popover header — `Sans/B1/Medium`. The
 * one rung of emphasis in the panel, on the same reasoning `StepLabel`
 * uses: Medium is what separates a heading from the body beside it when
 * nothing else changes.
 */
export const headerType: CSSObject = {
  ...fieldType,
  fontWeight: fontWeights.medium,
};

/** The field, at rest and in each state. Mirrors `TextField` token for token. */
export const field = {
  ink: text.default.body,
  background: surface.layers.page,
  border: border.layers.card1,
  /** Focus recolours the bottom edge only — Figma 3179:106156's focused cell. */
  borderFocus: border.primary.focus,
  /** Hover, and "has a value", both take the same subtle tint. */
  backgroundHover: surface.layers.card1,
  disabledInk: text.disabled.default,
  disabledBackground: surface.disabled.default,
  disabledBorder: border.layers.card2,
  /** The label above the field and the helper text under it. */
  label: text.default.placeholder,
  /** The date-format placeholder shown in an empty section (`MM/DD/YYYY`). */
  placeholder: text.default.placeholder,
} as const satisfies Record<string, ModeToken>;

/**
 * Border colour per validation status, and the ink its label and helper
 * text take. Both tables are `TextField`'s, unchanged — a status has to
 * read identically whichever field it is on.
 */
export const statusBorder = {
  error: border.error.focus,
  success: border.success.focus,
  warning: border.warning.focus,
} as const satisfies Record<DatePickerStatus, ModeToken>;

export const statusInk = {
  error: text.error.onColorHover,
  success: text.success.onColorHover,
  warning: text.warning.caption,
} as const satisfies Record<DatePickerStatus, ModeToken>;

/** The popover. `Menu`'s panel, token for token. */
export const panel = {
  background: surface.layers.card2,
  border: border.layers.card2,
} as const satisfies Record<string, ModeToken>;

/**
 * The calendar grid — the part with no Figma source.
 *
 * Every role below is filled from the ladder the house already uses for
 * that job rather than from a colour picked to look right: a selected day
 * is the primary fill and on-colour ink `Button`'s `primary` `contained`
 * uses, hover is the neutral hover rung, today is the primary border, and
 * a disabled or out-of-month day is the disabled / placeholder ink. That
 * makes each one defensible on its own even though the composition is not
 * drawn anywhere.
 */
export const calendar = {
  /** The month-and-year label, and the number in an enabled day cell. */
  ink: text.default.body,
  /** The weekday initials, and a day belonging to the neighbouring month. */
  muted: text.default.placeholder,
  /** The header's caret and the two month arrows. */
  glyph: text.default.caption,
  /** Hover and press on an unselected cell — the neutral interaction rungs. */
  cellHover: surface.default.defaultHover,
  cellPressed: surface.default.defaultPressed,
  /** A selected day, month or year — `Button` `primary` `contained`. */
  selectedBackground: surface.primary.default,
  selectedBackgroundHover: surface.primary.defaultHover,
  selectedInk: text.default.headingOnColor,
  /**
   * Today, when it is not the selected day: the subtle primary fill and a
   * mid-strength primary ring — plainly primary-flavoured, and plainly
   * weaker than a selected day's solid fill.
   *
   * Both are stated rather than left to MUI X, which computes the fill as
   * `alpha(palette.primary.main, 0.12)`. A composited alpha is not a token
   * and does not follow the ladder in dark mode, and MUI's ring alone
   * (`border.primary.default`) is pale enough to disappear against the
   * panel.
   */
  todayBackground: surface.primary.subtle,
  todayBorder: border.primary.focus,
  /** A day outside `minDate`/`maxDate`, or refused by `shouldDisableDate`. */
  disabledInk: text.disabled.default,
  /** Keyboard focus on a cell. */
  focusRing: border.primary.focus,
} as const satisfies Record<string, ModeToken>;
