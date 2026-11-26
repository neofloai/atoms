import type { neofloTheme } from '@/src/theme';
import { fontFamilies, spacing, surface, type ModeToken } from '@/src/tokens';

export type AtomsTheme = typeof neofloTheme;

type StyleValue = ModeToken | string | number | undefined;

const isModeToken = (v: unknown): v is ModeToken => typeof v === 'object' && v !== null && 'light' in v && 'dark' in v;

/**
 * Resolves Atoms `{ light, dark }` tokens for both colour schemes, the same way Atoms' own
 * components do: the light value inline, the dark one under `theme.applyStyles('dark')`.
 *
 * ```ts
 * sx={(theme) => mode(theme, { backgroundColor: surface.layers.card2, color: text.default.b1 })}
 * ```
 */
export function mode(theme: AtomsTheme, styles: Record<string, StyleValue>): Record<string, unknown> {
  const light: Record<string, string | number> = {};
  const dark: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(styles)) {
    if (value === undefined) continue;
    if (isModeToken(value)) {
      light[key] = value.light;
      dark[key] = value.dark;
    } else {
      light[key] = value;
    }
  }
  return Object.keys(dark).length ? { ...light, ...theme.applyStyles('dark', dark) } : light;
}

export const monoFont = fontFamilies.product.mono;

/** Block head icon size; body text indents by this plus the head gap so it lines up with the title. */
export const BLOCK_ICON_PX = 18;

/** Named for screen readers, drawn for nobody: a label whose field already shows what it is. */
export const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  p: 0,
  m: -1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  border: 0,
} as const;

const { xs, sm, lg } = spacing.component;

/**
 * The composer's glow, in place of a drop shadow: a faint haze at rest and a wide one while
 * someone is typing, so the card shows it is active without its border changing colour.
 *
 * Built from tokens rather than written as a colour. The design draws it as `primary[400]` at 6%
 * and 20% over the page, which blend to almost exactly the solid `surface.primary.subtle` and
 * `surface.primary.subtlePressed`; the offsets and blurs are spacing steps. In dark mode the active
 * glow stays on `subtle`, one step quieter than light, because a coloured glow reads stronger on
 * a dark page.
 */
export const composerGlow = {
  rest: {
    light: `0 ${xs}px ${sm}px ${surface.primary.subtle.light}`,
    dark: `0 ${xs}px ${sm}px ${surface.primary.subtle.dark}`,
  },
  active: {
    light: `0 ${xs}px ${lg}px ${surface.primary.subtlePressed.light}`,
    dark: `0 ${xs}px ${lg}px ${surface.primary.subtle.dark}`,
  },
} satisfies Record<string, ModeToken>;
