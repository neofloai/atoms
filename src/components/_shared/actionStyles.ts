import { border, surface, text } from '@/src/tokens';

import type { CSSObject, Theme } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';

/**
 * Shared colour-role and state styling for action controls (`Button`,
 * `IconButton`). Both Figma component sets (nodes 983:17180 and
 * 983:16220) use identical type / style / state axes, so the token
 * mapping lives here once.
 *
 * They no longer agree on every *value*, though. The 11 August update
 * moved `Button`'s low-emphasis treatment and left `IconButton`'s
 * alone, so two things still depend on which control is asking:
 * `primary`'s soft fills and `primary`'s resting `outline` label. Call
 * sites pass their `ActionControl` so those stay in this one table
 * rather than leaking into the components. Both were read off
 * `IconButton`'s own component set, not assumed from `Button`'s.
 *
 * The third disagreement is closed by decision rather than by an
 * export: that update also had a hovered `text` Button mark itself with
 * an underline and no fill, where the IconButton set kept the soft
 * fill. Both controls now take the fill — see the `text` branch at the
 * bottom of `appearanceStyles`.
 *
 * Figma draws `IconButton`'s glyph from the `icon/*` variable group and
 * `Button`'s label from `text/*`. Every slot these two controls touch
 * holds the same value in both groups as of the 2026-08-11 export, so
 * the table reads from `text` throughout; only `icon.default.subtle`
 * and `icon.disabled.onColor` differ, and neither control uses them.
 * If a later export splits the accent roles apart, this is the seam.
 */

/**
 * Colour role of an action control, mapped from the Figma `type` axis.
 * `secondary` renders on neutral grey surfaces; all others use their
 * semantic colour scale.
 */
export type ActionVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning';

/**
 * Visual emphasis of an action control, mapped from the Figma `style`
 * axis: solid fill, 1px border, or bare label/glyph. Figma calls
 * `contained` "filled" on the Button set and "contained" on the
 * IconButton set; they are the same style.
 */
export type ActionAppearance = 'contained' | 'outline' | 'text';

/**
 * Which control is being styled. Only consulted where the two Figma
 * sets disagree — see the header comment and `SoftSpec`.
 */
export type ActionControl = 'button' | 'iconButton';

/** Width of the focus-visible ring around action controls. */
export const FOCUS_RING_WIDTH_PX = 3;

/**
 * Width of the `outline` appearance's border. Exported because callers
 * have to subtract it from their padding: Figma strokes its outlined
 * variants *inside* the frame, so they measure the same height as the
 * filled ones, while a CSS border sits outside the content box.
 */
export const OUTLINE_BORDER_WIDTH_PX = 1;

/**
 * The low-emphasis half of a colour role: the fills `outline` and
 * `text` take on hover and press, plus the label `outline` rests on
 * before interaction.
 */
interface SoftSpec {
  readonly hover: ModeToken;
  readonly pressed: ModeToken;
  /**
   * Resting `outline` label. Interactive states always move to
   * `accentText`, so this only reads differently where Figma draws the
   * resting label darker than the hovered one.
   */
  readonly outlineText: ModeToken;
}

interface RoleTokens {
  containedBg: ModeToken;
  containedBgHover: ModeToken;
  containedBgPressed: ModeToken;
  containedText: ModeToken;
  accentText: ModeToken;
  /**
   * Resting, hover and focus border for `outline` — constant across all
   * three, on the role's own tier-1 border.
   */
  outlineBorder: ModeToken;
  /**
   * Pressed border for `outline`. Every role but `primary` drops to the
   * neutral border while held. That reads oddly on `error`, but both
   * component sets draw it independently on the same roles, so it is a
   * spec rather than a stray copy-paste. See DESIGNER_QUESTIONS.md #29.
   */
  outlineBorderPressed: ModeToken;
  focusRing: ModeToken;
  soft: Record<ActionControl, SoftSpec>;
}

/** Roles whose soft half is specced identically for both controls. */
function bothControls(spec: SoftSpec): Record<ActionControl, SoftSpec> {
  return { button: spec, iconButton: spec };
}

/**
 * Figma `type` axis -> semantic tokens. `secondary` maps to the
 * neutral `default` token group (grey surfaces, body text); the
 * remaining roles use their own colour group.
 *
 * Per the live Figma component (node 983:17179), only `primary`
 * `contained` uses a saturated fill + white label — `secondary`,
 * `success`, `error`, and `warning` `contained` all use a pale/subtle
 * fill with the role's own dark accent as the label colour (same
 * value the `outline`/`text` styles use for `accentText`). That
 * accent colour is the role's `caption` text slot, not `heading`.
 */
