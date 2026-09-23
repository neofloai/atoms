import { border, spacing, text, typography } from '@/src/tokens';

import type { ModeToken } from '@/src/tokens';

/**
 * Geometry and colour read off the Revamp UI Figma (node 1367:48487),
 * which redraws the bar the Product Design System file originally
 * specified (3463:12374).
 *
 * Four things moved, and the first two are what make it read as a
 * different component:
 *
 *   - **the label grew**, from `Sans/B1/Regular` (13/20) to `Sans/H6`
 *     (16/24). A tab is now set at heading size.
 *   - **selection changes weight.** `Sans/H6/Medium` on the selected tab
 *     against `Sans/H6/Regular` on the rest. The old sheet changed only
 *     ink, and this file used to say so at length.
 *   - **the indicator doubled and lost its colour**, from a 1px
 *     periwinkle rule (`border/primary/3`) to a 2px near-black one.
 *   - **the box went square-ish**: 16px of padding either side of the
 *     label, no gap at all between adjacent tabs, and a 40px tab.
 *
 * ## The three hexes with no token behind them
 *
 * This is the same drift #55 logged: Revamp UI is a different file from
 * the one the token collections were synced from, and its greys land
 * between our rungs. Nothing here invents a value -- each maps to the
 * nearest rung the library already has, which in two of the three cases
 * is the rung this component was already using.
 *
 *   Figma variable            hex        shipped as            delta
 *   ------------------------  ---------  --------------------  --------
 *   text/default/body         #2c2b27    text.default.b1       #31302e
 *   text/default/placeholder  #848076    text.default.b3       #848280
 *   border/call-out/card 1    #4a4742    text.default.b1       #31302e
 *   border/layers/card 2      #e5e4e1    border.layers.card2   exact
 *   Scale/200                 8          spacing.component.xs  exact
 *   Scale/300                 16         TAB_PADDING_INLINE_PX exact
 *   Sans/H6                   16/24      typography.headings.h6
 *
 * The two label inks are a rounding difference and nothing more -- the
 * sheet's own ink is within three units of the rung already shipping, in
 * both cases. The indicator is the one worth knowing about: the sheet
 * draws it a rung *lighter* than the label it sits under (#4a4742
 * against #2c2b27) and the library has no rung in that gap, so the two
 * are shipped on one token and the separation is lost. See
 * DESIGNER_QUESTIONS.md #59.
 *
 * A hardcoded hex was the alternative and is not available here: every
 * colour in this library is a `{ light, dark }` pair resolved by
 * `paired()`, the sheet exports light only, and a bare hex would paint
 * the same near-black rule on a near-black page in dark mode.
 */

/**
 * `Scale/200` — above and below the label, which is what makes the tab
 * 40 tall: 8 + 24 + 8.
 *
 * Unlike the previous sheet, this one draws the padding symmetrically,
 * so the tab box no longer has to be reconstructed. The old file carried
 * a long note explaining why the implementation's height disagreed with
 * Figma's 32px item; that disagreement is gone and the note with it.
 */
export const TAB_PADDING_BLOCK_PX = spacing.component.xs;

/**
 * `Scale/300` — either side of the label.
 *
 * A named literal rather than a token, for the reason `Table`'s edge
 * inset is one: the component spacing ladder runs 0, 4, 8, 12, 24, 48,
 * 64, 96, so it skips 16 entirely. `radius.lg` is also 16, but borrowing
 * a radius for a distance reads as a radius at the call site.
 *
 * This is also what sets the indicator's width, since MUI measures the
 * indicator from the tab's box — see `Tabs.tsx`.
 */
export const TAB_PADDING_INLINE_PX = 16;

/**
 * `Scale/250` — between the label and its count pill.
 *
 * The frame lays each tab out as a 12px-gap flex row holding the label
 * and a badge; the badge is hidden in this export, but the gap is bound
 * on the visible row. It was 4 under the previous sheet.
 */
export const TAB_COUNT_GAP_PX = spacing.component.sm;

