import {
  fontFamilies,
  fontWeights,
  radius,
  spacing,
  surface,
  typography,
} from '@/src/tokens';

import type { CSSObject } from '@mui/material/styles';
import type { TableSize } from './Table.types';

/**
 * Geometry and type shared by the parts of the table.
 *
 * Two sheets feed this file. The row heights, the hairline and the sort
 * affordance come from the Product Design System `table-rows` section
 * (node 3215:52225) — the row set 3215:43435, the cell set `table-body`
 * 3206:122297, the header set `table-header` 3206:122038. The cell
 * padding, the header strip and the header's fill were redrawn by the
 * Revamp UI assembled table (node 879:22095), and where the two
 * disagree the newer one wins.
 *
 * The whole design falls out of four numbers, and every measurement in
 * every variant was checked against them:
 *
 *   - `Scale/300` (16) — padding either side of a cell's content.
 *   - `Scale/200` (8)  — the row's own inset on top of that, left and
 *                        right, which lands the edge columns at 24.
 *   - `Scale/100` (4)  — the gap between a cell's glyph and its text,
 *                        between a two-line cell's two lines, and
 *                        inside a sortable header's hover tint.
 *   - three row heights — 48 / 56 / 64, one per size, under a flat 40px
 *                         header.
 *
 * Which makes the assembled table arithmetic rather than opinion:
 * 879:22095 stacks a 40px header on fourteen 56px rows, and every
 * column boundary in it falls on a multiple of those two paddings. No
 * gap between rows, no padding around the set, and no outer border or
 * radius — a table here is a stack of bands on whatever surface it is
 * dropped onto.
 *
 * ## What the 11 September redraw moved
 *
 * Four things, and none of them is a colour on the data:
 *
 *   - **the cell's inline padding doubled**, 8 to 16. Adjacent columns
 *     are now 32 apart where they were 16.
 *   - **the row's inset halved**, 16 to 8, so the two edge columns land
 *     at the same 24 they always did. The air moved inward rather than
 *     outward: the table is no wider, its columns are further apart.
 *   - **the header strip grew**, 32 to 40, and **took a fill**.
 *   - **a two-line cell's two lines separated** by `Scale/100`, where
 *     they used to sit hard against each other on their leadings alone.
 *
 * ## Where the row's inset goes
 *
 * Onto the first and last cell, added to their own 16. Figma's row is
 * an auto-layout frame holding cells that carry their own padding, and
 * its edge cells are drawn 8 wider on the outside — `pl-24` on the
 * first header cell, `pr-24` on the last body cell. An HTML `<tr>`
 * cannot be padded — the only elements in a table row that take padding
 * are the cells — so the inset is spent on the two cells that touch the
 * edge. Same pixels, different owner.
 */

/**
 * Row height, per size. The Figma `Size` axis: small 48, medium 56,
 * large 64.
 *
 * Height rather than vertical padding, because it is the row that is
 * fixed and the content that centres inside it. All three sizes hold
 * the same cell — the `table-body` instances are 200 × 48 in a small
 * row and 200 × 56 in a medium one, with the text's own box unchanged
 * at 20 tall — so nothing about a cell varies with size except how much
 * room it is given.
 */
export const TABLE_ROW_HEIGHT_PX: Record<TableSize, number> = {
  sm: 48,
  md: 56,
  lg: 64,
};

/**
 * Height of the header row — 40, and the same 40 whatever the table's
 * `size` is.
 *
 * `size` does not scale the header. It is a label strip rather than a
 * row of data, and the design holds it at one height while the data
 * breathes — that much is unchanged from the original sheet, where the
 * three `State=header` symbols (3215:52223, 3223:59801, 3223:59857) are
 * identical boxes.
 *
 * What changed is the number. It was 32; the Revamp UI header cell is
 * `Scale/250` above and below a 16px label box, which is 40, and the
 * frame's first row starts at y=40. The label itself did not grow — the
 * strip did, and it now has room for the 32px controls a header cell
 * sometimes holds without them touching the hairline.
 */
export const TABLE_HEADER_ROW_HEIGHT_PX = 40;

