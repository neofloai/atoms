import { fontFamilies, fontWeights, spacing, typography } from '@/src/tokens';

import type { CSSObject } from '@mui/material/styles';

/**
 * Geometry and type shared by the four parts of the accordion,
 * transcribed from the Figma `accordion-list-items` component set (node
 * 3653:30452 — variants `closed` 3653:30449, `open` 3653:30451,
 * `open-button` 3653:30450, `stack` 3732:42063).
 *
 * The set binds two primitives and one type style, and every measurement
 * in all four variants falls out of them:
 *
 *   - `Scale/300` (16) — padding on all four sides of an item.
 *   - `Scale/200` (8)  — title-to-caret gap, summary-to-body gap, and
 *                        the gap between two action buttons.
 *   - `Sans/B1/Regular` — 13/20, −0.13px, weight 400, for the title
 *                        *and* the body. Only the colour differs
 *                        (`text/default/b1` vs `text/default/b2`).
 *
 * Which makes the four variant heights arithmetic rather than opinion,
 * and they were checked that way — the item's 1px bottom hairline is the
 * `+ 1` in each:
 *
 *   closed       53 = 16 + 20 + 16 + 1
 *   open        121 = 16 + 20 + 8 + 60 + 16 + 1
 *   open-button 169 = 16 + 20 + 8 + 60 + 16 + 32 + 16 + 1
 *   stack       333 = 4 × 53 + 121
 *
 * The `stack` total is the one that settles a design question the sheet
 * does not answer in words: 4 × 53 leaves no room for a margin between
 * items, so items sit flush, and MUI's 16px expanded gutter is off. See
 * `Accordion.tsx`.
 */

/**
 * Padding inside an accordion item, on all four sides.
 *
 * A named literal rather than a token, for the same reason `Card`'s is
 * (`cardRegions.ts`): the component spacing ladder runs 0, 4, 8, 12, 24,
 * 48, 64, 96, so it skips `Scale/300` entirely. `radius.lg` is also 16,
 * but borrowing a radius for a distance reads as a radius at the call
 * site. Tracked in DESIGNER_QUESTIONS.md #31.
 */
export const ACCORDION_PADDING_PX = 16;

/**
 * `Scale/200`, which the design uses for all three small gaps in the
 * component: title to caret, summary to body, and button to button.
 *
 * The middle one is spent as the summary's `padding-bottom` while the
 * item is open, rather than as a gap on the region or the details' top —
 * see `AccordionSummary.tsx` for why the element that paints hover has to
 * be the one that owns it.
 */
export const ACCORDION_GAP_PX = spacing.component.xs;

/**
 * The hairline under every item. Figma strokes only the bottom edge
 * (`border-b`) — see `Accordion.tsx` for why that is a different model
 * from MUI's, and what it means for the last item in a stack.
 */
export const ACCORDION_BORDER_WIDTH_PX = 1;

/**
 * The caret in the summary row. 16px in every variant, and the only
 * asset the design uses here.
 */
export const EXPAND_ICON_SIZE_PX = 16;

/**
 * `Sans/B1/Regular` — the one type style in the component set, worn by
 * both the summary title and the details body.
 *
 * Set explicitly rather than inherited. The summary's root is a
 * `ButtonBase`, so it renders a native `<button>`, and a native button
 * does not inherit `font-family` or `font-size` from the page — left
 * alone it would come out in the UA's 13.333px system font. MUI styles
 * `Button`'s label from `theme.typography.button` but leaves
 * `AccordionSummary` unstyled, so this is the component's job.
 *
 * Regular weight is what the sheet specifies, including for the title.
 * A summary is distinguished from its body by colour here, not weight —
 * see DESIGNER_QUESTIONS.md #38.
 */
export const accordionType: CSSObject = {
  fontFamily: fontFamilies.product.sans,
  fontWeight: fontWeights.regular,
  fontSize: typography.body.b1.size,
  lineHeight: `${typography.body.b1.leading}px`,
  letterSpacing: `${typography.body.b1.letterSpacing}em`,
};
