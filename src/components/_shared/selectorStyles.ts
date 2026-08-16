import { border, icon, surface } from '@/src/tokens';

import type { ModeToken } from '@/src/tokens';

/**
 * Geometry and colour shared by the two selectors, `Checkbox` and
 * `Radio`.
 *
 * They are drawn as two frames of one Figma sheet — `checkbox` (node
 * 3205:121943) and `radio-button` (node 3653:28080), sitting side by
 * side in `small-components` (3648:26397) — with the same two sizes,
 * the same state axis, and the same colour ladder. So the mapping lives
 * here once, and a change to the resting ring cannot reach one control
 * without reaching the other.
 *
 * That is not only tidiness. The two frames disagree in four places,
 * each by a single rung, and read as slips rather than intent:
 *
 *   - the resting fill is `surface/layers/card 1` on the checkbox and
 *     `card 2` on the radio;
 *   - "selected" is `surface/primary/default` (`primary/500`) on the
 *     checkbox and `icon/primary/4` (`primary/400`) on the radio;
 *   - a disabled checkbox drops its border, a disabled radio keeps one;
 *   - the mark on a disabled control is `border/disabled/default`
 *     (`grey/300`) on the checkbox and `icon/disabled/default`
 *     (`grey/500`) on the radio.
 *
 * Two controls that appear in the same form, one above the other,
 * cannot shade differently for the same reason. Each disagreement is
 * settled once below and flagged in DESIGNER_QUESTIONS.md #50.
 */

/**
 * Control size, from the `Small` boolean both frames carry: `md` is 16
 * (`Scale/300`), `sm` is 12 (`Scale/250`).
 */
export type SelectorSize = 'sm' | 'md';

/**
 * The control's own box. Both frames measure the *outer* edge — Figma
 * strokes inside the frame — so the box is `border-box` and the 1px
 * ring eats into the 16 rather than adding to it.
 */
export const SELECTOR_SIZE_PX: Record<SelectorSize, number> = {
  sm: 12,
  md: 16,
};

/** The ring, 1px at both sizes and in every state that draws one. */
export const SELECTOR_BORDER_WIDTH_PX = 1;

/**
 * Diameter of the round target the control sits in — 32 at both sizes,
 * so the hover halo does not shrink with the control.
 *
 * The sheet draws the control and nothing around it. MUI's own answer
 * is a flat 9px padding, which would put a 16px control in a 34px box
 * and a 12px one in a 30px box: two halos for two controls, and neither
 * a number this system uses anywhere else. 32 is the house round
 * target — `IconButton size="sm"` is 32 around a 16px glyph, which is
 * exactly `md` here, and the grid's footer buttons are the same box.
 *
 * So the padding is whatever is left over, 8 at `md` and 10 at `sm`,
 * and a form mixing the two sizes still lines its controls up.
 */
export const SELECTOR_TARGET_SIZE_PX = 32;

/** Padding between the control's edge and the edge of its 32px target. */
export function selectorInsetPx(size: SelectorSize): number {
  return (SELECTOR_TARGET_SIZE_PX - SELECTOR_SIZE_PX[size]) / 2;
}

/**
 * The mark on a selected control — the checkbox's tick, and nothing on
 * the radio, whose dot is the accent itself.
 *
 * The `headingOnColor` slot is the one for ink on a saturated surface,
 * but its dark rung is near-black: right for a surface that inverts
 * between schemes, wrong for this one. The accent fill is `primary/500`
 * in light and `primary/600` in dark — two dark blues — so the tick
 * keeps its light value in both rather than turning black on the second.
 */
const onAccent: ModeToken = {
  light: icon.default.headingOnColor.light,
  dark: icon.default.headingOnColor.light,
};

/**
 * Every colour either selector paints, in both schemes.
 *
 * Where the two frames agree the token is simply theirs. Where they
 * disagree, the header comment says which way it was settled:
 *
 *   - `restingFill` is the checkbox's `card 1`, the paler of the two, so
 *     an untouched control reads as an outline rather than a well;
 *   - `accent` is the checkbox's `primary/500`, so "selected" is one
 *     blue across the pair rather than two a rung apart;
 *   - `disabledBorder` applies to both, since a checkbox that drops its
 *     ring loses its shape against a light surface while the radio
 *     beside it keeps one;
 *   - `disabledMark` is the radio's `grey/500`, the darker of the two —
 *     the checkbox's `grey/300` tick is a 1.5px stroke on a `grey/200`
 *     fill, which all but disappears.
 *
 * `hoverFill` comes from the checkbox alone: the radio frame changes
 * only its ring on hover, and taking the tint too costs nothing and
 * keeps the pair moving together.
 */
export const selectorTokens = {
  restingFill: surface.layers.card1,
  restingBorder: border.primary.default,
  hoverFill: surface.primary.subtle,
  hoverBorder: border.primary.defaultHover,
  accent: surface.primary.default,
  onAccent,
  disabledFill: surface.disabled.default,
  disabledBorder: border.disabled.default,
  disabledMark: icon.disabled.default,
} satisfies Record<string, ModeToken>;
