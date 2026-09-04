import { border, spacing, text, typography } from '@/src/tokens';

import type { ModeToken } from '@/src/tokens';

/**
 * Geometry and colour read off the Product Design System Figma
 * (node 3463:12374 — `tab-items` 3463:12373 and the bar 3463:12630).
 *
 * Every hex in that node resolves to a token this repo already had, so
 * nothing here is a new value:
 *
 *   Figma variable            hex        token
 *   ------------------------  ---------  ----------------------------
 *   text/default/b1           #31302e    text.default.body
 *   text/default/b3           #848280    text.default.placeholder
 *   text.disabled.default     #aeaba4    text.disabled.default
 *   border/primary/3          #868fee    border.primary.focus
 *   border/disabled/default   #cccac6    border.disabled.default
 *   border.layers.card1      #eeeeec    border.layers.card1
 *   Scale/250                 12         spacing.component.sm
 *   Scale/25                  1          RULE_WIDTH_PX (below)
 *   Sans/B1/Regular           13/20      typography.body.b1
 *
 * The count chip's four values (`surface.primary.subtle`,
 * `text/primary/3`, `surface.layers.card3`, `text/default/b2`) are not
 * listed because nothing here reads them: that chip is an instance of
 * the `chip-small` component in Figma, and `Chip size="sm"` already
 * paints exactly those tokens for `variant="primary"` and
 * `variant="secondary"` respectively. See `Tab.tsx`.
 */

/**
 * Space between the label and the rule (`Scale/250`) — and, here, above
 * the label as well. See `BAR_HEIGHT_PX` for why it is mirrored.
 */
export const TAB_LABEL_GAP_PX = spacing.component.sm;

/**
 * Height of the bar, and of one tab: 12 + 20 + 12.
 *
 * **This is the one place the implementation does not measure what Figma
 * measures**, and it is worth being clear about why.
 *
 * Figma's tab item is 32px — a 20px label with the 12px gap below it and
 * nothing above (node 3463:12373 is `flex-col`, `gap-[Scale/250]`, no
 * padding). That puts the label flush with the top of the bar, which is
 * fine for a static frame and wrong for a control: everything that paints
 * on a tab paints on its whole box, so the hover surface, the ripple, and
 * the focus ring would all cover the label plus 12px of empty space under
 * it, reading as a highlight hanging below the text.
 *
 * Mirroring the gap to the top fixes that with no new value: the label
 * ends up centred in its tab, the interaction surface covers the tab the
 * way MUI's does, and the gap the design actually specifies — between the
 * label and the rule — is untouched. What changes is the bar's total
 * height, and that 32px was never a bound token: it is Figma's frame
 * hugging its contents, whereas the 12px is `Scale/250`. See
 * DESIGNER_QUESTIONS.md #40.
 */
export const BAR_HEIGHT_PX = typography.body.b1.leading + TAB_LABEL_GAP_PX * 2;

/**
 * Distance between two adjacent tab *labels*, from the bar's 24px gap.
 * Not the flex gap we set — see `Tabs.tsx`, which splits it between the
 * gap and each tab's own padding.
 */
export const TAB_LABEL_SPACING_PX = spacing.component.md;

/**
 * Padding on the two faces of a tab that point along the bar — left and
 * right when the bar is horizontal, top and bottom when it is vertical.
 * Taken *out of* `TAB_LABEL_SPACING_PX` rather than added to it, so the
 * flex gap between two tabs is 24 - 8 - 8 and the labels still land 24px
 * apart.
 *
 * Figma draws a tab as bare text with nothing around it. That leaves the
 * focus ring nowhere to go — a ring on the label's own box crosses the
 * first and last glyph — and it leaves the hover surface no room either,
 * so it ends up the exact width of the text. 8px each side fixes both,
 * comes out of the gap rather than adding to the row, and every tab
 * including the first gets the same.
 *
 * It also widens the indicator by 16px, since MUI measures that from the
 * tab's box: the line runs end to end under the tab rather than stopping
 * at the text. That is how MUI draws it too.
 */
export const TAB_PADDING_PX = spacing.component.xs;

/**
 * Thickness of both the bar's rule and the selected indicator
 * (`Scale/25` = 1). The component spacing ladder starts at 4, so this
 * stays a literal — the same reason `Chip` keeps its own
 * `DENSE_PADDING_Y_PX`.
 */
export const RULE_WIDTH_PX = 1;

/** Label type: `Sans/B1/Regular`, at `Regular` in every Figma cell. */
export const labelType = typography.body.b1;

/**
 * Label ink. Selection moves the label two rungs up the neutral ladder
 * and is the *only* thing the label does — Figma gives the selected tab
 * no weight change, no fill, and no tint.
 */
export const ink = {
  /** `text/default/b1` on the selected tab. */
  selected: text.default.body,
  /** `text/default/b3` on the rest. */
  unselected: text.default.placeholder,
  /**
   * Hover, on an unselected tab. Derived — the Figma set has no hovered
   * cell — and it lands on the *selected* rung, so a hovered tab reads
   * as "this is what you would be picking". The indicator stays the
   * thing that says which tab you already have. See
   * DESIGNER_QUESTIONS.md #40.
   */
  hover: text.default.body,
  disabled: text.disabled.default,
} as const satisfies Record<string, ModeToken>;

/** The hairline under the whole bar (`border.layers.card1`). */
export const rule = border.layers.card1;

/**
 * The selected tab's segment of that hairline. `border/primary/3` is the
 * house focus-ring rung of the primary scale; here it is the indicator,
 * which is the one place this design uses colour at all.
 */
export const indicator = border.primary.focus;

/** The same indicator on a disabled bar (`border/disabled/default`). */
export const indicatorDisabled = border.disabled.default;
