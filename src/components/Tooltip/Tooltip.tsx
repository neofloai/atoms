'use client';

import { Tooltip as MuiTooltip, tooltipClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import {
  elevation,
  fontWeights,
  radius,
  spacing,
  surface,
  text,
  typography,
} from '@/src/tokens';

import { paired } from '../_shared/actionStyles';

import type { TooltipProps } from './Tooltip.types';

/**
 * The bubble's text style, read off node 3223:54060: 12px on a 20px
 * leading, 0.48px tracking, Neue Haas Grotesk 55 Roman (regular).
 *
 * Only the size sits cleanly on the exported type ladder.
 * `typography.body.b2` is the system's single 12px rung, but it carries
 * a 16px leading and zero tracking; the sheet's 20px leading belongs to
 * `body.b1`, and no slot anywhere carries positive tracking of this
 * size. The sheet wins over the ladder for this component's own text —
 * the same precedent `Card`'s radius follows — and the mismatch is
 * DESIGNER_QUESTIONS.md #34: a 12/20 slot may simply be missing from
 * the exported text styles. Over a four-line tooltip the difference is
 * 16px of height, so it is not a rounding question.
 */
const BUBBLE_TYPE = {
  size: typography.body.b2.size,
  leading: typography.body.b1.leading,
  /** Not on the ladder. 0.48px at 12px, straight off the sheet. */
  letterSpacing: 0.04,
} as const;

/**
 * 324px — the sheet's frame width (node 3223:54059): a 300px text
 * column inside the 12px side padding. MUI's own default `maxWidth` is
 * 300 *including* padding, which would narrow the designed column by
 * 24px, so this is derived rather than inherited.
 */
const MAX_WIDTH = 300 + 2 * spacing.component.sm;

/**
 * Width of the tip, from the sheet's 12x8 `tip` asset.
 *
 * MUI builds its arrow out of `em`: the slot is `1em` wide by `0.71em`
 * tall (`1 / sqrt(2)`, so a square rotated 45deg fills it), and the
 * negative margins that tuck it under the bubble — plus the swapped
 * width/height for left and right placements — are all expressed in
 * the same unit. Setting the slot's `font-size` therefore rescales the
 * whole construction coherently, which is why this is a `fontSize`
 * below rather than a `width`. It lands at 12x8.52 against the sheet's
 * 12x8; pinning the height to 8 exactly would mean hand-writing the
 * four placement offsets, so the width is matched and MUI keeps its
 * derivation. See DESIGNER_QUESTIONS.md #34.
 */
const ARROW_WIDTH = spacing.component.sm;

/**
 * MUI forwards a `Tooltip`'s `className` to `children` — the trigger —
 * and renders the bubble through a portal, so the bubble is never a
 * descendant of anything a wrapper can put a class on. Routing the
 * generated class to `classes.popper` instead is MUI's own documented
 * customisation recipe, and it is what makes the descendant selectors
 * below resolve. Any `classes.popper` the caller passes is preserved
 * alongside it.
 */
function TooltipBase({ arrow = true, className, classes, ...rest }: TooltipProps) {
  return (
    <MuiTooltip
      {...rest}
      arrow={arrow}
      classes={{
        ...classes,
        popper: [classes?.popper, className].filter(Boolean).join(' '),
      }}
    />
  );
}

TooltipBase.displayName = 'TooltipBase';

/**
 * Branded tooltip. Wraps MUI `Tooltip` with the bubble from the Product
 * Design System Figma (node 3223:54057): an inverse `card 6` surface,
 * 8px corners, 8x12 padding, a 300px text column, and the 12px tip.
 *
 * Everything else is MUI's. Positioning is Popper's, including the flip
 * and shift that move a tooltip back on screen near an edge; the six
 * `tipPosition` variants on the sheet are `placement="top"` /
 * `"bottom"` with Popper's own arrow offset, and MUI's other six
 * placements (`top-start`, `left`, and so on) keep working even though
 * the sheet does not draw them. Hover, focus, and long-press triggers,
 * the `enterDelay` / `leaveDelay` timing, the hysteresis that skips the
 * delay between neighbouring tooltips, `followCursor`, the Grow
 * transition, and the `aria-label` / `aria-describedby` wiring are all
 * untouched.
 *
 * The surface is one of the design system's inverse layers, so it
 * flips with the colour scheme rather than staying dark: a near-black
 * bubble with near-white text on a light page, and the reverse on a
 * dark one. `Slider`'s value bubble uses the same construction one rung
 * up (`card 4`).
 *
 * Overriding the bubble needs a descendant selector, because `sx` on
 * this component lands on the popper:
 *
 *   <Tooltip
 *     title="Longer copy"
 *     sx={{ [`& .${tooltipClasses.tooltip}`]: { maxWidth: 200 } }}
 *   >
 *
 * @example Default
 * <Tooltip title="Archive this thread">
 *   <IconButton aria-label="Archive"><ArchiveIcon /></IconButton>
 * </Tooltip>
 *
 * @example Placed above, as a description
 * <Tooltip title="We only use this to sign you in." placement="top" describeChild>
 *   <Button>Email address</Button>
 * </Tooltip>
 *
 * @see Related: IconButton, Menu, Slider
 */
export const Tooltip = styled(TooltipBase)(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: MAX_WIDTH,
    padding: `${spacing.component.xs}px ${spacing.component.sm}px`,
    borderRadius: radius.sm,
    /*
     * The sheet draws three stacked 1-2px shadows at 6-10% off the
     * `shadow/tint/*` variables, which read as a hairline edge rather
     * than elevation and are not on the token scale. `elevation.medium`
     * is the effect style the design team named for "dropdowns,
     * tooltips, floating elements" (DESIGNER_QUESTIONS.md #10) and is
     * what `Menu` already floats on, so the two overlay surfaces agree.
     * The conflict between the two designer sources is #34.
     */
    boxShadow: elevation.medium,
    fontSize: BUBBLE_TYPE.size,
    lineHeight: `${BUBBLE_TYPE.leading}px`,
    letterSpacing: `${BUBBLE_TYPE.letterSpacing}em`,
    // The sheet sets 55 Roman; MUI's default is `fontWeightMedium`.
    fontWeight: fontWeights.regular,
    ...paired(theme, {
      backgroundColor: surface.layers.card6OnColor,
      color: text.default.headingOnColor,
    }),
  },
  /*
   * The tip paints from `currentColor`, so it takes `color` rather than
   * a background and stays welded to the bubble's fill in both schemes.
   */
  [`& .${tooltipClasses.arrow}`]: {
    fontSize: ARROW_WIDTH,
    ...paired(theme, { color: surface.layers.card6OnColor }),
  },
}));

Tooltip.displayName = 'Tooltip';
