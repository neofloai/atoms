import {
  fontFamilies,
  fontWeights,
  radius,
  spacing,
  typography,
} from '@/src/tokens';

import { selectorInsetPx } from '../_shared/selectorStyles';
import {
  TABLE_CELL_PADDING_INLINE_PX,
  TABLE_EDGE_INSET_PX,
  TABLE_HEADER_ROW_HEIGHT_PX,
  TABLE_ROW_HEIGHT_PX,
  tableCaptionType,
} from '../Table/tableTokens';

import type { CSSObject } from '@mui/material/styles';

/**
 * Geometry for the data grid, from the same Figma section as the table
 * (`table-rows`, node 3215:52225).
 *
 * The numbers the two components share are imported from
 * `tableTokens.ts` rather than measured again, and that is the point: a
 * grid and a table render the same design. A row is 48 / 56 / 64, the
 * header strip is 32, a cell is padded 8 either side with the row's 16
 * spent on the two that touch the edge, the hairline is 1px, and the
 * type is `Sans/B1/Regular` over `Sans/B2/Regular`. If one of those ever
 * moves it moves for both, which is what a single source is for.
 *
 * What is measured here is the three pieces the plain table left alone
 * because they belong to a grid: the pagination strip under the rows,
 * the bar a loading row draws, and the footer band that holds them.
 */

/**
 * Row height per size, and the header's flat 32.
 *
 * Re-exported under grid names because a caller sizing the box around a
 * grid needs them — `height: 32 + rows * DATA_GRID_ROW_HEIGHT_PX.sm` —
 * and should not have to import a table constant to size a grid. Same
 * objects, so the two can never drift.
 */
export const DATA_GRID_ROW_HEIGHT_PX = TABLE_ROW_HEIGHT_PX;
export const DATA_GRID_HEADER_HEIGHT_PX = TABLE_HEADER_ROW_HEIGHT_PX;

/**
 * `Sans/B2/Regular` — 12/16, for a header label and the footer's count.
 * The table's own, unchanged.
 */
export const dataGridCaptionType = tableCaptionType;

/**
 * `Sans/B1/Regular` — 13, weight 400, for every data cell.
 *
 * The one type slot that is not simply `tableCellType`, and the leading
 * is why: the grid centres a cell's single line by setting
 * `line-height` to the row's height, so a 20px leading here would drop
 * the text to the top of a 48px row. The design's 20 is still the
 * spacing the cell is drawn on — it is just enforced by the row rather
 * than by the cell — so this carries the size, family, weight and
 * tracking, and leaves the leading to the grid.
 */
export const dataGridCellType: CSSObject = {
  fontFamily: fontFamilies.product.sans,
  fontWeight: fontWeights.regular,
  fontSize: typography.body.b1.size,
  letterSpacing: `${typography.body.b1.letterSpacing}em`,
};

/**
 * How far a cell's content sits from the grid's own edge — 24, the same
 * `8 + 16` the table lands on.
 *
 * Written as `calc` rather than a number because in a grid that edge is
 * conditional. `--DataGrid-hasScrollX` is 0 or 1, set on the root by the
 * grid's own measuring pass, so the 16 is added only while the columns
 * fit. Once they do not, the first and last column are against a
 * *viewport* edge that scrolls rather than the grid's edge, and an inset
 * there would slide away from the thing it was insetting from.
 */
export const DATA_GRID_EDGE_INSET_CALC = `calc(${TABLE_CELL_PADDING_INLINE_PX}px + (1 - var(--DataGrid-hasScrollX, 0)) * ${TABLE_EDGE_INSET_PX}px)`;

/**
 * The bar a cell draws while its row is still loading — 20 tall, 4
 * radius, `surface/primary/subtle`.
 *
 * Measured off `item=loading, size=small` (3223:61894) at 1:1: the bars
 * run y=46..65 inside a row spanning 32..79, so 14 above and 14 below a
 * 20px bar in a 48px row. Horizontally they fill the cell's content box
 * exactly — the first starts at x=24, and consecutive bars are 16 apart,
 * the same `8 + 16` inset and the same pair of 8s between columns that
 * the data rows use.
 *
 * The tint is the one place this parts company with `Skeleton`, which
 * paints a translucent grey so it can sit on any surface. This one is a
 * named solid on the primary scale, because that is what the design
 * draws.
 */
export const DATA_GRID_SKELETON_BAR_HEIGHT_PX = 20;
export const DATA_GRID_SKELETON_BAR_RADIUS_PX = radius.xs;

/**
 * The pagination strip: a 32px control row, `Scale/100` between the
 * buttons and `Scale/200` between the label and the first of them.
 *
 * From `table-footer-navigation` (3206:122298). The three states are 32
 * tall and differ only in how many buttons they hold — `state=first`
 * omits the jump-to-start, so it is 213 wide against 249 for `middle`
 * and `last`. Inside the group the instances sit at x=0, 36 and 72,
 * which is a 32px control with 4 between; the label ends at 137 and the
 * group starts at 145.
 */
export const DATA_GRID_FOOTER_CONTROL_GAP_PX = spacing.component.xxs;
export const DATA_GRID_FOOTER_LABEL_GAP_PX = spacing.component.xs;

/**
 * Height of the footer band — 48: the 32px control row with `Scale/200`
 * above and below it.
 *
 * The band is not drawn in Figma, only its contents, so the two 8s are
 * this component's reading rather than a measurement. They are the
 * smallest padding that keeps a 32px control off the hairline above it,
 * and they make the footer exactly as tall as an `sm` row, which is the
 * shape the rest of the design is built from. See DESIGNER_QUESTIONS.md
 * #49.
 */
export const DATA_GRID_FOOTER_HEIGHT_PX = 48;

/**
 * How far the selection checkbox is pulled back onto the edge inset — 8,
 * which is the padding the control carries around its own 16px box.
 *
 * `Checkbox` ships a 32px round target (`SELECTOR_TARGET_SIZE_PX`), the
 * same box as the `sm` `IconButton` in the footer and exactly the height
 * of the header strip, so the grid has nothing to say about the halo any
 * more — it used to set the padding itself, back when the control was a
 * 24px glyph with MUI's 9 around it.
 *
 * What is still the grid's business is where the *glyph* starts. Left
 * alone, the control's box would begin at the 24px inset and the box
 * inside it 8 further in; pulling the whole control back by its own
 * padding lands the glyph on the inset instead, in line with the column
 * of cells below it. Derived rather than written down, so it follows the
 * control if either number moves.
 */
export const DATA_GRID_CHECKBOX_INSET_PULL_PX = selectorInsetPx('md');
