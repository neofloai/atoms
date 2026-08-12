import { icon, surface } from '@/src/tokens';

import type { CircularProgressProps as MuiCircularProgressProps } from '@mui/material';
import type { ModeToken } from '@/src/tokens';
import type { ProgressColor } from './Progress.types';

/**
 * Colour shared by `CircularProgress` and `LinearProgress`.
 *
 * Both indicators are the same thing drawn two ways — a moving mark on
 * a static track — so they read from one table rather than two that
 * could drift apart.
 */

/** Every role except `inherit`, which has no token behind it. */
export type ProgressRole = Exclude<ProgressColor, 'inherit'>;

/**
 * Neoflo colour role -> MUI palette role. Only `information` is
 * renamed; the rest already share MUI's word.
 *
 * The mapped value is still forwarded, so MUI keeps emitting its own
 * `.MuiLinearProgress-colorError`-style hooks and a consumer's
 * `classes` / theme overrides keyed on them still land. Every colour is
 * then repainted from the tokens below at higher specificity.
 */
export const muiColorMap: Record<
  ProgressRole,
  NonNullable<MuiCircularProgressProps['color']>
> = {
  primary: 'primary',
  secondary: 'secondary',
  success: 'success',
  error: 'error',
  warning: 'warning',
  information: 'info',
};

/**
 * The moving part: a circular arc, or the filled portion of a bar.
 *
 * `icon.<role>.accent` — the same rung `Badge`'s dot uses, and for the
 * same reason. A progress indicator is a mark a few pixels thick with
 * no text on it, so it needs the strong end of the role ladder; the
 * `surface.<role>.default` fill that carries a filled Button or a
 * counter badge is pale for five of the six roles (`surface.error.default`
 * is `red/75`) and would vanish at 4px.
 *
 * `secondary` is the neutral treatment and takes `icon.default.body`,
 * matching `Badge`'s neutral dot.
 *
 * This is one rung away from what `Slider` fills its track with —
 * `surface.primary.default`. The two agree in light mode (both
 * `primary/500`) and differ in dark, where `Slider` stays on
 * `primary/600` to match a contained Button while the accent lifts to
 * `primary/400`. A 4px bar on a dark page needs the lighter one. See
 * `DESIGNER_QUESTIONS.md` #36.
 */
export const indicatorTokens: Record<ProgressRole, ModeToken> = {
  primary: icon.primary.accent,
  secondary: icon.default.body,
  success: icon.success.accent,
  error: icon.error.accent,
  warning: icon.warning.accent,
  information: icon.information.accent,
};

/**
 * The static part: the unfilled bar, the ring behind the arc, and the
 * dotted remainder of a `buffer` bar.
 *
 * Neutral in every role. MUI derives this from the role colour instead
 * — a computed `lighten(main, 0.62)` in light and `darken(main, 0.5)`
 * in dark for the bar, `currentColor` at 12% for the ring — which this
 * system replaces with a real token, the same move `Slider` makes for
 * its rail.
 *
 * `surface.default.defaultPressed`, which is the token `Switch` uses
 * for its off-track, and *not* the `border.default.default` `Slider`
 * uses for its rail. The two are the same `grey/300` in light and
 * differ in dark: `grey/900` here against the rail's `grey/700`. That
 * was measured rather than guessed, and it is the one place this
 * component disagrees with a sibling on purpose (DESIGNER_QUESTIONS.md
 * #36):
 *
 *   - The accent inks lift one rung in dark (`primary/400` where light
 *     uses `primary/500`), so the track has to go *darker* in dark to
 *     keep the same separation, not stay level.
 *   - On the rail's `grey/700`, three of the twelve role-and-scheme
 *     pairs fall under 3:1 where the fill meets the track, including
 *     the default `primary` in dark at 2.32:1. On `grey/900` eleven of
 *     the twelve clear it, `primary` in dark at 3.51:1.
 *   - The cost is that the dark track is fainter against a card
 *     (1.20:1 rather than 1.82:1), so the remaining share of a bar is
 *     subtle in dark. That is the right side to give up: a slider's
 *     rail is also its hit area, so its extent has to be obvious,
 *     while progress is not interactive and its *fill* is what carries
 *     the value.
 */
export const TRACK_TOKEN: ModeToken = surface.default.defaultPressed;