const roleTokens: Record<ActionVariant, RoleTokens> = {
  primary: {
    containedBg: surface.primary.default,
    containedBgHover: surface.primary.defaultHover,
    containedBgPressed: surface.primary.defaultPressed,
    containedText: text.default.headingOnColor,
    accentText: text.primary.caption,
    outlineBorder: border.primary.default,
    // The one role that keeps its own border while held.
    outlineBorderPressed: border.primary.default,
    focusRing: border.primary.focus,
    // The only role where the two sets disagree. Button's soft fills
    // sit one rung lighter than IconButton's, and its `outline` rests
    // on the darker `body` label before lightening to `caption` on
    // interaction (nodes 983:17174 resting, 983:17166 hovered).
    soft: {
      button: {
        hover: surface.primary.subtle,
        pressed: surface.primary.subtleHover,
        outlineText: text.primary.body,
      },
      iconButton: {
        hover: surface.primary.subtleHover,
        pressed: surface.primary.subtlePressed,
        outlineText: text.primary.caption,
      },
    },
  },
  secondary: {
    containedBg: surface.default.default,
    containedBgHover: surface.default.defaultHover,
    containedBgPressed: surface.default.defaultPressed,
    containedText: text.default.body,
    accentText: text.default.body,
    outlineBorder: border.default.default,
    // Already the neutral border, so the pressed swap is a no-op here.
    outlineBorderPressed: border.default.default,
    focusRing: border.default.defaultPressed,
    // The neutral group has no separate `subtle` ladder, and its first
    // rung is already the *filled* resting fill — so the soft states
    // start one rung further in to stay distinguishable from it.
    //
    // Dark mode has to start one rung further still. `defaultHover` is
    // `grey/950`, which sits directly against the `grey/1000` that both
    // `Card` and `Dialog` use as their surface: a hovered `secondary`
    // `text` button measured `rgb(28,28,26)` on `rgb(23,23,22)` there,
    // a shade you cannot see. So hover drops onto the pressed rung in
    // dark mode only — light is untouched. The two states then coincide
    // in dark, which is the same price #44 paid on the dialog's close
    // button and for the same reason: below `grey/900` the neutral scale
    // jumps to `grey/800`. Two components now short a rung.
    soft: bothControls({
      hover: {
        light: surface.default.defaultHover.light,
        dark: surface.default.defaultPressed.dark,
      },
      pressed: surface.default.defaultPressed,
      outlineText: text.default.body,
    }),
  },
  success: {
    containedBg: surface.success.default,
    containedBgHover: surface.success.defaultHover,
    containedBgPressed: surface.success.defaultPressed,
    containedText: text.success.caption,
    accentText: text.success.caption,
    outlineBorder: border.success.default,
    outlineBorderPressed: border.default.default,
    focusRing: border.success.focus,
    soft: bothControls({
      hover: surface.success.subtleHover,
      pressed: surface.success.subtlePressed,
      outlineText: text.success.caption,
    }),
  },
  error: {
    containedBg: surface.error.default,
    containedBgHover: surface.error.defaultHover,
    containedBgPressed: surface.error.defaultPressed,
    containedText: text.error.caption,
    accentText: text.error.caption,
    outlineBorder: border.error.default,
    outlineBorderPressed: border.default.default,
    focusRing: border.error.focus,
    soft: bothControls({
      hover: surface.error.subtleHover,
      pressed: surface.error.subtlePressed,
      outlineText: text.error.caption,
    }),
  },
  warning: {
    containedBg: surface.warning.default,
    containedBgHover: surface.warning.defaultHover,
    containedBgPressed: surface.warning.defaultPressed,
    containedText: text.warning.caption,
    accentText: text.warning.caption,
    outlineBorder: border.warning.default,
    outlineBorderPressed: border.default.default,
    focusRing: border.warning.focus,
    soft: bothControls({
      hover: surface.warning.subtleHover,
      pressed: surface.warning.subtlePressed,
      outlineText: text.warning.caption,
    }),
  },
};

/** Splits `{ light, dark }` token pairs into two flat CSS objects. */
function splitModes(styles: Record<string, ModeToken>): [CSSObject, CSSObject] {
  const light: CSSObject = {};
  const dark: CSSObject = {};
  for (const [property, token] of Object.entries(styles)) {
    light[property] = token.light;
    dark[property] = token.dark;
  }
  return [light, dark];
}

/**
 * Expands `{ light, dark }` token pairs into a CSS object: light
 * values inline, dark values behind `theme.applyStyles('dark', ...)`.
 *
 * Pass every mode-aware property for one selector in a single call.
 * `applyStyles` returns one keyed object, so spreading two of these into
 * the same rule drops the first one's dark block and lets dark mode fall
 * back to light values — see `pairedFocusRing`.
 */
export function paired(
  theme: Theme,
  styles: Record<string, ModeToken>
): CSSObject {
  const [light, dark] = splitModes(styles);
  return { ...light, ...theme.applyStyles('dark', dark) };
}

/**
 * Where the focus ring is drawn relative to the control's box.
 *
 * `outer` is the house default and what every Figma focus cell shows: a
 * 3px ring just outside the border, on a control with space around it.
 * `inset` draws the same ring just *inside* the box instead, for a
 * control that spans its container edge to edge — a full-bleed row has
 * no outside to put a ring in, so an outer one would either be clipped
 * or paint over the neighbouring row. `Accordion`'s summary is the
 * first caller; see `AccordionSummary.tsx`.
 */
