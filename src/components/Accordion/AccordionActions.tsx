'use client';

import { AccordionActions as MuiAccordionActions } from '@mui/material';
import { styled } from '@mui/material/styles';

import { ACCORDION_PADDING_PX } from './accordionTokens';

/**
 * The trailing button row at the bottom of an expanded item — the
 * `open-button` variant of the Figma set (node 3653:30450). Wraps MUI
 * `AccordionActions`.
 *
 * Only the padding changes. Everything else MUI already draws the way
 * the design does:
 *
 *   - `justify-content: flex-end` matches Figma's `justify-end`.
 *   - the 8px between two buttons, which MUI applies as
 *     `& > :not(style) ~ :not(style) { margin-left: 8 }`, is exactly the
 *     `Scale/200` the row specifies. `disableSpacing` still turns it off.
 *   - `align-items: center`, as in the design's row.
 *
 * The padding goes from MUI's uniform 8 to `0 16px 16px`: the sides and
 * bottom join the item's 16px box, and the top is dropped because the
 * details above already ends in 16px of padding — which is the
 * `Scale/300` gap the variant puts between the body and the buttons. Used
 * without a details, the summary's own relaxed bottom padding keeps it
 * 8px clear of the title.
 *
 * The two buttons in the design are a `secondary` and a `primary`, both
 * 32px tall — `<Button size="sm">`. That is the composition, not
 * something this component enforces.
 *
 * ## The leading edge
 *
 * `flex-end` is right for the row the design draws and wrong the moment
 * an item wants one action on each side. Figma does not draw that, so no
 * prop is invented for it, the same call `CardActions` makes: reach for
 * `sx={{ justifyContent: 'space-between' }}`.
 *
 * @example The Figma row
 * <AccordionActions>
 *   <Button variant="secondary" size="sm">Cancel</Button>
 *   <Button size="sm">Save</Button>
 * </AccordionActions>
 *
 * @see Related: Accordion, AccordionSummary, AccordionDetails, Button, CardActions
 */
export const AccordionActions = styled(MuiAccordionActions)({
  padding: `0 ${ACCORDION_PADDING_PX}px ${ACCORDION_PADDING_PX}px`,
});

AccordionActions.displayName = 'AccordionActions';
