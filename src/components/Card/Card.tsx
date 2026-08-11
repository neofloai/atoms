'use client';

import { Card as MuiCard } from '@mui/material';
import { styled } from '@mui/material/styles';

import { border, surface } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import { CARD_BORDER_WIDTH_PX, CARD_RADIUS_PX } from './cardRegions';

import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { CardTypeMap } from './Card.types';

/**
 * A bordered surface that groups related content. Wraps MUI `Card` and
 * supplies the shell the design specifies — `surface/layers/card-1`
 * behind a 1px `border/layers/card-1`, corners at 16px, contents clipped
 * to those corners — then leaves what goes inside to `CardHeader`,
 * `CardContent`, `CardMedia`, and `CardActions`.
 *
 * ## What the Figma set actually specifies
 *
 * Node 3648:24947 looks like a component with ten variants and is not.
 * Its two axes are content, not chrome: `Property 1` (`text` / `info`)
 * picks a header pattern, `Property 2` (`display` / `image` / `chart` /
 * `list`) picks what sits under it. Every one of the eight symbols draws
 * the *same* shell. Measured across all eight, the only thing that
 * changes is height, and height follows the content.
 *
 * So the shell is one locked treatment with no variant prop, and the
 * eight cells become composition — which is why this file is short and
 * `Card.examples.tsx` is long. The two header patterns are documented
 * there; `text` maps onto `CardHeader` exactly, `info` is a composition
 * inside `CardContent` (see `CardHeader.tsx` for why it cannot be an
 * `action`).
 *
 * ## Where the padding lives
 *
 * Not here. Figma puts `padding: 16` on an inner box rather than on the
 * shell in every symbol that has a media region, so the image, chart, or
 * list can run edge to edge while the text stays inset. Only the
 * `text=display` cell — the one card with nothing but a header — pads
 * the root, and it measures identically either way.
 *
 * Padding therefore belongs to the regions, and `cardRegions.ts` holds
 * the rule that keeps two stacked regions 16px apart instead of 32.
 *
 * ## What this wrapper adds
 *
 * Three corrections to MUI's defaults, all of them values rather than
 * behaviour:
 *
 *   - **the surface.** MUI paints `Paper` from
 *     `palette.background.paper`, which this theme sets to `grey/25` in
 *     light and `grey/1050` in dark. The design's card is
 *     `surface.layers.card1` — `grey/75` and `grey/1000`. Left alone, a
 *     card would sit a rung off every other card surface in the system
 *     and, in dark mode, read *lighter* than the page it is on.
 *   - **the border.** `Paper`'s outlined variant draws
 *     `palette.divider`, the same token `Divider` had to replace: in
 *     dark mode it is `grey/1000`, exactly the colour of a dark
 *     `card1` — a border that does not render at all. This draws
 *     `border.layers.card1`, the token the design names, which is the
 *     matched edge for that surface in both schemes.
 *   - **the shadow.** `Paper`'s default `elevation` variant sets
 *     `box-shadow: var(--Paper-shadow)` and, in dark mode, a lightening
 *     `background-image` overlay. The design has neither, so both are
 *     overwritten with `none`. `variant`, `elevation`, `raised`, and
 *     `square` are removed from the type rather than left to be
 *     ignored — see `LockedSurfaceProp` in `Card.types.ts`.
 *
 * ## What was deliberately left out
 *
 * There is no clickable card. MUI ships `CardActionArea` for one, and
 * wiring it up would take a hover fill, a pressed fill, and a focus
 * ring — three brand decisions the Figma set does not make. It has no
 * `state` axis at all: no hover cell, no focus cell, no pressed cell,
 * on either header or any region. Inventing them here would put values
 * in code with no designer behind them, the same reason no motion
 * tokens were invented in DESIGNER_QUESTIONS.md #25. Logged as #31; put
 * the action on a `Button` inside `CardActions` until then, which is
 * what all eight Figma cells do.
 *
 * @example A card with a title, a description, and actions
 * <Card>
 *   <CardHeader title="Lizards" subheader="Over 6,000 species." />
 *   <CardActions>
 *     <Button appearance="outline" variant="secondary">Share</Button>
 *     <Button>Learn more</Button>
 *   </CardActions>
 * </Card>
 *
 * @example Media running edge to edge under the text
 * <Card>
 *   <CardHeader title="Lizards" subheader="Over 6,000 species." />
 *   <CardMedia component="img" src="/lizard.jpg" alt="" sx={{ height: 124 }} />
 * </Card>
 *
 * @example A semantic root, since a card is rarely a bare div
 * <Card component="article">…</Card>
 *
 * @see Related: CardHeader, CardContent, CardMedia, CardActions, Button
 */
const StyledCard = styled(MuiCard)(({ theme }) => ({
  ...paired(theme, {
    backgroundColor: surface.layers.card1,
    borderColor: border.layers.card1,
  }),
  borderWidth: CARD_BORDER_WIDTH_PX,
  borderStyle: 'solid',
  borderRadius: CARD_RADIUS_PX,
  boxShadow: 'none',
  backgroundImage: 'none',
}));

StyledCard.displayName = 'Card';

/**
 * Cast to an `OverridableComponent` rather than left as the styled
 * component's inferred type. `styled()` collapses the generic down to
 * its default-root props and drops `component` altogether: without this
 * cast `<Card component="article" />` fails to compile while still
 * rendering an `article` at runtime. Restating the type map keeps the
 * root swappable *and* type-checks the element's own props — the same
 * fix `Divider`, `Skeleton`, and `MenuItem` use.
 */
export const Card = StyledCard as OverridableComponent<CardTypeMap>;
