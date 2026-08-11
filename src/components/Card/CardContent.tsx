'use client';

import { CardContent as MuiCardContent } from '@mui/material';
import { styled } from '@mui/material/styles';

import { CARD_PADDING_PX, cardRegionPadding } from './cardRegions';

import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { CardContentTypeMap } from './Card.types';

/**
 * A padded region inside a card, for body content that is not the
 * header. Wraps MUI `CardContent`.
 *
 * Figma's eight cells never need this one — their padded box is a header
 * plus an optional action row, nothing else — so it carries no design of
 * its own. It exists because a card holding anything other than a
 * title and a description still needs the 16px inset, and because the
 * `info` header is built inside it (see `CardHeader.tsx` for why that
 * one is a composition rather than a `CardHeader`).
 *
 * ## What this wrapper adds
 *
 * Two numbers, no props.
 *
 * MUI's padding is already 16 on all four sides, which is `Scale/300`
 * and correct. What it also carries is `&:last-child { padding-bottom:
 * 24 }` — a Material rhythm that pads the *final* region deeper than the
 * rest so a card of pure text has a heavier base. The Neoflo card is
 * symmetric: every side of every region is 16, in all eight Figma cells.
 * So the last-child rule is written back to 16.
 *
 * That is worth stating precisely because it is invisible until it is
 * not: a `Card` holding one `CardContent` measures 8px taller under
 * MUI's default than the same card with a `CardActions` after it, and
 * nothing in the markup suggests why.
 *
 * The second is the shared gutter rule — top padding drops to 0 when
 * this region follows another padded one, so two stacked regions sit
 * 16px apart rather than 32. A `CardContent` that follows `CardMedia`
 * keeps its full padding. See `cardRegions.ts`.
 *
 * @example Body content that is not a header
 * <Card>
 *   <CardHeader title="Storage" />
 *   <CardContent>
 *     <Typography variant="body1">42.1 GB of 100 GB used</Typography>
 *   </CardContent>
 * </Card>
 *
 * @example Text under an image, where the full top padding is kept
 * <Card>
 *   <CardMedia component="img" src="/lizard.jpg" alt="" sx={{ height: 124 }} />
 *   <CardContent>
 *     <Typography variant="body1">Recorded in Queensland, 2026.</Typography>
 *   </CardContent>
 * </Card>
 *
 * @see Related: Card, CardHeader, CardMedia, CardActions
 */
const StyledCardContent = styled(MuiCardContent)({
  ...cardRegionPadding,
  '&:last-child': {
    paddingBottom: CARD_PADDING_PX,
  },
});

StyledCardContent.displayName = 'CardContent';

/**
 * Cast for the same reason as `Card` — see the note there.
 */
export const CardContent =
  StyledCardContent as OverridableComponent<CardContentTypeMap>;