/** Label type — `Sans/H6`, 16/24. */
export const labelType = typography.headings.h6;

/** Height of the bar, and of one tab: 8 + 24 + 8. */
export const BAR_HEIGHT_PX = labelType.leading + TAB_PADDING_BLOCK_PX * 2;

/**
 * Gap between adjacent tabs — none.
 *
 * The two tabs in the sheet are flush: the first runs x=40..113 and the
 * second starts at 113. All the air between two labels is the 16px each
 * tab carries, which comes to 32 and is why none is needed on top.
 *
 * It matters more than it looks, because the indicator now spans the
 * whole tab. A flex gap would leave the rule stopping short of where the
 * next tab begins, and the selected tab would read as narrower than it
 * is.
 */
export const TAB_LIST_GAP_PX = 0;

/**
 * Thickness of the selected indicator — 2, measured off the render
 * rather than taken from a variable (rows 38 and 39 of a 40px strip).
 *
 * Not on any scale: `Scale/25` is 1 and the component ladder starts at
 * 4. It stays a literal for the same reason `RULE_WIDTH_PX` does.
 */
export const INDICATOR_WIDTH_PX = 2;

/**
 * Thickness of the bar's own rule (`Scale/25` = 1).
 *
 * **The sheet does not draw this rule, and it is kept anyway.** The
 * frame puts `border-b-2` on the selected *tab* and no border at all on
 * the container, so a faithful reading is a bar with no track and one
 * floating 2px segment. It is retained because removing a hairline that
 * ships today is a regression in every bar already built on this
 * component, the request named the colours and the indicator width and
 * not the track, and a 1384x40 strip exported on its own cannot show
 * whether the page under it carries a divider.
 *
 * It moves to `border/layers/card 2` (#e5e4e1) — one rung darker than
 * the `border/layers/card 1` it used to be — which is the value the
 * frame does bind, on the hidden count badge. See
 * DESIGNER_QUESTIONS.md #59, which asks for the track to be settled.
 */
export const RULE_WIDTH_PX = 1;

/**
 * Label weight per state — `Sans/H6/Medium` (500) on the selected tab,
 * `Sans/H6/Regular` (400) on the rest, as the frame binds them.
 *
 * This reverses the previous sheet, and the note it used to carry here
 * was that keeping one weight meant the row never reflowed as selection
 * moved. It now reflows: a tab is as wide as its label, and Medium is
 * wider than Regular. Drawn that way, shipped that way, logged in
 * DESIGNER_QUESTIONS.md #59.
 */
export const labelWeight = {
  selected: 'medium',
  unselected: 'regular',
} as const;

/**
 * Label ink. Unchanged by this sheet: `text/default/body` and
 * `text/default/placeholder` resolve to the two rungs already in use,
 * within three units each.
 */
export const ink = {
  /** `text/default/body`, nearest rung. */
  selected: text.default.b1,
  /** `text/default/placeholder`, nearest rung. */
  unselected: text.default.b3,
  /**
   * Hover, on an unselected tab. Derived — no sheet has ever drawn a
   * hovered cell — and it lands on the *selected* rung, so a hovered tab
   * reads as "this is what you would be picking". Weight does not move
   * with it: hover is a preview, and a row that reflowed on mouseover
   * would be worse than one that reflows on click.
   */
  hover: text.default.b1,
  disabled: text.disabled.default,
} as const satisfies Record<string, ModeToken>;

/** The hairline under the whole bar (`border/layers/card 2`). */
export const rule = border.layers.card2;

/**
 * The selected tab's segment of that rule.
 *
 * `text.default.b1` — the selected label's own ink, which is the closest
 * rung to the sheet's `border/call-out/card 1` and is also the honest
 * reading of what the indicator now is: the bar used to say "selected"
 * in colour, and now says it in the same near-black the selected label
 * is set in.
 */
export const indicator = text.default.b1;

/** The same indicator on a disabled bar (`border/disabled/default`). */
export const indicatorDisabled = border.disabled.default;
