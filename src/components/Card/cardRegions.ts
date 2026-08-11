import { radius } from '@/src/tokens';

import type { CSSObject } from '@mui/material/styles';

/**
 * Geometry shared by the card shell and its regions, transcribed from
 * the Figma Card component set (node 3648:24947 — the `card` frame
 * 3653:30109 and its eight symbols).
 *
 * Figma binds one primitive, `Scale/300` (16px), to three different
 * things on this component: the shell's corner radius, the padding
 * inside every region, and the gap between two stacked regions. Only
 * the radius has a token in this repo — `radius.lg` is the same 16.
 *
 * The padding does not, and cannot: the *component* spacing ladder runs
 * 0, 4, 8, 12, 24, 48, 64, 96 (`spacing.component`), so it skips
 * `Scale/300` entirely — 12 then 24, nothing between. Borrowing
 * `radius.lg` for a distance would read as a radius at every call site,
 * so the padding stays a named literal here instead. Same shape of gap
 * as the Chip's raw `6`; see DESIGNER_QUESTIONS.md #31.
 */
export const CARD_PADDING_PX = 16;

/** Corner radius of the card shell. `Scale/300` again, the same 16px. */
export const CARD_RADIUS_PX = radius.lg;

/**
 * Width of the card's hairline border. Figma strokes the shell at 1px
 * (`border border-solid`) with no shadow behind it, so a card reads as
 * an edge rather than a lift.
 */
export const CARD_BORDER_WIDTH_PX = 1;

/**
 * Symmetric padding for a card region, plus the rule that collapses two
 * stacked regions' facing padding into a single gutter.
 *
 * Figma models the padded part of a card as *one* box: `padding: 16`
 * with `gap: 16` between the header block and the action row (node
 * 3653:30108). MUI models the same thing as siblings that each bring
 * their own padding, which would put 32px between a header and the
 * actions below it — and 24px under a trailing `CardContent`, from
 * Material's own `&:last-child` rhythm. Neither number is in the
 * design.
 *
 * So a region that directly follows another *padded* region drops its
 * top padding, and the previous region's bottom padding becomes the
 * 16px gutter. Every stack of regions then measures the same as the
 * Figma frame: 16 outside, 16 between.
 *
 * The selector names the three padded regions explicitly rather than
 * using `&:not(:first-child)`, because a region that follows
 * `CardMedia` has to keep its full top padding — text butting straight
 * up against the top edge of an image is the bug that shortcut would
 * ship.
 */
export const cardRegionPadding: CSSObject = {
  padding: CARD_PADDING_PX,
  '.MuiCardHeader-root + &, .MuiCardContent-root + &, .MuiCardActions-root + &':
    {
      paddingTop: 0,
    },
};
