import { radius, spacing } from '@/src/tokens';

/**
 * Geometry shared by the dialog shell and the three regions inside it,
 * transcribed from the Figma modal set (node 3420:3360 — the assembled
 * `modal` symbol 3500:30638, plus the `modal-title` component set
 * 3500:30051 and `modal-footer` 3500:30055 beside it).
 *
 * Figma calls the component **modal**. This wraps MUI `Dialog`, which is
 * MUI's name for the same thing (its `Modal` is the unstyled backdrop +
 * focus trap underneath), so the Neoflo name follows MUI's.
 *
 * ## The panel is Card's shell
 *
 * Not a coincidence and not a copy: `surface/layers/card-1` behind a 1px
 * `border/layers/card-1` with corners at `Scale/300` is the same three
 * values node 3648:24947 draws, which is why `Dialog.tsx` reads the same
 * tokens `Card.tsx` does rather than introducing a colour of its own.
 *
 * ## The 16px problem, again
 *
 * Figma binds `Scale/300` (16px) to the block padding of both the content
 * region and the footer. The *component* spacing ladder skips it —
 * `spacing.component` runs 0, 4, 8, 12, 24, 48, 64, 96, so there is 12
 * then 24 and nothing between. `radius.lg` is the same 16, but borrowing a
 * radius for a distance reads as a radius at the call site.
 *
 * So it stays a named literal here, exactly as `CARD_PADDING_PX` does in
 * `cardRegions.ts` for the same rung and the same reason. Two components
 * now want it; see DESIGNER_QUESTIONS.md #44.
 */
export const DIALOG_PADDING_BLOCK_PX = 16;

/**
 * Inset from the panel's left and right edges — `Scale/400`, constant
 * across the title, the content, and the footer, so the three regions
 * share one gutter.
 */
export const DIALOG_PADDING_INLINE_PX = spacing.component.md;

/**
 * The title's own block padding. Figma opens the panel with `Scale/400`
 * above the title and closes with `Scale/200` below it (node 3500:30050),
 * which is *not* the symmetric 16 the other two regions use — the extra
 * 8px at the top gives the heading room the content does not need, and the
 * tighter 8px at the bottom leaves the title and the content it
 * introduces reading as one block.
 *
 * Together with the content region's own 16px top, that puts 24px between
 * a subtitle and the first field under it.
 */
export const DIALOG_TITLE_PADDING_TOP_PX = spacing.component.md;
export const DIALOG_TITLE_PADDING_BOTTOM_PX = spacing.component.xs;

/** Corner radius of the panel. `Scale/300` again, the same 16px. */
export const DIALOG_RADIUS_PX = radius.lg;

/**
 * Width of the hairline around the panel and of the rule above the
 * footer. Figma strokes the panel at 1px with no shadow behind it, so a
 * dialog reads as an edge rather than a lift — see `Dialog.tsx` for why
 * that survives here and what carries the separation instead.
 */
export const DIALOG_BORDER_WIDTH_PX = 1;

/**
 * Gap between two children of the footer's action group — `Scale/100`,
 * half the 8px `CardActions` uses.
 *
 * The 4px is right because of what sits on either side of it: Figma's
 * `Cancel` is a `text` button, and `Button` gives that appearance
 * `Scale/0` on the inline axis so its label sits flush with its box. 8px
 * between a flush label and a filled button's edge reads as 8px of
 * nothing; 4px reads as a pair.
 */
export const DIALOG_ACTIONS_GAP_PX = spacing.component.xxs;

/**
 * The optional icon badge above a dialog title, and the glyph inside it
 * (node 3500:30048). Figma instances the `button-icon` component at
 * `size=large` for the box, which is `IconButton`'s own `lg` — 44px with
 * a 24px glyph — so the two agree by construction.
 */
export const DIALOG_TITLE_ICON_SIZE_PX = 44;
export const DIALOG_TITLE_ICON_GLYPH_PX = 24;

/**
 * Gap between the icon badge and the title under it — `Scale/200`. The
 * title and subtitle themselves sit flush (`Scale/0`), so their two
 * line-heights do the spacing, the same way `CardHeader` stacks its pair.
 */
export const DIALOG_TITLE_GAP_PX = spacing.component.xs;
