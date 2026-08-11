'use client';

import { CardActions as MuiCardActions } from '@mui/material';
import { styled } from '@mui/material/styles';

import { cardRegionPadding } from './cardRegions';

/**
 * The trailing row of actions in a card. Wraps MUI `CardActions`.
 *
 * Present in all four of Figma's `text` cells (nodes 3653:30108,
 * 3653:30107, 3653:30105 and the `display` cell), always as the same
 * shape: two buttons at 32px, pushed to the trailing edge, 8px apart.
 * None of the `info` cells has one.
 *
 * ## What this wrapper adds
 *
 * Two properties, no props.
 *
 *   - **alignment.** Figma wraps the row in a column set to `items-end`,
 *     which puts the buttons at the trailing edge. MUI leaves
 *     `justify-content` at its initial `flex-start`, so an unstyled
 *     `CardActions` sits at the leading edge — the mirror image of the
 *     design. Set to `flex-end` here.
 *   - **padding.** MUI's is 8 on all sides, a Material number chosen to
 *     let a `text` button's own padding reach the card edge. Figma's
 *     action row lives in the same 16px box as the header, so this uses
 *     16 with the top dropped when it follows another padded region —
 *     which puts exactly 16 between the description and the buttons. See
 *     `cardRegions.ts`.
 *
 * MUI's 8px gap between children is kept as it is: it comes from
 * `& > :not(style) ~ :not(style) { margin-left: 8 }`, and 8 is what
 * Figma specifies (`Scale/200`). `disableSpacing` still turns it off.
 *
 * ## A note on the leading edge
 *
 * `flex-end` is right for the two-button row the design draws, and wrong
 * the moment a card needs one action on each side — a "Learn more" link
 * left, a "Dismiss" right. Figma does not draw that card, so no prop is
 * invented for it. Reach for `sx={{ justifyContent: 'space-between' }}`,
 * or put a `Box sx={{ flex: 1 }}` between the two children.
 *
 * @example The Figma row: secondary then primary, trailing edge
 * <CardActions>
 *   <Button appearance="outline" variant="secondary">Share</Button>
 *   <Button>Learn more</Button>
 * </CardActions>
 *
 * @example One action per edge, which the design does not cover
 * <CardActions sx={{ justifyContent: 'space-between' }}>
 *   <Button appearance="text">Learn more</Button>
 *   <Button variant="secondary">Dismiss</Button>
 * </CardActions>
 *
 * @see Related: Card, CardHeader, CardContent, Button
 */
export const CardActions = styled(MuiCardActions)({
  ...cardRegionPadding,
  justifyContent: 'flex-end',
});

CardActions.displayName = 'CardActions';
