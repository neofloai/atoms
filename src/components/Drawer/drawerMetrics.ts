import type { DrawerSize } from './Drawer.types';

/**
 * Geometry for the drawer panel.
 *
 * Unlike most components here, these numbers are not transcribed from a
 * Figma component set — there is no drawer cell in the Product Design
 * System file. They are measured from the Vendor Query shell, which is
 * the app the design was drawn for and the only place a Neoflo drawer
 * ships today: `src/config/vendorQuerySidebar.ts` and
 * `src/config/queryDetail.ts` in `invoice-validator-fe`.
 *
 * Both are real, shipped widths rather than a ladder invented to fill
 * out three t-shirt sizes, which is why the scale stops at three rungs.
 */

/**
 * Width of the hairline on the edge that faces the page.
 *
 * A drawer has no shadow, so this is the whole separation between the
 * panel and the content beside it — see `Drawer.tsx` for why the
 * temporary variant does not need more than that either.
 */
export const DRAWER_BORDER_WIDTH_PX = 1;

/**
 * How wide the panel is, per named `size`. Left and right anchors only;
 * a top or bottom drawer keeps MUI's content-driven height
 * (`Drawer.tsx`).
 *
 *   - `sm` is the nav rail — the expanded sidebar's own 220px.
 *   - `md` is the narrowest a detail sheet reads at, the point below
 *     which the Vendor Query sheet's meta row stops fitting on one
 *     line. The default, because it is the width that holds a form or a
 *     record without swallowing the page behind it.
 *   - `lg` is that sheet as designed, at 520px.
 *
 * The reference also caps its draggable sheet at 720 and folds its rail
 * to 64. Neither is a rung: one is the ceiling of a resize handle, the
 * other a collapsed state. `size` takes a raw number for both.
 */
export const DRAWER_WIDTH_PX: Record<DrawerSize, number> = {
  sm: 220,
  md: 400,
  lg: 520,
};

/**
 * Resolve `size` to pixels, whichever form it arrives in.
 *
 * A number is passed through. It is on the prop rather than left to
 * `slotProps.paper` because the width has to land in two places at once
 * — the panel and the space it reserves — and because a rule written
 * from here is a descendant selector, which outranks the single class a
 * caller's `sx` generates. One prop is the only way both stay in reach.
 */
export function drawerWidth(size: DrawerSize | number): number {
  return typeof size === 'number' ? size : DRAWER_WIDTH_PX[size];
}
