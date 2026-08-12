'use client';

import * as React from 'react';
import {
  CircularProgress as MuiCircularProgress,
  circularProgressClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { paired } from '../_shared/actionStyles';

import { indicatorTokens, muiColorMap, TRACK_TOKEN } from './progressTokens';

import type { CSSObject } from '@mui/material/styles';
import type { CircularProgressProps, ProgressColor } from './Progress.types';

interface StyledCircularProgressProps {
  neofloColor: ProgressColor;
}

/*
 * Colour and one stroke property. Every dimension is MUI's: the 40px
 * default size, the 3.6 stroke in a 44-unit viewBox, the 1.4s rotation,
 * the 1.4s dash cycle that makes the indeterminate arc breathe, and the
 * `rotate(-90deg)` that starts a determinate arc at twelve o'clock.
 *
 * MUI drives the whole component from one `color`: the root sets
 * `color: palette[color].main` and the arc and the ring both paint
 * themselves `currentColor` — the ring at `action.activatedOpacity`
 * (12%) to separate itself. So recolouring the root is enough for the
 * arc, and the ring is pinned separately because the design system
 * gives the unfilled part its own token rather than a faded tint of the
 * filled part (see `progressTokens.ts`).
 */
const StyledCircularProgress = styled(MuiCircularProgress, {
  shouldForwardProp: (prop) => prop !== 'neofloColor',
})<StyledCircularProgressProps>(({ theme, neofloColor }) => {
  /*
   * Rounded ends on the arc, which MUI leaves square.
   *
   * The one visual value here that is a decision rather than a
   * transcription, taken to match the `LinearProgress` bar in the same
   * family and the `radius.full` this system rounds every other mark
   * with. It is safe at both ends of the determinate range: at `value`
   * = `min` the dash offset puts the whole visible stroke inside a gap,
   * so nothing is drawn and there is no leftover cap, and at `max` the
   * two caps meet on a closed circle. Between those, round caps add
   * half a stroke width at each end, so a very small percentage draws
   * slightly long — the same trade every rounded progress ring makes.
   */
  const caps: CSSObject = {
    [`& .${circularProgressClasses.circle}`]: {
      strokeLinecap: 'round',
    },
  };

  // `inherit` keeps MUI's `currentColor` arc and 12% ring: the point of
  // the role is to take its colour from whatever it sits inside.
  if (neofloColor === 'inherit') return caps;

  return {
    ...caps,
    /*
     * `&.root` (0,2,0) rather than a bare declaration, so this outranks
     * the prop-keyed `variants` MUI declares inside the root slot's own
     * class (0,1,0) regardless of the order Emotion emits them in.
     */
    [`&.${circularProgressClasses.root}`]: paired(theme, {
      color: indicatorTokens[neofloColor],
    }),
    /*
     * Only mounted when `enableTrackSlot` is set. `opacity: 1` because
     * the token is already the colour the design system wants — MUI's
     * 12% of `currentColor` would fade a real token down to nothing.
     */
    [`& .${circularProgressClasses.track}`]: {
      opacity: 1,
      ...paired(theme, { stroke: TRACK_TOKEN }),
    },
  };
});

/**
 * Circular progress indicator. Wraps MUI `CircularProgress` for the
 * spinner case — a wait with no useful percentage — and for a
 * determinate ring when there is one.
 *
 * Reach for `LinearProgress` instead when the wait belongs to a
 * *region* rather than a control: a bar spanning the top of a panel
 * reads as "this panel is loading", where a spinner in the middle of it
 * reads as "something is happening somewhere".
 *
 * ## No Figma source
 *
 * The Product Design System file has no progress, spinner, or loader
 * component, so nothing here was transcribed from a sheet. The colours
 * are composed from existing semantic tokens and the geometry is MUI's.
 * See `DESIGNER_QUESTIONS.md` #36.
 *
 * ## Accessibility
 *
 * MUI puts `role="progressbar"` on the root and, for `determinate`
 * only, `aria-valuenow` / `aria-valuemin` / `aria-valuemax`. Two things
 * follow, and neither can be fixed inside this component:
 *
 *   - **It has no accessible name of its own.** Give it one with
 *     `aria-label`, or point `aria-labelledby` at the heading it
 *     belongs to. A `progressbar` with no name is announced as an
 *     unlabelled progress bar.
 *   - **A spinner should usually not be the thing that announces the
 *     wait.** Put `aria-busy` on the region being loaded and
 *     `aria-describedby` on it pointing at the indicator — MUI's own
 *     documented pattern, and the one in the examples.
 *
 * @example A wait with no percentage
 * <CircularProgress aria-label="Loading results" />
 *
 * @example A known percentage
 * <CircularProgress variant="determinate" value={72} enableTrackSlot aria-label="Upload progress" />
 *
 * @example Inside a control, taking the control's colour
 * <CircularProgress color="inherit" size={16} />
 *
 * @see Related: LinearProgress, Skeleton, Button
 */
export const CircularProgress = React.forwardRef<
  HTMLSpanElement,
  CircularProgressProps
>(({ color = 'primary', ...rest }, ref) => (
  <StyledCircularProgress
    ref={ref}
    color={color === 'inherit' ? 'inherit' : muiColorMap[color]}
    neofloColor={color}
    {...rest}
  />
));

CircularProgress.displayName = 'CircularProgress';
