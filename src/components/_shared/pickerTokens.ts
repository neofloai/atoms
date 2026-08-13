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

/**
 * Colour, type and geometry shared by every MUI X picker in the library.
 *
 * **The Product Design System draws no picker of any kind.** Searching the
 * Figma library for "date picker", "time picker", "calendar" and "clock"
 * returns the `CalendarBlank`, `Clock`, `Timer`, `Alarm` and `Watch`
 * glyphs from the icon set, and nothing else — no component set, no
 * calendar grid, no popover, no clock. So unlike every other component in
 * this repo, nothing in this file is a transcription of a node.
 *
 * That does not make it invented, because a picker is three surfaces and
 * two of them are components the design system already specifies:
 *
 *   - **The field** is a text field. Every value in `field` below is read
 *     off `src/components/TextField/TextField.tsx`, which transcribes
 *     Figma node 3179:106156 — the same 8px inset, 8px corners,
 *     `layers/page` fill, 1px `card 1` border, bottom-edge-only focus
 *     accent, and the same three validation statuses. MUI X does not reuse
 *     MUI's `OutlinedInput` here, so the declarations are restated against
 *     `MuiPickersOutlinedInput-*` rather than shared; see
 *     `pickerStyles.ts`.
 *   - **The popover** is a floating panel. Every value in `panel` is read
 *     off `src/components/Menu/Menu.tsx`, which transcribes node
 *     3228:62331: `card 2` fill and border, 16px corners, a 4px inset, and
 *     `Shadow/medium`.
 *   - **The view inside it** — a calendar grid for `DatePicker`, a clock
 *     for `TimePicker` — has no precedent in either place. Its *geometry*
 *     is left exactly as MUI X ships it. Only its *colour and type* are
 *     moved onto house tokens, and each role is filled from the ladder the
 *     system already uses for that job rather than from a colour picked to
 *     look right. Nothing here invents a measurement the design system has
 *     not already made somewhere.
 *
 * The consequence worth stating plainly: the view is the one part of a
 * picker a designer has not signed off, and if a picker is ever drawn, the
 * view is what will move. Logged in DESIGNER_QUESTIONS.md #42 and #43.
 *
 * ## Why this module exists rather than one token file per picker
 *
 * Everything above is identical for the date picker and the time picker —
 * the same field, the same panel, the same value-cell states. Held in two
 * files they would drift, which is exactly the failure `fieldStyles.ts`
 * was created to stop after a `TextField` and a `DatePicker` in the same
 * form measured 12px apart. A picker-specific file holds only what is
 * genuinely specific: `datePickerTokens.ts` owns "today", and
 * `timePickerTokens.ts` owns the clock face.
 */

/**
 * Validation state of a picker's field, on the same three-status axis the
 * house `TextField` carries.
 *
 * The public `DatePickerStatus` / `TimePickerStatus` are written out as
 * literal unions rather than aliased to this, so the published `.d.ts`
 * never has to name an internal module.
 */
export type PickerStatus = 'error' | 'success' | 'warning';

/**
 * Inset from the field's border on every edge, and the gap between the
 * value and the button beside it (`Scale/200`); the field's content-row
 * height; and the glyph size inside its buttons. All three come from the
 * shared field geometry, so a picker's field and `TextField` cannot drift.
 *
 * `FIELD_CONTENT_HEIGHT_PX` is the one value a picker has to *restate*
 * rather than inherit: MUI X gives its sections container a `1.4375em`
 * line height, which on the 13px `B1` ramp resolves to 18.69px and lands
 * the field on 34.7px — close enough to look right on its own and clearly
 * wrong beside a text field.
 */
export {
  FIELD_PADDING_PX,
  FIELD_CONTENT_HEIGHT_PX,
  ADORNMENT_GLYPH_PX as GLYPH_SIZE_PX,
} from './fieldStyles';

/** Field corners — 8px, matching `TextField`. */
export const FIELD_RADIUS = radius.sm;

/** The popover's corners and inset, matching `Menu`. */
export const PANEL_RADIUS = radius.lg;
export const PANEL_PADDING_PX = spacing.component.xxs;

/** The popover's drop shadow — Figma `Shadow/medium`, matching `Menu`. */
export const PANEL_ELEVATION = elevation.medium;

/** Border width shared by the field, the popover, and rules inside it. */
export const HAIRLINE_WIDTH_PX = 1;

