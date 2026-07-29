import { border, surface, text } from '@/src/tokens';

import type { CSSObject, Theme } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';

/**
 * Shared colour-role and state styling for action controls (`Button`,
 * `IconButton`). Both Figma component sets (nodes 983:17180 and
 * 983:16220) use identical type / style / state axes, so the token
 * mapping lives here once.
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
 * axis: solid fill, 1px border, or bare label/glyph.
 */
export type ActionAppearance = 'contained' | 'outline' | 'text';

/** Width of the focus-visible ring around action controls. */
export const FOCUS_RING_WIDTH_PX = 3;

interface RoleTokens {
  containedBg: ModeToken;
  containedBgHover: ModeToken;
  containedBgPressed: ModeToken;
  containedText: ModeToken;
  accentText: ModeToken;
  outlineBorder: ModeToken;
  outlineBorderHover: ModeToken;
  subtleHoverBg: ModeToken;
  subtlePressedBg: ModeToken;
  focusRing: ModeToken;
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
    outlineBorderHover: border.primary.defaultHover,
    subtleHoverBg: surface.primary.subtleHover,
    subtlePressedBg: surface.primary.subtlePressed,
    focusRing: border.primary.focus,
  },
  secondary: {
    containedBg: surface.default.default,
    containedBgHover: surface.default.defaultHover,
    containedBgPressed: surface.default.defaultPressed,
    containedText: text.default.body,
    accentText: text.default.body,
    outlineBorder: border.default.default,
    outlineBorderHover: border.default.defaultHover,
    subtleHoverBg: surface.default.default,
    subtlePressedBg: surface.default.defaultHover,
    focusRing: border.default.defaultPressed,
  },
  success: {
    containedBg: surface.success.default,
    containedBgHover: surface.success.defaultHover,
    containedBgPressed: surface.success.defaultPressed,
    containedText: text.success.caption,
    accentText: text.success.caption,
    outlineBorder: border.success.default,
    outlineBorderHover: border.success.defaultHover,
    subtleHoverBg: surface.success.subtleHover,
    subtlePressedBg: surface.success.subtlePressed,
    focusRing: border.success.focus,
  },
  error: {
    containedBg: surface.error.default,
    containedBgHover: surface.error.defaultHover,
    containedBgPressed: surface.error.defaultPressed,
    containedText: text.error.caption,
    accentText: text.error.caption,
    outlineBorder: border.error.default,
    outlineBorderHover: border.error.defaultHover,
    subtleHoverBg: surface.error.subtleHover,
    subtlePressedBg: surface.error.subtlePressed,
    focusRing: border.error.focus,
  },
  warning: {
    containedBg: surface.warning.default,
    containedBgHover: surface.warning.defaultHover,
    containedBgPressed: surface.warning.defaultPressed,
    containedText: text.warning.caption,
    accentText: text.warning.caption,
    outlineBorder: border.warning.default,
    outlineBorderHover: border.warning.defaultHover,
    subtleHoverBg: surface.warning.subtleHover,
    subtlePressedBg: surface.warning.subtlePressed,
    focusRing: border.warning.focus,
  },
};

/**
 * Expands `{ light, dark }` token pairs into a CSS object: light
 * values inline, dark values behind `theme.applyStyles('dark', ...)`.
 */
export function paired(
  theme: Theme,
  styles: Record<string, ModeToken>
): CSSObject {
  const light: CSSObject = {};
  const dark: CSSObject = {};
  for (const [property, token] of Object.entries(styles)) {
    light[property] = token.light;
    dark[property] = token.dark;
  }
  return { ...light, ...theme.applyStyles('dark', dark) };
}

export function focusRing(theme: Theme, token: ModeToken): CSSObject {
  return {
    boxShadow: `0 0 0 ${FOCUS_RING_WIDTH_PX}px ${token.light}`,
    ...theme.applyStyles('dark', {
      boxShadow: `0 0 0 ${FOCUS_RING_WIDTH_PX}px ${token.dark}`,
    }),
  };
}

/**
 * Full state styling (resting / hover / pressed / focus-visible /
 * disabled) for one variant + appearance combination, in both colour
 * schemes.
 */
export function appearanceStyles(
  theme: Theme,
  variant: ActionVariant,
  appearance: ActionAppearance
): CSSObject {
  const role = roleTokens[variant];

  if (appearance === 'contained') {
    return {
      ...paired(theme, {
        backgroundColor: role.containedBg,
        color: role.containedText,
      }),
      '&:hover': paired(theme, { backgroundColor: role.containedBgHover }),
      '&:active': paired(theme, { backgroundColor: role.containedBgPressed }),
      '&.Mui-focusVisible': {
        ...paired(theme, { backgroundColor: role.containedBgHover }),
        ...focusRing(theme, role.focusRing),
      },
      '&.Mui-disabled': paired(theme, {
        backgroundColor: surface.disabled.default,
        color: text.disabled.default,
      }),
    };
  }

  if (appearance === 'outline') {
    return {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderStyle: 'solid',
      ...paired(theme, {
        color: role.accentText,
        borderColor: role.outlineBorder,
      }),
      '&:hover': paired(theme, {
        backgroundColor: role.subtleHoverBg,
        borderColor: role.outlineBorderHover,
      }),
      '&:active': paired(theme, { backgroundColor: role.subtlePressedBg }),
      '&.Mui-focusVisible': focusRing(theme, role.focusRing),
      '&.Mui-disabled': paired(theme, {
        color: text.disabled.default,
        borderColor: border.disabled.default,
      }),
    };
  }

  return {
    backgroundColor: 'transparent',
    ...paired(theme, { color: role.accentText }),
    '&:hover': paired(theme, { backgroundColor: role.subtleHoverBg }),
    '&:active': paired(theme, { backgroundColor: role.subtlePressedBg }),
    '&.Mui-focusVisible': focusRing(theme, role.focusRing),
    '&.Mui-disabled': paired(theme, { color: text.disabled.default }),
  };
}
