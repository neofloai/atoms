import { border, spacing, surface, text, typography } from '@/src/tokens';

import type { ModeToken } from '@/src/tokens';

/**
 * Geometry and colour for the tab bar.
 *
 * Three sources have described this component, and this file follows
 * the third:
 *
 *   1. the Product Design System sheet (node 3463:12374), which built it
 *   2. the Revamp UI sheet (node 1367:48487), which redrew it
 *   3. **a correction from Neoflo Self-Serve** (`WorkAreaPage.tsx`,
 *      21 September, against Atoms 2.0.0), which is what ships now
 *
 * The third is a consuming app rather than a Figma file, and taking it
 * means overruling (2) on four counts: the indicator's weight and
 * colour, the label's leading, and whether selection moves the font
 * weight. That was an explicit call and is recorded in
 * DESIGNER_QUESTIONS.md #63 so a designer can settle it against the
 * sheet rather than discovering it in a diff.
 *
 * ## What the correction changes, against the Revamp UI sheet
 *
 *   Property            sheet (1367:48487)      shipped
 *   ------------------  ----------------------  ----------------------
 *   tab padding         8 / 16                  12 / 16
 *   label leading       24 (`Sans/H6`)          20
 *   tab height          40                      44, and no floor
 *   weight on select    Regular -> Medium       no move, colour only
 *   selected ink        text/default/b1         text/default/heading
 *   indicator           2px, text/default/b1    1px, border/layers/card 5
 *   bar's own rule      always drawn            `divider` can drop it
 *   hover               ink -> selected rung    a fill, ink unchanged
 *
 * The last two are the ones no sheet contradicts, because no sheet can
 * answer them: Figma never draws the container a bar sits in, and it
 * has never drawn a hovered tab at all (DESIGNER_QUESTIONS.md #59).
 * They are additions rather than reversals.
 *
 * ## The one value with no rung behind it
 *
 * The label is 16/20. `Sans/H6` is 16/**24** and the type scale carries
 * no 16/20 slot — `headings.h5` is 20/28 and `body.b1` is 13/20, so
 * neither the size nor the leading can be borrowed from one rung. The
 * size and tracking come from `h6`; the leading is a named literal
 * below. See DESIGNER_QUESTIONS.md #63.
 */

/**
 * `Scale/250` — above and below the label, which with the 20px leading
 * is what makes the tab 44.
 *
 * It was `Scale/200` under the Revamp UI sheet, for a 40px tab. The
 * correction is the taller of the two despite describing itself as
 * compact, because what it was measured against was MUI's untouched
 * ~48px bar rather than this library's.
 */
export const TAB_PADDING_BLOCK_PX = spacing.component.sm;

/**
 * `Scale/300` — either side of the label. The one number all three
 * sources agree on.
 *
 * A named literal rather than a token, for the reason `Table`'s edge
 * inset is one: the component spacing ladder runs 0, 4, 8, 12, 24, 48,
 * 64, 96, so it skips 16 entirely. `radius.lg` is also 16, but
 * borrowing a radius for a distance reads as a radius at the call site.
 *
 * This is also what sets the indicator's width, since MUI measures the
 * indicator from the tab's box — see `Tabs.tsx`.
 */
export const TAB_PADDING_INLINE_PX = 16;

/**
 * `Scale/250` — between the label and its count pill.
 *
 * The frame lays each tab out as a 12px-gap flex row holding the label
 * and a badge. It was 4 under the Product Design System sheet.
 */
export const TAB_COUNT_GAP_PX = spacing.component.sm;

/**
 * Label leading — 20, and the one measurement in this file that no
 * token can supply.
 *
 * `labelType` below hands over the size (16) and the tracking; this is
 * the third value, and it is a literal because the scale has no 16/20
 * rung to name. Writing `typography.headings.h6.leading` would be 24
 * and wrong; writing `typography.body.b1.leading` would be 20 and right
 * by coincidence, off a 13px rung that has nothing to do with this
 * label — a coincidence that breaks silently the day `b1` is retuned.
 */
export const TAB_LABEL_LEADING_PX = 20;

/**
 * Label type — `Sans/H6` for its size and tracking only. The leading
 * comes from `TAB_LABEL_LEADING_PX`, which this rung disagrees with.
 */
