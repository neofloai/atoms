'use client';

import * as React from 'react';
import { Accordion as MuiAccordion, accordionClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import { border, surface } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import { ACCORDION_BORDER_WIDTH_PX } from './accordionTokens';

import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { AccordionProps, AccordionTypeMap } from './Accordion.types';

/**
 * One row of a disclosure list: a title that is always visible, and a
 * body that appears when it is expanded. Wraps MUI `Accordion` with the
 * shell the Figma `accordion-list-items` set draws (node 3653:30452) and
 * leaves the three regions inside it to `AccordionSummary`,
 * `AccordionDetails`, and `AccordionActions`.
 *
 * ## The hairline is the whole design
 *
 * There is no card, no radius, no shadow, and no gap between items. An
 * accordion here is a `surface/layers/card-1` band with a single 1px
 * `border/layers/card-1` line along its bottom edge, and a stack of them
 * reads as a list — which is what the component is called in Figma.
 *
 * That bottom-edge model is not MUI's, and the difference is visible.
 * MUI hangs its separator *above* each item, as a `::before` pseudo
 * element at `top: -1`, hides it on `:first-of-type`, and fades it out
 * while the item is expanded. Three consequences, all of them wrong for
 * this design: n items get n−1 rules, the rule between two items would
 * double up with the border below, and expanding an item would erase its
 * own separator. So `::before` is switched off and the border is real.
 *
 * The faithful consequence is that the *last* item in a stack keeps its
 * hairline, so a group ends on a rule rather than on nothing. Figma
 * draws it that way in the `stack` variant, and its 333px total
 * (4 × 53 + 121) leaves no room for it to be otherwise. It reads as
 * intentional for a list; it reads as a stray line for a group of three
 * FAQs. `sx={{ '&:last-of-type': { borderBottom: 'none' } }}` removes it
 * where that is wanted — logged as DESIGNER_QUESTIONS.md #38 rather than
 * decided here.
 *
 * ## What the wrapper corrects in MUI
 *
 * Four values, in the same places `Card` corrects them, and one layout
 * mode:
 *
 *   - **the surface.** `Paper` paints from `palette.background.paper`
 *     (`grey/25` light, `grey/1050` dark in this theme). The design's is
 *     `surface.layers.card1` — `grey/75` and `grey/1000`.
 *   - **the shadow.** `Paper`'s default `elevation` variant sets
 *     `box-shadow` and, in dark mode, a lightening `background-image`.
 *     The design has neither.
 *   - **the corners.** `square` is forced on rather than the radius
 *     being overwritten, because MUI's `:first-of-type` /
 *     `:last-of-type` radius rules are *more specific* than a plain
 *     `borderRadius: 0` and would win no matter where the wrapper's
 *     declaration landed.
 *   - **the disabled fill.** MUI tints a disabled item with
 *     `action.disabledBackground`, a translucent black that reads as a
 *     darker, more active band. The surface is held and the ink greys
 *     instead — `AccordionSummary.tsx` does that half.
 *   - **the gutters.** `disableGutters` is forced on, which is why it is
 *     off the type (`Accordion.types.ts`).
 *
 * ## Where the 8px gap lives
 *
 * On the summary's bottom padding, which moves from 16 to `Scale/200`
 * when the item opens — not on the region, and not on the details' top.
 * Figma's item is one column with `gap: Scale/200` between the header
 * row and the body, and MUI's structure is `summary` then `Collapse >
 * region > children`, so the gap could sit in any of three places. It
 * belongs to the summary because the summary is the element that paints
 * hover: a gap held anywhere else leaves the tint ending flush against
 * the title. See `AccordionSummary.tsx`, which is where that showed up.
 *
 * @example One item, uncontrolled
 * <Accordion>
 *   <AccordionSummary>Shipping and returns</AccordionSummary>
 *   <AccordionDetails>Ships in two business days.</AccordionDetails>
 * </Accordion>
 *
 * @example A stack where only one item is open at a time
 * const [open, setOpen] = React.useState<string | false>('a');
 *
 * <div>
 *   {items.map((item) => (
 *     <Accordion
 *       key={item.id}
 *       expanded={open === item.id}
 *       onChange={(_, isExpanded) => setOpen(isExpanded ? item.id : false)}
 *     >
 *       <AccordionSummary>{item.title}</AccordionSummary>
 *       <AccordionDetails>{item.body}</AccordionDetails>
 *     </Accordion>
 *   ))}
 * </div>
 *
 * @see Related: AccordionSummary, AccordionDetails, AccordionActions, Card, Collapse
 */
const StyledAccordion = styled(MuiAccordion)(({ theme }) => ({
  ...paired(theme, {
    backgroundColor: surface.layers.card1,
    borderBottomColor: border.layers.card1,
  }),
  borderBottomStyle: 'solid',
  borderBottomWidth: ACCORDION_BORDER_WIDTH_PX,
  boxShadow: 'none',
  backgroundImage: 'none',

  // MUI's separator, disabled — see the header comment.
  '&::before': { display: 'none' },

  // Undoes `action.disabledBackground`. Same specificity as MUI's rule,
  // and `styled(MuiAccordion)` merges the wrapper's declarations after
  // MUI's own into one class, so this wins on order.
  [`&.${accordionClasses.disabled}`]: paired(theme, {
    backgroundColor: surface.layers.card1,
  }),
}));

const AccordionBase = React.forwardRef(function Accordion(
  props: AccordionProps,
  ref: React.Ref<HTMLDivElement>
) {
  // Both locked props are passed *after* the spread rather than as
  // defaults. A default would be overridable, and these two are the
  // reason the CSS above can stay short: `square` keeps MUI's
  // `:first-of-type` / `:last-of-type` radius rules from ever applying,
  // and `disableGutters` keeps its 16px expanded margin off. They are
  // absent from `AccordionProps`, so nothing is being shadowed.
  return <StyledAccordion ref={ref} {...props} square disableGutters />;
});

AccordionBase.displayName = 'Accordion';

/**
 * Cast to an `OverridableComponent` for the reason `Card` documents:
 * `forwardRef` alone pins the root at `div` and drops `component`, so
 * `<Accordion component="article">` would render correctly and fail to
 * compile. Restating the type map keeps the root swappable and
 * type-checks the swapped element's own props.
 */
export const Accordion = AccordionBase as OverridableComponent<AccordionTypeMap>;
