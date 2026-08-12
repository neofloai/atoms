'use client';

import * as React from 'react';
import { Slider as MuiSlider, sliderClasses } from '@mui/material';
import { styled } from '@mui/material/styles';

import { border, radius, surface, text } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';

import type { SliderProps, SliderSize } from './Slider.types';

/** House `sm`/`md` ramp -> MUI's own `small`/`medium`. */
const muiSizeMap: Record<SliderSize, 'small' | 'medium'> = {
  sm: 'small',
  md: 'medium',
};

/*
 * Colour only. Every measurement — bar thickness, thumb diameter, the
 * 13px vertical padding that gives the control its 42px touch target,
 * the hover/active halo radii, the value-label bubble and its arrow —
 * is MUI's own and deliberately untouched.
 *
 * MUI drives the whole control from a single `color` prop: the root sets
 * `color: palette[color].main` and the rail, track, thumb, and marks all
 * paint themselves `currentColor`, the rail at 38% opacity to
 * differentiate itself. The design system gives the unfilled bar its own
 * neutral token rather than a faded tint of the brand colour, so each
 * slot is pinned explicitly below and the opacity trick comes off.
 *
 * TODO(DESIGNER_QUESTIONS.md #33): the Figma file does have a `slider`
 * component set (updated 10 August), but its node id could not be
 * resolved through the MCP — the document's page listing exposes only
 * `Cover`, and the by-key lookup needs a Code Connect seat. So unlike
 * every other component here, these tokens are mapped by role rather
 * than read off the sheet — the brand fill is the one `Button` uses for
 * `contained` `primary`, and the neutral bar is the nearest token that
 * survives dark mode (see the rail rule). Every value is therefore a
 * question for the designer, not a spec.
 */
const StyledSlider = styled(MuiSlider)(({ theme }) => ({
  /*
   * The unfilled bar. `border.default.default` rather than the
   * `surface.default.defaultPressed` that `Switch`'s off-track uses:
   * the two are the same grey in light mode, but the surface token
   * resolves to grey/900 in dark, which all but disappears against a
   * card. A switch can afford that — its thumb still marks the control
   * — but the rail is the only thing telling you how long a slider's
   * scale is, so it has to stay visible in both schemes.
   */
  [`& .${sliderClasses.rail}`]: {
    opacity: 1,
    ...paired(theme, { backgroundColor: border.default.default }),
  },
  /*
   * MUI strokes the filled bar with `1px solid currentColor` so it stays
   * visible under forced colours, and the root is `content-box` — so at
   * `md` the track measures 6px against the rail's 4px, reading as a
   * slight emphasis on the filled side. (At `sm` MUI drops the border
   * outside forced-colours mode, so both are 2px.) That is MUI's own
   * rendering and is left alone; the border only gets recoloured, so it
   * tracks the same token as the fill instead of the palette's
   * `currentColor`. See DESIGNER_QUESTIONS.md #33.
   */
  [`& .${sliderClasses.track}`]: paired(theme, {
    backgroundColor: surface.primary.default,
    borderColor: surface.primary.default,
  }),
  [`& .${sliderClasses.thumb}`]: paired(theme, {
    backgroundColor: surface.primary.default,
  }),

  /*
   * `track="inverted"` swaps which side of the thumb carries the
   * emphasis: MUI lifts the rail to full strength and drops the track to
   * a pale tint of the same colour. It expresses that as a tint computed
   * from the palette, which the two rules above outrank — so without
   * these it would render identically to `track="normal"`. Both tokens
   * stay on the primary ladder, far enough apart to read in either
   * scheme (500 vs 200 light, 600 vs 800 dark).
   */
  [`&.${sliderClasses.trackInverted} .${sliderClasses.rail}`]: paired(theme, {
    backgroundColor: surface.primary.default,
  }),
  [`&.${sliderClasses.trackInverted} .${sliderClasses.track}`]: paired(theme, {
    backgroundColor: surface.primary.defaultPressed,
    borderColor: surface.primary.defaultPressed,
  }),

  /*
   * MUI's bubble is `grey[600]` with white text in both schemes, which
   * inverts badly on a dark page. The `card4OnColor` surface is the
   * design system's inverse layer and flips with the scheme, so the
   * bubble stays legible in both. Its arrow inherits the fill.
   */
  [`& .${sliderClasses.valueLabel}`]: {
    borderRadius: radius.xs,
    ...paired(theme, {
      backgroundColor: surface.layers.card4OnColor,
      color: text.default.headingOnColor,
    }),
  },

  /*
   * MUI expresses the disabled state as one `color: grey[400]` on the
   * root and lets `currentColor` carry it into every slot. The rules
   * above pin explicit backgrounds, so `currentColor` no longer reaches
   * the bar or the thumb and each has to be muted on its own. Marks are
   * left alone — they still read `currentColor`, so they grey out with
   * the root for free.
   *
   * These sit last because they tie with the `trackInverted` rules above
   * on specificity, and a disabled inverted slider should read as
   * disabled: on a tie the later rule wins.
   */
  [`&.${sliderClasses.disabled} .${sliderClasses.rail}`]: paired(theme, {
    // One rung dimmer than the resting rail in both schemes, so a
    // disabled slider recedes rather than just losing its colour.
    backgroundColor: surface.disabled.default,
  }),
  [`&.${sliderClasses.disabled} .${sliderClasses.track}`]: paired(theme, {
    backgroundColor: border.default.defaultHover,
    borderColor: border.default.defaultHover,
  }),
  [`&.${sliderClasses.disabled} .${sliderClasses.thumb}`]: paired(theme, {
    backgroundColor: border.default.defaultHover,
  }),
}));

/**
 * Branded slider for choosing a number, or a range, from a continuous
 * or stepped scale. Wraps MUI `Slider` with the Neoflo colours for the
 * rail, filled track, thumb, and value label in both colour schemes;
 * every dimension and all interaction behaviour — drag, click-to-seek,
 * arrow/Home/End keys, the hover and active halos, the value bubble —
 * is MUI's own.
 *
 * Horizontal only. MUI's `orientation="vertical"` is not part of this
 * API. Pass an array to `value` / `defaultValue` for a two-thumb range.
 *
 * @example Single value
 * <Slider aria-label="Volume" defaultValue={40} />
 *
 * @example Range, stepped, with a value bubble
 * <Slider
 *   getAriaLabel={(index) => (index === 0 ? 'Minimum price' : 'Maximum price')}
 *   defaultValue={[20, 60]}
 *   step={10}
 *   marks
 *   valueLabelDisplay="auto"
 * />
 *
 * @see Related: Switch, TextField
 */
export const Slider = React.forwardRef<HTMLSpanElement, SliderProps>(
  ({ size = 'md', ...rest }, ref) => (
    <StyledSlider
      ref={ref}
      {...rest}
      /*
       * After the spread on purpose. The prop types already omit
       * `color` and `orientation`, but the styles above assume both:
       * the thumb's halo is a 16% tint of the palette colour, and the
       * horizontal variant is what supplies the bar's height. Pinning
       * them last means a JavaScript caller cannot half-apply a
       * different colour or turn the control vertical.
       */
      color="primary"
      orientation="horizontal"
      size={muiSizeMap[size]}
    />
  )
);

Slider.displayName = 'Slider';
