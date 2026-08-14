import {
  fontFamilies,
  fontWeights,
  radius,
  spacing,
  typography,
} from '@/src/tokens';

import type { CSSObject } from '@mui/material/styles';
import type { TableSize } from './Table.types';

/**
 * Geometry and type shared by the parts of the table, transcribed from
 * the Figma `table-rows` section (node 3215:52225) — the row component
 * set 3215:43435, the cell set `table-body` 3206:122297, the header cell
 * set `table-header` 3206:122038, and the assembled `table` frame
 * 3223:61898.
 *
 * The whole design falls out of four numbers, and every measurement in
 * every variant was checked against them:
 *
 *   - `Scale/200` (8)  — padding either side of a cell's content.
 *   - `Scale/300` (16) — the row's own inset, left and right.
 *   - `Scale/100` (4)  — the gap and padding inside a sortable header's
 *                        hover tint, and that tint's corner radius.
 *   - three row heights — 48 / 56 / 64, one per size.
 *
 * Which makes the assembled table arithmetic rather than opinion:
 * 3223:61897 is 320 tall for a header and six `small` rows, and
 * 32 + 6 × 48 = 320 exactly. No gap between rows, no padding around the
 * set, and no outer border or radius — a table here is a stack of bands
 * on whatever surface it is dropped onto.
 *
 * ## Where the row's 16px inset goes
 *
 * Onto the first and last cell, added to their own 8. Figma's row is an
 * auto-layout frame with `padding: 0 16` holding cells that carry 8
 * either side, so the leading text lands 24 from the row's edge and
 * adjacent columns are 16 apart. An HTML `<tr>` cannot be padded — the
 * only elements in a table row that take padding are the cells — so the
 * inset is spent on the two cells that touch the edge. Same pixels,
 * different owner.
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
 * Height of the header row — 32, and the same 32 in all three sizes
 * (`Size=small, State=header` 3215:52223, `medium` 3223:59801, `large`
 * 3223:59857 are identical boxes).
 *
 * So `size` does not scale the header. It is a label strip rather than a
 * row of data, and the design holds it at one height while the data
 * breathes.
 */
export const TABLE_HEADER_ROW_HEIGHT_PX = 32;

/** `Scale/200` — padding either side of every cell's content. */
export const TABLE_CELL_PADDING_INLINE_PX = spacing.component.xs;

/**
 * The row's own inset, spent on the first and last cell.
 *
 * A named literal rather than a token, for the reason `Card`'s and
 * `Accordion`'s 16s are: the component spacing ladder runs 0, 4, 8, 12,
 * 24, 48, 64, 96, so it skips `Scale/300` entirely. `radius.lg` is also
 * 16, but borrowing a radius for a distance reads as a radius at the
 * call site.
 */
export const TABLE_EDGE_INSET_PX = 16;

/** The hairline under every row, and under the header. */
export const TABLE_BORDER_WIDTH_PX = 1;

/**
 * `Scale/200` — gap between a cell's leading slot and its text.
 *
 * The design reaches this twice with different maths, and only one of
 * them survives the trip into code. Its icon cell puts a 16px glyph in a
 * 20px instance box and leaves 8 after it, landing the text 36 from the
 * cell's edge; its person cell puts a bare 36px avatar there and leaves
 * 8, landing the text at 52. A bare 16px glyph with this gap lands the
 * text at 32 — 4 short of the icon cell, exact for the avatar. Padding
 * the slot out to 20 would fix the glyph and break the avatar by the
 * same 4. One gap wins, and an instance box's own padding does not
 * travel into a component.
 */
export const TABLE_CELL_GAP_PX = spacing.component.xs;

/**
 * Width of a checkbox column — 32 (8 + a 16px box + 8), from the
 * `checkbox=True` rows, which are exactly 32 wider than their
 * `checkbox=False` twins (1204 against 1172).
 *
 * As the first column it comes out at 48 once the row's inset is added,
 * which is the width MUI reserves for `padding="checkbox"` anyway.
 *
 * It is a floor rather than the finished number, and in practice the
 * column comes out wider: the table sheet draws a 16px box, and the
 * house `Checkbox` is a 24px one with no size axis to shrink it. So the
 * cell contributes its 8 either side, the control keeps its own size,
 * and the column lands at 40 instead of 32. Squaring the two sheets is
 * DESIGNER_QUESTIONS.md #48.
 */
export const TABLE_CHECKBOX_CELL_WIDTH_PX = 32;

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
 * `Sans/B2/Regular` — 12/16, weight 400, worn by two things: a header
 * label, and the second line of a two-line cell.
 *
 * Regular weight in both, including the header. A header is told apart
 * from its data by colour here, not by weight — MUI's `variant="head"`
 * sets `fontWeightMedium` and a 24px leading, and both are overwritten.
 */
export const tableCaptionType: CSSObject = {
  fontFamily: fontFamilies.product.sans,
  fontWeight: fontWeights.regular,
  fontSize: typography.body.b2.size,
  lineHeight: `${typography.body.b2.leading}px`,
  letterSpacing: `${typography.body.b2.letterSpacing}em`,
};
