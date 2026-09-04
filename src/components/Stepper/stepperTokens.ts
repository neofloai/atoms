import {
  border,
  fontFamilies,
  fontWeights,
  icon,
  radius,
  surface,
  text,
  typography,
} from '@/src/tokens';

import type { CSSObject } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';

/**
 * Geometry, type and colour for the stepper, transcribed from the Figma
 * `stepper` component set (node 3663:40573 — ten cells, `Property 2`
 * crossed with `Property 3`).
 *
 * The two axes are not the same kind of thing, which is worth saying
 * before the numbers:
 *
 *   - **`Property 2` — `done` / `not-done`** is state. It moves the dot
 *     and the line, and nothing else. The header keeps the same ink and
 *     the same weight in all ten cells.
 *   - **`Property 3` — `title` / `text` / `action` / `last` / `collapse`**
 *     is mostly *content*, not state. `title` is a header on its own,
 *     `text` adds a description, `action` adds buttons under it. Those
 *     three are one component with more or less inside it, which is
 *     already how MUI models a step: `StepLabel` for the header,
 *     `StepContent` for whatever sits beside the line. Only `last` and
 *     `collapse` change the drawing.
 *
 * Every hex in the set resolves to a token this repo already had, so
 * nothing here is a new value:
 *
 *   Figma variable                  hex        token
 *   ------------------------------  ---------  ----------------------------
 *   surface.primary.default         #4949dc    surface.primary.default
 *   surface/default/2               #e5e4e1    surface.disabled.default
 *   border/primary/3                #868fee    border.primary.focus
 *   border.layers.card1            #eeeeec    border.layers.card1
 *   icon/primary/4                  #5f6aea    icon.primary.onColorHover
 *   icon/default/caption on-color   #cccac6    icon.default.captionOnColor
 *   text/default/b1                 #31302e    text.default.body
 *   text/default/b3                 #848280    text.default.placeholder
 *   text/primary/2                  #343eb3    text.primary.caption
 *   icon/primary/2                  #343eb3    icon.primary.caption
 *   Scale/50                        2          LINE_WIDTH_PX (below)
 *   Scale/200                       8          DOT_SIZE_PX (below)
 *   Scale/300                       16         STEP_GAP_PX (below)
 *   Sans/B1/Medium                  13/20      typography.body.b1
 *   Sans/B2/Regular                 12/16      typography.body.b2
 *
 * Two of those mappings are a choice rather than a transcription, and
 * both are named after the *rung* they land on rather than the slot they
 * were borrowed from — the call `Tabs` made when it painted its indicator
 * from `border/primary/3`, the house focus-ring rung.
 *
 *   - `surface/default/2` is the tier-2 neutral surface, which this repo
 *     calls `surface.default.defaultHover`. The dot reads from
 *     `surface.disabled.default` instead. Both hold `grey/200` in light,
 *     so today they are the same pixel; they part in dark, where
 *     `disabled` is `grey/900` against `defaultHover`'s `grey/950`. A dot
 *     for a step nobody has reached is a disabled marker, not a hover
 *     state, and if the two ever diverge it should follow the disabled
 *     ladder.
 *   - `icon/primary/4` is the fourth rung of the primary icon ladder,
 *     which this repo names `onColorHover`. The pin is not on colour and
 *     is not hovered; it is the rung, and the name is the repo's.
 *
 * Note that the last step's pin does not reuse the dot's colours. Figma
 * draws it one rung lighter in both states — `primary/400` against the
 * dot's `primary/500`, `grey/300` against the dot's `grey/200` — so the
 * two are transcribed separately rather than shared.
 */

/**
 * Width of the indicator column, in every cell: the dot, the pin, the
 * collapse row's three dots, and the line all measure their position
 * from this. Figma draws a 12px frame and centres the 8px dot in it.
 */
export const INDICATOR_COLUMN_PX = 12;

/** The dot, `Scale/200`. */
export const DOT_SIZE_PX = 8;

/**
 * The last step's pin, and the box the collapse row's three dots sit in.
 * Figma draws the pin as a 12px frame with the shape inset 2px on each
 * side, so it is the column's own width rather than the dot's.
 */
export const PIN_SIZE_PX = INDICATOR_COLUMN_PX;

/**
 * Thickness of the line down the indicator column (`Scale/50`), and the
 * side of one square in the collapse row's vertical ellipsis.
 *
 * A named literal: the component spacing ladder starts at 4, the same
 * reason `Tabs` keeps its own `RULE_WIDTH_PX` and `Chip` its own
 * `DENSE_PADDING_Y_PX`.
 */
export const LINE_WIDTH_PX = 2;

/**
 * Gap from the indicator column to the text (`Scale/300`), and the
 * length of bare line between one step and the next.
 *
 * Also a named literal, for the reason `ACCORDION_PADDING_PX` is: the
 * component ladder runs 0, 4, 8, 12, 24, 48, 64, 96, so it skips
 * `Scale/300` entirely. `radius.lg` is also 16, but borrowing a radius
 * for a distance reads as a radius at the call site. Tracked in
 * DESIGNER_QUESTIONS.md #31, and again in #41.
 */
