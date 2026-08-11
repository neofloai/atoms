'use client';

import { CardHeader as MuiCardHeader } from '@mui/material';
import { styled } from '@mui/material/styles';

import { fontWeights, text, typography } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import { cardRegionPadding } from './cardRegions';

import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { CardHeaderTypeMap } from './Card.types';

/**
 * Figma's `text` header, node 3653:30103: `Sans/H6/Medium` over
 * `Sans/B1/Regular`, stacked with `gap: 0` so the two line-heights sit
 * flush. Both rungs are already in the component type ramp.
 */
const titleType = typography.headings.h6;
const descriptionType = typography.body.b1;

/**
 * The title-and-description block at the top of a card. Wraps MUI
 * `CardHeader` and maps one-to-one onto Figma's `text` header — `title`
 * is the 16px line, `subheader` the 13px one under it.
 *
 * ## What this wrapper adds
 *
 * The two type ramps and their colours, plus the padding. MUI's own
 * choices are Material's rather than wrong, but none of them is ours:
 *
 *   - **the title.** MUI renders it at `variant="h5"` — 20px here —
 *     and drops to `body2` (12px) as soon as an `avatar` is present.
 *     Figma says `Sans/H6/Medium`, 16/24 at weight 500, in both cases.
 *     Styled through `.MuiCardHeader-title` rather than through
 *     `slotProps.title`, so the size holds whether or not the header has
 *     an avatar and whether or not the caller passes their own
 *     Typography.
 *   - **the title colour.** Figma leaves this one *unbound* — the title
 *     is raw `#000000` in all four `text` cells, the only colour on the
 *     component that is not a variable. It is drawn here from
 *     `text.default.heading` (`grey/1200`, `#030303`), the token that
 *     slot exists for, which also gives it a dark-mode value that raw
 *     black does not have. Flagged in DESIGNER_QUESTIONS.md #31 rather
 *     than transcribed literally, since a hardcoded black would be
 *     invisible on a dark card.
 *   - **the description colour.** MUI uses `palette.text.secondary`
 *     (`grey/700` light, `grey/200` dark). Figma says
 *     `text/default/b2` — `text.default.caption`, `grey/650` and
 *     `grey/600`. A rung apart in light mode and four rungs apart in
 *     dark, so this is not a rounding difference.
 *   - **the padding.** 16 on all four sides, dropping the top when the
 *     header follows another padded region. See `cardRegions.ts`.
 *
 * ## Why Figma's `info` header is not this component
 *
 * Node 3653:30106 pairs a `Sans/H4` metric with a 32px icon badge, and
 * the badge sits *directly beside* the metric — the row is `gap: 8` with
 * both children `shrink-0`, so they read as one unit at the left edge.
 * MUI's `action` slot is the opposite: `CardHeaderContent` takes
 * `flex: 1 1 auto`, which pushes whatever is in `action` to the far
 * right of the card.
 *
 * Passing the badge as an `action` would therefore put it 250px from the
 * number it belongs to. So the `info` header is built as a composition
 * inside `CardContent` — see the "Metric card" example in
 * `Card.examples.tsx` — and `action` keeps MUI's right-aligned
 * behaviour, which is the correct place for the thing it is actually
 * for: an overflow menu or a close button.
 *
 * @example The `text` header
 * <CardHeader
 *   title="Lizards"
 *   subheader="A widespread group of squamate reptiles, with over 6,000 species."
 * />
 *
 * @example With an overflow menu pushed to the trailing edge
 * <CardHeader
 *   title="Deployment"
 *   subheader="Last run 4 minutes ago"
 *   action={<IconButton appearance="text" aria-label="More"><DotsThreeIcon /></IconButton>}
 * />
 *
 * @example A semantic element, so the title is a real heading
 * <CardHeader component="header" title="Usage" slotProps={{ title: { component: 'h2' } }} />
 *
 * @see Related: Card, CardContent, CardActions
 */
const StyledCardHeader = styled(MuiCardHeader)(({ theme }) => ({
  ...cardRegionPadding,
  '& .MuiCardHeader-title': {
    fontSize: titleType.size,
    fontWeight: fontWeights.medium,
    lineHeight: `${titleType.leading}px`,
    letterSpacing: `${titleType.letterSpacing}em`,
    ...paired(theme, { color: text.default.heading }),
  },
  '& .MuiCardHeader-subheader': {
    fontSize: descriptionType.size,
    fontWeight: fontWeights.regular,
    lineHeight: `${descriptionType.leading}px`,
    letterSpacing: `${descriptionType.letterSpacing}em`,
    ...paired(theme, { color: text.default.caption }),
  },
}));

StyledCardHeader.displayName = 'CardHeader';

/**
 * Cast for the same reason as `Card` — see the note there. Keeps
 * `component="header"` type-checked instead of silently dropped.
 */
export const CardHeader =
  StyledCardHeader as OverridableComponent<CardHeaderTypeMap>;