/**
 * The value in the field, and the number in a day or time cell —
 * `Sans/B1/Regular`, 13/20. `TextField` sets the same on its input.
 */
export const fieldType: CSSObject = {
  fontFamily: fontFamilies.product.sans,
  fontWeight: fontWeights.regular,
  fontSize: typography.body.b1.size,
  lineHeight: `${typography.body.b1.leading}px`,
  letterSpacing: `${typography.body.b1.letterSpacing}em`,
};

/**
 * The label above the field, and the weekday initials across the top of a
 * calendar grid — `Sans/B2/Regular`, 12/16. `TextField`'s label type.
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
 * The one rung of emphasis inside a panel — a calendar's month-and-year
 * label, a clock's column heading — `Sans/B1/Medium`. Same reasoning
 * `StepLabel` uses: Medium is what separates a heading from the body
 * beside it when nothing else changes.
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
  /** The format placeholder shown in an empty section (`MM/DD/YYYY`, `hh:mm aa`). */
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
} as const satisfies Record<PickerStatus, ModeToken>;

export const statusInk = {
  error: text.error.onColorHover,
  success: text.success.onColorHover,
  warning: text.warning.caption,
} as const satisfies Record<PickerStatus, ModeToken>;

/** The popover. `Menu`'s panel, token for token. */
export const panel = {
  background: surface.layers.card2,
  border: border.layers.card2,
} as const satisfies Record<string, ModeToken>;

/**
 * A value cell inside a panel — a day in a calendar, an hour in a clock
 * column, a numeral on a clock face.
 *
 * Every role is filled from the ladder the house already uses for that
 * job: a selected cell is the primary fill and on-colour ink `Button`'s
 * `primary` `contained` uses, and a disabled or out-of-month cell is the
 * disabled / placeholder ink.
 *
 * `hover` and `pressed` are the two that could not simply be copied from
 * the neutral action ladder, and the reason is worth recording. A control
 * on a page hovers to `surface.default.defaultHover`, but these cells sit
 * on a `card 2` panel, and in dark mode that token is `grey/950` — the
 * panel's own fill. Hover was therefore invisible in dark mode. Both
 * replacements follow precedents the system already sets:
 *
 *   - `hover` moves one rung up the *layers* ladder to `card 3`, which is
 *     what `MenuItem` does for the same reason on the same panel (see
 *     `MenuItem.tsx` and DESIGNER_QUESTIONS.md #23). Distinct from the
 *     panel in both schemes.
 *   - `pressed` moves into the primary family instead of further up the
 *     greys, because the greys have no rung left: `defaultPressed` is
 *     `grey/900` in dark mode, the same value `card 3` resolves to, so a
 *     held cell would look exactly like a hovered one. `primary/subtle`
 *     is distinct from both in both schemes, and it previews the solid
 *     primary the cell is about to take. Logged in DESIGNER_QUESTIONS.md
 *     #43.
 */
export const cell = {
  /** A panel heading, and the number in an enabled cell. */
  ink: text.default.body,
  /** Weekday initials, a day in the neighbouring month, an inner clock numeral. */
  muted: text.default.placeholder,
  /** Carets and arrows in a panel header. */
  glyph: text.default.caption,
  hover: surface.layers.card3,
  pressed: surface.primary.subtle,
  /** A selected cell — `Button` `primary` `contained`. */
  selectedBackground: surface.primary.default,
  selectedBackgroundHover: surface.primary.defaultHover,
  selectedInk: text.default.headingOnColor,
  /** A cell outside the accepted range, or refused by a `shouldDisable*` prop. */
  disabledInk: text.disabled.default,
  /** Keyboard focus on a cell. */
  focusRing: border.primary.focus,
  /**
   * Keyboard focus on a cell that is already *selected*, where `focusRing`
   * cannot be used: it is a primary border drawn inside a primary fill. In
   * light mode that reads as an unintended second outline, and in dark mode
   * `border/primary/3` and `surface/primary/default` are the same rung of the
   * scale, so the ring disappears entirely and a focused selection looks
   * exactly like an unfocused one.
   *
   * The on-colour ink is the token the system already uses for anything drawn
   * *on* a primary fill, so it is guaranteed to read against it in both
   * schemes. Logged in DESIGNER_QUESTIONS.md #43.
   */
  selectedFocusRing: text.default.headingOnColor,
} as const satisfies Record<string, ModeToken>;
