import { spacing, typography } from '@/src/tokens';

/**
 * Geometry shared by the filter panel and its parts, in pixels.
 *
 * The panel is a fixed size in both axes on purpose. Its two columns
 * hold unrelated content — a category rail that never changes length and
 * a pane whose height depends on how many options the active category
 * has — so letting either drive the box makes the panel jump every time
 * a category is picked, and a panel anchored under a button jumps
 * *upwards* into the pointer. Fixing both dimensions and scrolling the
 * option list instead is what keeps the surface still.
 */

/** Width of the category rail down the left edge. */
export const FILTER_RAIL_WIDTH_PX = 234;

/** Width of the option pane beside it. */
export const FILTER_PANE_WIDTH_PX = 360;

/** Overall panel width — the two columns, edge to edge. */
export const FILTER_WIDTH_PX = FILTER_RAIL_WIDTH_PX + FILTER_PANE_WIDTH_PX;

/**
 * Height of the title bar at the top and of the bulk-action bar at the
 * foot of the pane. One number for both, so the panel reads as a
 * symmetric frame around its body.
 */
export const FILTER_BAR_HEIGHT_PX = 48;

/** Height of the body between those two bars. */
export const FILTER_BODY_HEIGHT_PX = 380;

/** Height of one rail row and of one option row. */
export const FILTER_ROW_HEIGHT_PX = 32;

/**
 * Inset from the panel edge that every region shares — the rail rows,
 * the search field, the option list, and both bars.
 *
 * A literal rather than a token: the component spacing ladder runs
 * 4/8/12/24 and has no 16 on it, the same gap `Card`'s padding falls
 * into. It is `Scale/300` in Figma, which `radius.lg` also reads from,
 * but a radius token has no business setting padding.
 */
export const FILTER_INSET_PX = 16;

/**
 * Gap between the search field and the list under it, and between the
 * rail's top edge and its first row.
 */
export const FILTER_GAP_PX = spacing.component.sm;

/**
 * Every label in the panel except the title: rail rows, option rows, and
 * the three bulk actions. `B1` throughout — the panel is dense enough
 * that a second body size would read as an accident.
 */
export const filterLabelType = typography.body.b1;

/** The title in the top bar. */
export const filterTitleType = typography.headings.h6;