export type FocusRingPlacement = 'outer' | 'inset';

function ringShadow(color: string, placement: FocusRingPlacement): string {
  const offset = placement === 'inset' ? 'inset ' : '';
  return `${offset}0 0 0 ${FOCUS_RING_WIDTH_PX}px ${color}`;
}

export function focusRing(
  theme: Theme,
  token: ModeToken,
  placement: FocusRingPlacement = 'outer'
): CSSObject {
  return {
    boxShadow: ringShadow(token.light, placement),
    ...theme.applyStyles('dark', {
      boxShadow: ringShadow(token.dark, placement),
    }),
  };
}

/**
 * The focus ring plus mode-aware properties on the same selector, in one
 * dark block.
 *
 * `paired` and `focusRing` each emit a single
 * `theme.applyStyles('dark', ...)` key, so `{ ...paired(...),
 * ...focusRing(...) }` silently discards whichever came first: the light
 * values stay, and dark mode renders them. That shipped a light-mode
 * hover fill under the focus ring on dark pages. Any rule needing both
 * has to go through here.
 */
export function pairedFocusRing(
  theme: Theme,
  styles: Record<string, ModeToken>,
  ring: ModeToken,
  placement: FocusRingPlacement = 'outer'
): CSSObject {
  const [light, dark] = splitModes(styles);
  light.boxShadow = ringShadow(ring.light, placement);
  dark.boxShadow = ringShadow(ring.dark, placement);
  return { ...light, ...theme.applyStyles('dark', dark) };
}

/**
 * Full state styling (resting / hover / pressed / focus-visible /
 * disabled) for one variant + appearance combination, in both colour
 * schemes.
 */
export function appearanceStyles(
  theme: Theme,
  variant: ActionVariant,
  appearance: ActionAppearance,
  control: ActionControl
): CSSObject {
  const role = roleTokens[variant];
  const soft = role.soft[control];

  if (appearance === 'contained') {
    return {
      ...paired(theme, {
        backgroundColor: role.containedBg,
        color: role.containedText,
      }),
      '&:hover': paired(theme, { backgroundColor: role.containedBgHover }),
      '&:active': paired(theme, { backgroundColor: role.containedBgPressed }),
      '&.Mui-focusVisible': pairedFocusRing(
        theme,
        { backgroundColor: role.containedBgHover },
        role.focusRing
      ),
      '&.Mui-disabled': paired(theme, {
        backgroundColor: surface.disabled.default,
        color: text.disabled.default,
      }),
    };
  }

  if (appearance === 'outline') {
    return {
      backgroundColor: 'transparent',
      borderWidth: OUTLINE_BORDER_WIDTH_PX,
      borderStyle: 'solid',
      ...paired(theme, {
        color: soft.outlineText,
        borderColor: role.outlineBorder,
      }),
      '&:hover': paired(theme, {
        backgroundColor: soft.hover,
        color: role.accentText,
      }),
      // Press is the only state that moves the border off the role —
      // see `RoleTokens.outlineBorderPressed`.
      '&:active': paired(theme, {
        backgroundColor: soft.pressed,
        color: role.accentText,
        borderColor: role.outlineBorderPressed,
      }),
      '&.Mui-focusVisible': pairedFocusRing(
        theme,
        { backgroundColor: soft.hover, color: role.accentText },
        role.focusRing
      ),
      '&.Mui-disabled': paired(theme, {
        color: text.disabled.default,
        borderColor: border.disabled.default,
      }),
    };
  }

  // `text`, one implementation for both controls: the role's soft fill
  // on hover, press and focus, over a transparent resting box. The same
  // fills `outline` takes one rung of emphasis up, so a text button and
  // an outlined button of the same role shade by the same amount.
  //
  // Figma parts the two sets here. The IconButton cells take the fill
  // (nodes 983:17497, 983:17464, 983:17479); a hovered `text` Button
  // underlines and stays transparent (983:17088), with press and focus
  // drawn identically to rest (983:17170, 983:17079). The fill is what
  // ships for both, which is also MUI's behaviour — it clears the
  // underline off its own text button explicitly (`&:hover {
  // textDecoration: 'none' }`) and marks hover with a 4% wash of the
  // role colour, the same job this system's `subtle` rung does. A label
  // that grows a line under the pointer reads as a link, and there is a
  // `Link` for that; it also left press and focus with no fill of their
  // own, so two of the four states were indistinguishable from rest.
  // Deliberate departure from the export — DESIGNER_QUESTIONS.md #45.
  return {
    backgroundColor: 'transparent',
    ...paired(theme, { color: role.accentText }),
    '&:hover': paired(theme, { backgroundColor: soft.hover }),
    '&:active': paired(theme, { backgroundColor: soft.pressed }),
    '&.Mui-focusVisible': pairedFocusRing(
      theme,
      { backgroundColor: soft.hover },
      role.focusRing
    ),
    '&.Mui-disabled': paired(theme, { color: text.disabled.default }),
  };
}
