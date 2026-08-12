'use client';

import { AccordionDetails as MuiAccordionDetails } from '@mui/material';
import { styled } from '@mui/material/styles';

import { text } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';
import { ACCORDION_PADDING_PX, accordionType } from './accordionTokens';

/**
 * The body an accordion reveals. Wraps MUI `AccordionDetails`.
 *
 * Two things the design specifies and MUI leaves to the caller:
 *
 *   - **the type.** 13/20 regular in `text/default/b2` — the same rung
 *     as the summary's title, a step lighter in colour. MUI's details is
 *     an unstyled `div` that inherits whatever the page gives it, which
 *     in this theme is neither. Setting it here means a plain string is
 *     already right: `<AccordionDetails>Ships in two days.</...>` needs
 *     no `Typography` around it.
 *   - **the padding.** `0 16px 16px`, not MUI's `8px 16px 16px`. The 8
 *     has not gone anywhere — it moved up to the summary, whose bottom
 *     padding relaxes to `Scale/200` when the item opens. That keeps the
 *     gap on the element that paints hover, and means the gap is there
 *     whichever part comes first, including an `AccordionActions` with no
 *     details above it. See `AccordionSummary.tsx`.
 *
 * The 16px bottom padding does double duty, and deliberately: on the
 * last part in an item it is the item's bottom inset, and when an
 * `AccordionActions` follows it is the `Scale/300` gap the
 * `open-button` variant puts between the body and the buttons (node
 * 3653:30450). One value, both jobs, no `:last-child` rule.
 *
 * Anything richer than text composes normally — the colour is set on
 * this element, so a nested component with its own colour keeps it.
 *
 * @example
 * <AccordionDetails>
 *   Orders placed before 2pm ship the same day.
 * </AccordionDetails>
 *
 * @see Related: Accordion, AccordionSummary, AccordionActions
 */
export const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  ...accordionType,
  padding: `0 ${ACCORDION_PADDING_PX}px ${ACCORDION_PADDING_PX}px`,
  ...paired(theme, { color: text.default.caption }),
}));

AccordionDetails.displayName = 'AccordionDetails';