export const STEP_GAP_PX = 16;

/**
 * Left inset of the line, so a `LINE_WIDTH_PX` rule runs down the middle
 * of the column rather than along its edge — 5px, putting the 2px line
 * across x=5..7 and its centre on 6, which is where Figma's connector
 * SVG draws it.
 */
export const LINE_INSET_PX = (INDICATOR_COLUMN_PX - LINE_WIDTH_PX) / 2;

/**
 * Left edge of the text column, measured from the step's own edge: the
 * indicator column plus the gap. Everything in a step lines up on this —
 * the header, the description, the buttons, and the collapse row's label.
 */
export const CONTENT_INSET_PX = INDICATOR_COLUMN_PX + STEP_GAP_PX;

/**
 * `StepContent`'s left padding. The content box starts at
 * `LINE_INSET_PX`, spends `LINE_WIDTH_PX` on the line it draws as a
 * left border, and the text has to land on `CONTENT_INSET_PX` — so this
 * is what is left over.
 */
export const CONTENT_PADDING_LEFT_PX =
  CONTENT_INSET_PX - LINE_INSET_PX - LINE_WIDTH_PX;

/** Height of the collapse row's button, and the caret inside it. */
export const COLLAPSE_ROW_HEIGHT_PX = 32;

/** The caret on the collapse row, and the only asset the set uses. */
export const COLLAPSE_ICON_SIZE_PX = 16;

/**
 * Radius on the dot and on the collapse row's squares. Figma binds
 * `Scale/200` (8) to both, which on an 8px box and a 2px one is a circle
 * either way; `radius.full` says that rather than leaving the reader to
 * work out that 8 ≥ half of 8.
 */
export const DOT_RADIUS = radius.full;

/**
 * Header type — `Sans/B1/Medium`, 13/20 at −0.13px.
 *
 * Set explicitly rather than inherited. MUI paints `StepLabel`'s label
 * from `theme.typography.body1`, which is a different size and weight
 * from this ramp's B1, and the Medium rung is the one thing that
 * separates a header from the description under it: the design changes
 * nothing else between them but colour.
 */
export const labelType: CSSObject = {
  fontFamily: fontFamilies.product.sans,
  fontWeight: fontWeights.medium,
  fontSize: typography.body.b1.size,
  lineHeight: `${typography.body.b1.leading}px`,
  letterSpacing: `${typography.body.b1.letterSpacing}em`,
};

/**
 * Description type — `Sans/B2/Regular`, 12/16. Worn by whatever sits in
 * `StepContent` and by `StepLabel`'s `optional` caption, which is the
 * one other place the design puts small text.
 */
export const descriptionType: CSSObject = {
  fontFamily: fontFamilies.product.sans,
  fontWeight: fontWeights.regular,
  fontSize: typography.body.b2.size,
  lineHeight: `${typography.body.b2.leading}px`,
  letterSpacing: `${typography.body.b2.letterSpacing}em`,
};

/**
 * The collapse row's label — `Sans/B1/Medium` like a header, but in the
 * primary ink. Same rung, different colour, so it borrows the header's
 * type wholesale.
 */
export const collapseType: CSSObject = labelType;

/**
 * The dot beside a header. `done` covers MUI's `active` *and*
 * `completed`: Figma has two states where MUI has three, and a step you
 * are standing on has plainly been reached.
 */
export const dot = {
  done: surface.primary.default,
  pending: surface.disabled.default,
} as const satisfies Record<string, ModeToken>;

/**
 * The last step's pin, one rung lighter than the dot in both states —
 * see the header comment.
 */
export const pin = {
  done: icon.primary.onColorHover,
  pending: icon.default.captionOnColor,
} as const satisfies Record<string, ModeToken>;

/**
 * The line, both where it runs between two steps (`StepConnector`) and
 * where it runs beside a step's content (`StepContent`'s left border).
 * Figma draws one rule through both, so they read the same token.
 */
export const line = {
  done: border.primary.focus,
  pending: border.layers.card1,
} as const satisfies Record<string, ModeToken>;

/**
 * Ink. The header does not move with state — `text/default/b1` in all
 * ten cells, `done` and `not-done` alike — so state lives entirely in
 * the dot and the line.
 */
export const ink = {
  label: text.default.body,
  description: text.default.placeholder,
  /** The collapse row's label and its caret, both `#343eb3`. */
  collapse: text.primary.caption,
  collapseGlyph: icon.primary.caption,
} as const satisfies Record<string, ModeToken>;

/**
 * The three squares in the collapse row's vertical ellipsis, which take
 * the dot's own fill rather than the lighter primary the label uses.
 */
export const collapseDots = surface.primary.default;

/**
 * `error` is not drawn in the Figma set, and `StepLabel` has the prop, so
 * it is composed from the house error ladder rather than left on MUI's
 * Material red: the role's fill for the dot and its caption ink for the
 * header. This is the only place the component paints a colour the design
 * does not name, and it is the same derivation `Button` uses for `error`.
 */
export const errorState = {
  dot: surface.error.default,
  label: text.error.caption,
} as const satisfies Record<string, ModeToken>;