export const labelType = typography.headings.h6;

/**
 * The height a tab comes out at: 12 + 20 + 12.
 *
 * Computed rather than imposed, and nothing in the component sets it as
 * a `min-height` — the correction asks for no floor at all, so the box
 * is exactly its padding plus its content, and a bar whose labels are
 * shorter is shorter.
 *
 * Which is why it ships: with no floor, this number exists only as the
 * outcome of an arithmetic a caller would otherwise have to redo. The
 * layout problem is the same one `NAVBAR_HEIGHT_PX` answers — a panel
 * that has to reserve the strip's height before the strip has rendered,
 * or a sibling that has to line up with it.
 */
export const TABS_HEIGHT_PX = TAB_LABEL_LEADING_PX + TAB_PADDING_BLOCK_PX * 2;

/**
 * Gap between adjacent tabs — none.
 *
 * All the air between two labels is the 16px each tab carries, which
 * comes to 32 and is why none is needed on top.
 *
 * It matters more than it looks, because the indicator spans the whole
 * tab. A flex gap would leave the rule stopping short of where the next
 * tab begins, and the selected tab would read as narrower than it is.
 */
export const TAB_LIST_GAP_PX = 0;

/**
 * Thickness of the selected indicator — 1, square, flush to the bottom
 * of the strip.
 *
 * Halved from the Revamp UI sheet's 2. At one pixel the indicator is
 * the same weight as the rule it sits on, so selection reads as a
 * *darkening* of the container's hairline under one tab rather than as
 * a bar laid over it — which is the whole point of the correction, and
 * why it also wanted the bar's own rule gone.
 */
export const INDICATOR_WIDTH_PX = 1;

/**
 * Thickness of the bar's own rule (`Scale/25` = 1) — drawn only while
 * `Tabs divider` is set, which it is by default.
 *
 * A bar is often dropped into a container that already draws a bottom
 * border, and two hairlines on the same edge read as one thick, slightly
 * wrong line. That is exactly what Self-Serve hit and overrode. The rule
 * stays on by default because a bar on a bare page needs it, and
 * `divider={false}` hands the edge to the container.
 */
export const RULE_WIDTH_PX = 1;

/**
 * Label weight — one value, for every state.
 *
 * The Revamp UI sheet moved the selected tab to Medium; the correction
 * does not move it at all, and says so explicitly ("regular — same as
 * selected, only color changes"). Keeping one weight is also what stops
 * the row reflowing as selection moves, since a tab is as wide as its
 * label and Medium is wider than Regular — the reflow DESIGNER_QUESTIONS
 * .md #59 raised against the sheet.
 */
export const labelWeight = 'regular' as const;

/**
 * Label ink. This is the whole of what selection changes.
 */
export const ink = {
  /** `text/default/heading` — the darkest rung, on the selected tab. */
  selected: text.default.heading,
  /** `text/default/b3`, the correction's "caption / b3". */
  unselected: text.default.b3,
  /**
   * Hover leaves the ink alone — "unchanged from unselected". The
   * pointer is answered by a fill instead, which is new; see
   * `hoverFill`.
   */
  hover: text.default.b3,
  disabled: text.disabled.default,
} as const satisfies Record<string, ModeToken>;

/**
 * The fill an unselected tab takes under the pointer —
 * `surface/layers/card 2`.
 *
 * New, and derived from a consuming app rather than from a sheet: no
 * Figma cell has ever drawn a hovered tab (DESIGNER_QUESTIONS.md #59),
 * and this bar previously answered the pointer by moving the ink to the
 * selected rung — which made a hovered tab look briefly selected. A
 * fill says "you are over this" without borrowing the one signal that
 * means "this is the one you are on".
 */
export const hoverFill = surface.layers.card2;

/** The hairline under the whole bar (`border/layers/card 2`). */
export const rule = border.layers.card2;

/**
 * The selected tab's segment of that rule —
 * `border/layers/card 5 on-color`, a dark neutral.
 *
 * Named as a border rather than as ink, which is what it is: at 1px it
 * is a rule, not an underline of the label.
 */
export const indicator = border.layers.card5OnColor;

/** The same indicator on a disabled bar (`border/disabled/default`). */
export const indicatorDisabled = border.disabled.default;