/**
 * `Scale/300` — padding either side of every cell's content.
 *
 * A named literal rather than a token, for the reason `Card`'s and
 * `Accordion`'s 16s are: the component spacing ladder runs 0, 4, 8, 12,
 * 24, 48, 64, 96, so it skips `Scale/300` entirely. `radius.lg` is also
 * 16, but borrowing a radius for a distance reads as a radius at the
 * call site.
 *
 * It was `Scale/200` until the Revamp UI redraw. A pair of them is what
 * separates two columns, so doubling this doubled the gutter from 16 to
 * 32 — which is the single most visible thing about the new table, and
 * the reason a column that used to fit its label may now truncate.
 */
export const TABLE_CELL_PADDING_INLINE_PX = 16;

/**
 * The row's own inset, spent on the first and last cell — `Scale/200`.
 *
 * Halved from 16 as the cell padding doubled, which holds the edge
 * columns at the 24 they were already at: the sheet draws `pl-24` on
 * its first header cell and `pr-24` on its last body cell, and 16 + 8
 * is how those are reached from a cell that is otherwise padded 16.
 */
export const TABLE_EDGE_INSET_PX = spacing.component.xs;

/** The hairline under every row, and under the header. */
export const TABLE_BORDER_WIDTH_PX = 1;

/**
 * `Scale/100` — gap between a cell's leading slot and its text.
 *
 * From the `cell-body` component (549:9682), which is the design
 * system's own definition of a cell with a glyph in it: a 16px icon, 4
 * after it, then the label.
 *
 * The assembled frame contradicts it in one column — its first cell is
 * an ad-hoc frame holding a 14px glyph 8 from the text — and the
 * component is followed instead, on the grounds that a component set
 * outranks a page layout for that component's own geometry. Logged as
 * DESIGNER_QUESTIONS.md #62, together with the consequence: `icon`
 * takes any node, so an `Avatar` in that slot now sits 4 from its label
 * where the older sheet drew 8.
 */
export const TABLE_CELL_GAP_PX = spacing.component.xxs;

/**
 * `Scale/100` — between the two lines of a two-line cell.
 *
 * New: the lines used to sit hard against each other, held apart by
 * their leadings alone, on a reading of a 36px group holding a 20px
 * line and a 16px one. The Revamp UI row draws the gap explicitly
 * (`gap-[4px]` on every `Vendor / Invoice #` cell), which makes the
 * pair 40 tall and still centres inside every row height the table has.
 */
export const TABLE_CELL_SECONDARY_GAP_PX = spacing.component.xxs;

/**
 * The glyph in a cell's leading slot — 16.
 *
 * Exported because a caller fills that slot and has to size what goes
 * in it; `<PaperclipIcon size={TABLE_CELL_ICON_PX} />` is the whole of
 * it. The cell does not impose the size, because the slot also takes an
 * `Avatar`, which carries its own.
 */
export const TABLE_CELL_ICON_PX = 16;

/**
 * Width of a checkbox column — 48 (16 + a 16px box + 16).
 *
 * As the first column it comes out at 56 once the row's 8 of inset is
 * added, which is exactly the `cell-body` the Revamp UI frame reserves
 * for its (hidden) selection column: 56 wide with a 16px square at
 * x=24. Two independent readings of the padding agreeing on the edge
 * column is the best confirmation the sheet offers that the 16 and the
 * 8 are the right way round.
 *
 * It is a floor rather than the finished number, and in practice the
 * column comes out wider: the table sheet draws a 16px box, and the
 * house `Checkbox` is a 24px one with no size axis to shrink it. So the
 * cell contributes its 16 either side, the control keeps its own size,
 * and the column lands at 56 instead of 48. Squaring the two sheets is
 * DESIGNER_QUESTIONS.md #48.
 */
export const TABLE_CHECKBOX_CELL_WIDTH_PX = 48;

/**
 * Tracking on the header label — -0.12px, the sheet's own figure.
 *
 * Kept in px rather than converted to the `em` the rest of this file
 * writes, so it can be read back against the sheet without doing the
 * division. See `tableHeaderType`.
 */
export const TABLE_HEADER_LETTER_SPACING_PX = -0.12;

/**
 * The fill behind the header strip — `surface/default/default`, which
 * the sheet binds on every `cell-header` and which resolves to the
 * `#f5f5f3` it draws, exactly.
 *
 * New, and it does two jobs at once. The strip now reads as a strip
 * rather than as a row that happens to be labelled, which is what the
 * mono face started and this finishes. And a pinned header has to be
 * opaque or the rows scroll through it, which the table used to solve
 * by reaching for `surface.layers.card1` only while `stickyHeader` was
 * set — a fill that appeared and disappeared with an unrelated prop.
 * One named fill, always on, covers both.
 */
