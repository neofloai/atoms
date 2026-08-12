'use client';

import * as React from 'react';
import {
  LinearProgress as MuiLinearProgress,
  linearProgressClasses,
} from '@mui/material';
import { styled } from '@mui/material/styles';

import { radius } from '@/src/tokens';

import { paired } from '../_shared/actionStyles';

import { indicatorTokens, muiColorMap, TRACK_TOKEN } from './progressTokens';

import type { CSSObject } from '@mui/material/styles';
import type { LinearProgressProps, ProgressColor } from './Progress.types';

interface StyledLinearProgressProps {
  neofloColor: ProgressColor;
}

/**
 * MUI's dot pattern for the `buffer` variant's unfilled remainder,
 * restated so the colour can come from a token. The stops are MUI's own
 * (`0%` / `16%` / `42%` on a 10x10 tile) — only the colour changes.
 */
const dashedDots = (color: string): string =>
  `radial-gradient(${color} 0%, ${color} 16%, transparent 42%)`;

/*
 * Colour, plus rounded ends. Every dimension and all motion is MUI's:
 * the 4px height (which is `spacing.component.xxs`, so there was
 * nothing to correct), the two indeterminate bars on their 2.1s
 * staggered cubic-beziers, the 0.4s linear tween a determinate value
 * animates over, the 3s dot drift behind a buffer, and the 180deg flip
 * that turns `indeterminate` into `query`.
 *
 * MUI derives all four colours from one palette entry: the bar takes
 * `palette[color].main` and the track, the buffer bar, and the dots all
 * take a computed shade of it — `lighten(main, 0.62)` in light,
 * `darken(main, 0.5)` in dark. Both are replaced with tokens here (see
 * `progressTokens.ts`), which means each slot has to be pinned
 * separately since there is no longer a single value flowing down.
 */
const StyledLinearProgress = styled(MuiLinearProgress, {
  shouldForwardProp: (prop) => prop !== 'neofloColor',
})<StyledLinearProgressProps>(({ theme, neofloColor }) => {
  /*
   * Rounded ends, matching the `CircularProgress` arc's round caps.
   *
   * The root already clips (`overflow: hidden`), so rounding it is
   * enough to shape the track and the *trailing* end of the bar; the
   * bars are rounded as well so a determinate bar's leading edge is
   * capped too, and so the two indeterminate bars read as capsules
   * sliding through rather than blocks. A 9999px radius on a 4px-tall
   * box clamps to 2px, which is the pill.
   */
  const rounding: CSSObject = {
    [`& .${linearProgressClasses.bar}`]: {
      borderRadius: radius.full,
    },
  };

  // `inherit` keeps MUI's `currentColor` bar and the 30%-opacity track
  // it draws underneath: the point of the role is to take its colour
  // from whatever it sits inside.
  if (neofloColor === 'inherit') {
    return {
      ...rounding,
      [`&.${linearProgressClasses.root}`]: { borderRadius: radius.full },
    };
  }

  const indicator = indicatorTokens[neofloColor];

  return {
    ...rounding,
    /*
     * `&.root` (0,2,0) rather than a bare declaration, so this outranks
     * the prop-keyed `variants` MUI declares inside the root slot's own
     * class (0,1,0) regardless of the order Emotion emits them in. The
     * same applies to every rule below: a wrapper's descendant selector
     * is (0,2,0) against MUI's (0,1,0).
     */
    [`&.${linearProgressClasses.root}`]: {
      borderRadius: radius.full,
      ...paired(theme, { backgroundColor: TRACK_TOKEN }),
    },
    /*
     * `buffer` is the one variant whose root is *not* the track: MUI
     * makes it transparent and draws the remainder as dots instead, so
     * the rule above has to be taken back. (0,3,0) rather than relying
     * on source order, because the rule it has to beat carries a dark
     * block of its own.
     */
    [`&.${linearProgressClasses.buffer}.${linearProgressClasses.root}`]: {
      backgroundColor: 'transparent',
    },
    [`& .${linearProgressClasses.dashed}`]: paired(theme, {
      backgroundImage: {
        light: dashedDots(TRACK_TOKEN.light),
        dark: dashedDots(TRACK_TOKEN.dark),
      },
    }),
    /*
     * The filled bar. `bar1` is the value in every variant; `bar2` is
     * the second indeterminate sweep, so it takes the same colour —
     * except under `buffer`, where it is the buffered-but-not-yet-real
     * portion and drops to the track token. Solid track colour against
     * dotted track colour is MUI's own distinction, and it works: a
     * solid bar reads as further along than a dotted one at the same
     * colour.
     */
    [`& .${linearProgressClasses.bar1}, & .${linearProgressClasses.bar2}`]:
      paired(theme, { backgroundColor: indicator }),
    [`&.${linearProgressClasses.buffer} .${linearProgressClasses.bar2}`]:
      paired(theme, { backgroundColor: TRACK_TOKEN }),
  };
});

/**
 * Linear progress indicator. Wraps MUI `LinearProgress` — a 4px bar,
 * full width of its container, for a wait that belongs to a region: the
 * top of a panel, the head of a table, under a file being uploaded.
 *
 * Reach for `CircularProgress` when the wait belongs to a single
 * control, and for `Skeleton` when the shape of the content that is
 * coming is already known.
 *
 * ## No Figma source
 *
 * The Product Design System file has no progress, spinner, or loader
 * component, so nothing here was transcribed from a sheet. The colours
 * are composed from existing semantic tokens and the geometry is MUI's.
 *
 * @example A wait with no percentage
 * <LinearProgress />
 *
 * @example A known percentage
 * <LinearProgress variant="determinate" value={72} />
 *
 * @example Streaming, with a buffered position behind the real one
 * <LinearProgress variant="buffer" value={48} valueBuffer={64} />
 *
 * @see Related: CircularProgress, Skeleton, Slider
 */
export const LinearProgress = React.forwardRef<
  HTMLSpanElement,
  LinearProgressProps
>(({ color = 'primary', ...rest }, ref) => (
  <StyledLinearProgress
    ref={ref}
    color={color === 'inherit' ? 'inherit' : muiColorMap[color]}
    neofloColor={color}
    {...rest}
  />
));

LinearProgress.displayName = 'LinearProgress';
