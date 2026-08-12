'use client';

import * as React from 'react';
import {
  AccordionSummary as MuiAccordionSummary,
  accordionSummaryClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { CaretDownIcon } from '@/src/icons';
import { border, icon, surface, text } from '@/src/tokens';

import { paired, pairedFocusRing } from '../_shared/actionStyles';
import {
  ACCORDION_GAP_PX,
  ACCORDION_PADDING_PX,
  EXPAND_ICON_SIZE_PX,
  accordionType,
} from './accordionTokens';

import type { ExtendButtonBase } from '@mui/material';
import type {
  AccordionSummaryProps,
  AccordionSummaryTypeMap,
} from './Accordion.types';

/**
 * The header row of an accordion item: the title, the caret, and the
 * button that toggles the whole thing. Wraps MUI `AccordionSummary`.
 *
 * ## The row, transcribed
 *
 * 16px padding all round, the title at 13/20 regular in
 * `text/default/b1`, `Scale/200` between the title and a 16px caret in
 * `icon/default/b1`. A closed item is therefore 16 + 20 + 16 + 1 = 53px,
 * which is the design's number.
 *
 * Getting there means overwriting most of what MUI puts here, because
 * `AccordionSummary` is one of the most Material-flavoured components in
 * the library: a 48px floor that rises to 64px when expanded, 12px
 * margins on the content that grow to 20px, `padding: 0 16px`, and a
 * translucent `action.focus` wash on keyboard focus. None of that is in
 * the design. What survives untouched is all of the behaviour — the
 * click handler from `AccordionContext`, `aria-expanded`, the
 * `disabled` plumbing, and the caret's rotation.
 *
 * ## Two glyphs, one asset
 *
 * The design draws `CaretDown` closed and `CaretUp` open, and MUI
 * animates one icon by rotating it 180°. Those agree exactly rather than
 * approximately: Phosphor's two paths are vertical mirrors of each other
 * about the 256-unit box — `CaretDown`'s apex sits at y=164.69 and
 * `CaretUp`'s at y=91.31, and 256 − 164.69 = 91.31. A rotated
 * `CaretDown` *is* `CaretUp`, to the pixel, so one asset covers both
 * cells and the transition between them is a rotation rather than a
 * swap.
 *
 * `expandIcon` therefore defaults to a 16px `CaretDown` — a default
 * value, not a new prop. `expandIcon={null}` still removes the caret,
 * because a JS default only fills in for `undefined` and MUI renders the
 * wrapper on truthiness.
 *
 * ## The bottom padding is the disclosure gap
 *
 * The design puts 16px under the title when the item is closed and 8px
 * when it is open — the item's bottom inset in one state, the gap to the
 * body in the other. Both are this element's `padding-bottom`, moving
 * from 16 to `Scale/200` on expand, which lands a closed item on 53px
 * and an open one on 121px: the sheet's numbers.
 *
 * It is deliberately 8 rather than 0. The first cut of this file put the
 * gap on the region below and dropped this padding to nothing, which is
 * arithmetically identical and looks wrong the moment the row is
 * hovered: the tint is painted on the summary's box, so it ended flush
 * against the title's descenders and read as a clipped band, and the box
 * lost a full 16px instead of 8. Keeping the 8px here means the fill
 * always has breathing room under the title, and the gap belongs to the
 * summary in both states rather than to whatever happens to come next —
 * an `AccordionActions` with no details above it is spaced correctly for
 * the same reason.
 *
 * The 8px that remains is animated on the same
 * `transitions.duration.shortest` MUI already uses for this component,
 * so it reads as part of the disclosure rather than as a separate
 * movement, and `background-color` is restated in the same declaration
 * because a bare `transition` would otherwise replace MUI's and make the
 * hover fill snap. Nothing about the row moves at rest: the title's
 * position is set by the top padding, which never changes.
 *
 * ## The four states the sheet does not draw
 *
 * The component set has `closed` and `open` cells and no hover, pressed,
 * focus, or disabled cell — but this is a button, so all four exist
 * whether or not they are drawn. Composed from the house ladders:
 *
 *   - **hover** `surface/layers/card 2`, one rung above the item's own
 *     `card 1`, and **pressed** `card 3`, one rung above that. The same
 *     two rungs `ToggleButton` uses, and the same ladder `MenuItem`
 *     walks one step further along.
 *   - **focus-visible** the house 3px ring in
 *     `border/default/defaultPressed`, plus hover's fill — the pattern
 *     every action control here follows. Drawn *inset*, which is new:
 *     the summary spans the item edge to edge, so an outer ring has
 *     nowhere to go but on top of the next item's hairline. See
 *     `FocusRingPlacement` in `_shared/actionStyles.ts`.
 *   - **disabled** `text/disabled/default` ink at full opacity, instead
 *     of MUI's 38% fade of the whole row. Every other disabled control
 *     in this system stays legible-but-inert, and the caret inherits it
 *     through `currentColor`.
 *
 * @example The default row
 * <AccordionSummary>Shipping and returns</AccordionSummary>
 *
 * @example A real heading, which a page with several of these wants
 * <Accordion slots={{ heading: 'h2' }}>
 *   <AccordionSummary>Shipping and returns</AccordionSummary>
 *   …
 * </Accordion>
 *
 * @example No caret, and a trailing count instead
 * <AccordionSummary expandIcon={null}>
 *   <span style={{ flex: 1 }}>Attachments</span>
 *   <Chip size="sm" label="3" />
 * </AccordionSummary>
 *
 * @see Related: Accordion, AccordionDetails, AccordionActions
 */
const StyledAccordionSummary = styled(MuiAccordionSummary)(({ theme }) => ({
  ...accordionType,
  padding: ACCORDION_PADDING_PX,
  gap: ACCORDION_GAP_PX,
  // MUI floors the row at 48px — 4px taller than the design's closed
  // item on its own, before the padding is counted.
  minHeight: 0,
  ...paired(theme, { color: text.default.body }),
  transition: theme.transitions.create(
    ['padding-bottom', 'background-color'],
    { duration: theme.transitions.duration.shortest }
  ),
  '@media (prefers-reduced-motion: reduce)': { transition: 'none' },

  '&:hover': paired(theme, { backgroundColor: surface.layers.card2 }),
  '&:active': paired(theme, { backgroundColor: surface.layers.card3 }),
  [`&.${accordionSummaryClasses.focusVisible}`]: pairedFocusRing(
    theme,
    { backgroundColor: surface.layers.card2 },
    border.default.defaultPressed,
    'inset'
  ),

  [`&.${accordionSummaryClasses.expanded}`]: {
    paddingBottom: ACCORDION_GAP_PX,
  },

  [`&.${accordionSummaryClasses.disabled}`]: {
    opacity: 1,
    ...paired(theme, { color: text.disabled.default }),
  },

  // MUI's content carries 12px vertical margins that grow to 20px when
  // expanded, on top of the row's own padding. The design's spacing is
  // all padding, so the margins go.
  [`& .${accordionSummaryClasses.content}`]: {
    margin: 0,
    // Figma gives the title `word-break: break-word` over a `min-width`
    // floor, so a long title wraps inside the row instead of pushing the
    // caret out of it.
    minWidth: 0,
    wordBreak: 'break-word',
    [`&.${accordionSummaryClasses.expanded}`]: { margin: 0 },
  },

  // MUI paints the caret from `palette.action.active`; the design names
  // `icon/default/b1`, the same value as the title. `flex-shrink` is
  // Figma's `shrink-0` — without it a wrapping title squashes the glyph.
  [`& .${accordionSummaryClasses.expandIconWrapper}`]: {
    flexShrink: 0,
    ...paired(theme, { color: icon.default.body }),
  },
}));

const AccordionSummaryBase = React.forwardRef(function AccordionSummary(
  {
    expandIcon = <CaretDownIcon size={EXPAND_ICON_SIZE_PX} />,
    ...rest
  }: AccordionSummaryProps,
  ref: React.Ref<HTMLDivElement>
) {
  return (
    <StyledAccordionSummary ref={ref} expandIcon={expandIcon} {...rest} />
  );
});

AccordionSummaryBase.displayName = 'AccordionSummary';

/**
 * Typed as `ExtendButtonBase` — MUI's own declaration shape for this
 * component — so the root stays polymorphic and `ButtonBase`'s props
 * survive the wrapper. A plain `forwardRef` would pin the root at
 * `button` and drop `component`, which matters for the one composition
 * that needs it: a summary with its own interactive control inside
 * cannot legally be a `<button>`.
 */
export const AccordionSummary =
  AccordionSummaryBase as ExtendButtonBase<AccordionSummaryTypeMap>;