export const tableHeaderFill = surface.default.default;

/** The sort glyph in a header cell — the house small glyph. */
export const TABLE_SORT_ICON_PX = 16;

/**
 * The tint behind a sortable header's label while it is hovered:
 * 20 tall, `Scale/100` of padding and gap inside it, `Scale/100` radius.
 *
 * Read off `type=hover-right` (3206:122035) and `type=hover-left`
 * (3206:122034) by pixel rather than trusted from the layer names. The
 * two confirm each other: the tint is 69 wide in both, and
 * 4 + 41 (label) + 4 + 16 (glyph) + 4 comes to 69 with the glyph's ink
 * landing where the render puts it, in both orders.
 *
 * The 4px of padding means a sortable column's label sits 12 from the
 * cell's edge where a plain one sits 8. Left as the design draws it —
 * see DESIGNER_QUESTIONS.md #48.
 */
export const TABLE_SORT_TINT_HEIGHT_PX = 20;
export const TABLE_SORT_TINT_PADDING_PX = spacing.component.xxs;
export const TABLE_SORT_TINT_RADIUS_PX = radius.xs;

/**
 * `Sans/B1/Regular` — 13/20, weight 400, for every data cell.
 *
 * Set explicitly rather than inherited, because MUI's `TableCell`
 * already sets `theme.typography.body2` and would otherwise win.
 */
export const tableCellType: CSSObject = {
  fontFamily: fontFamilies.product.sans,
  fontWeight: fontWeights.regular,
  fontSize: typography.body.b1.size,
  lineHeight: `${typography.body.b1.leading}px`,
  letterSpacing: `${typography.body.b1.letterSpacing}em`,
};

/**
 * `Sans/B2/Regular` — 12/16, weight 400, for the second line of a
 * two-line cell.
 *
 * Header labels used to wear this too, and no longer do: see
 * `tableHeaderType`.
 */
export const tableCaptionType: CSSObject = {
  fontFamily: fontFamilies.product.sans,
  fontWeight: fontWeights.regular,
  fontSize: typography.body.b2.size,
  lineHeight: `${typography.body.b2.leading}px`,
  letterSpacing: `${typography.body.b2.letterSpacing}em`,
};

/**
 * The header label — DM Mono Medium, 12/16, tracked -0.12px.
 *
 * From the 11 September sheet (node 1308:88980), and it is the one place
 * in the system that asks for a monospace by name. A header is a label
 * strip rather than a row of data, and this is what now says so: the
 * face changes, where before a header differed from its data only in
 * colour and size. The ink is unchanged at `text/default/b3`, which the
 * sheet confirms (#848280).
 *
 * Three things here are not `typography.body.b2`, which is why this is
 * its own object rather than a spread of `tableCaptionType`:
 *
 *   - **the family.** `fontFamilies.product.mono`, which as of this
 *     change is a real self-hosted DM Mono rather than the system
 *     monospace it used to fall through to.
 *   - **the weight.** Medium, against the Regular the rest of the table
 *     wears. DM Mono's Regular is light enough at 12px that the strip
 *     stopped reading as a heading; Medium is also the top of what DM
 *     Mono ships, so there is no rung above this to drift onto.
 *   - **the tracking.** -0.12px on 12px is -0.01em, which is `b1`'s
 *     tracking rather than `b2`'s 0. Written from the sheet's own
 *     number rather than borrowed from the `b1` slot, because the two
 *     agreeing here is a coincidence of arithmetic and not a shared
 *     decision -- if `b1` retracks, this should not follow.
 *
 * `text-overflow: ellipsis` comes with it: the sheet sets it on the
 * label, and a mono face at 12px runs wider than the sans it replaced,
 * so a header that used to fit its column may no longer. Truncating is
 * what the design asks for, and it is also the only option that does not
 * push the strip off its fixed 32.
 */
export const tableHeaderType: CSSObject = {
  fontFamily: fontFamilies.product.mono,
  fontWeight: fontWeights.medium,
  fontSize: typography.body.b2.size,
  lineHeight: `${typography.body.b2.leading}px`,
  letterSpacing: `${TABLE_HEADER_LETTER_SPACING_PX}px`,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};
