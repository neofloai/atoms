import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { darkPalette, lightPalette } from '@/src/theme/palette';
import { Swatch } from '../../_components/Swatch';

import type { PaletteOptions, SimplePaletteColorOptions } from '@mui/material/styles';

/**
 * Renders `theme.palette` — every value a consumer can reach through
 * `sx`, `color="…"`, or `theme.palette.*` — for both colour schemes.
 *
 * Values are read live from `src/theme/palette.ts`; nothing here is a
 * literal. That is deliberate: the previous hand-picked swatch grid on
 * this page had drifted several rungs off the real theme (see
 * DESIGNER_QUESTIONS.md #20), and a derived table cannot.
 *
 * Note on the two senses of "light"/"dark": a role's *shades* are named
 * `.light` / `.main` / `.dark`, while each shade also has a value per
 * colour *scheme*. Swatch labels spell out the scheme ("light mode") so
 * the two axes stay legible.
 */

/** A single palette value across both colour schemes. */
interface SchemePair {
  light: string;
  dark: string;
}

interface PaletteEntry {
  /** Dotted accessor, e.g. `palette.primary.main`. */
  token: string;
  pair: SchemePair;
}

interface PaletteGroup {
  name: string;
  description: string;
  variant: 'fill' | 'border' | 'text';
  entries: PaletteEntry[];
}

const ROLE_KEYS = [
  'primary',
  'secondary',
  'error',
  'warning',
  'info',
  'success',
] as const;

const SHADE_KEYS = ['light', 'main', 'dark'] as const;

type RoleKey = (typeof ROLE_KEYS)[number];
type ShadeKey = (typeof SHADE_KEYS)[number];

/**
 * Pairs one accessor's value from each scheme. Both palettes are plain
 * objects declared in-repo, so a `pick` returning `undefined` means the
 * key was removed from `palette.ts` — the caller drops that entry rather
 * than rendering an empty tile.
 */
function schemePair(pick: (p: PaletteOptions) => string | undefined): SchemePair | null {
  const light = pick(lightPalette);
  const dark = pick(darkPalette);
  return light && dark ? { light, dark } : null;
}

function roleShade(p: PaletteOptions, role: RoleKey, shade: ShadeKey): string | undefined {
  // Every role in `palette.ts` is a SimplePaletteColorOptions literal.
  const color = p[role] as SimplePaletteColorOptions | undefined;
  if (!color) return undefined;
  // MUI fills a missing `.light`/`.dark` from `.main` via tonalOffset, so
  // mirror that here rather than showing a hole.
  return shade === 'main' ? color.main : (color[shade] ?? color.main);
}

function entries(
  specs: ReadonlyArray<{ token: string; pick: (p: PaletteOptions) => string | undefined }>
): PaletteEntry[] {
  return specs.flatMap(({ token, pick }) => {
    const pair = schemePair(pick);
    return pair ? [{ token, pair }] : [];
  });
}

const roleGroups: readonly PaletteGroup[] = ROLE_KEYS.map((role) => ({
  name: role,
  description: `color="${role}" on any MUI or Atoms component, or sx={{ color: '${role}.main' }}.`,
  variant: 'fill' as const,
  entries: entries(
    SHADE_KEYS.map((shade) => ({
      token: `palette.${role}.${shade}`,
      pick: (p: PaletteOptions) => roleShade(p, role, shade),
    }))
  ),
}));

const structuralGroups: readonly PaletteGroup[] = [
  {
    name: 'background',
    description:
      'Page and raised-surface fills. `default` is the page, `paper` is anything on top of it (Card, Menu, Dialog).',
    variant: 'fill',
    entries: entries([
      { token: 'palette.background.default', pick: (p) => p.background?.default },
      { token: 'palette.background.paper', pick: (p) => p.background?.paper },
    ]),
  },
  {
    name: 'text',
    description:
      'The three text tiers. `primary` for content, `secondary` for supporting copy, `disabled` for inert controls.',
    variant: 'text',
    entries: entries([
      { token: 'palette.text.primary', pick: (p) => p.text?.primary },
      { token: 'palette.text.secondary', pick: (p) => p.text?.secondary },
      { token: 'palette.text.disabled', pick: (p) => p.text?.disabled },
    ]),
  },
  {
    name: 'divider',
    description: 'Every hairline: Divider, outlined Paper, table and list separators.',
    variant: 'border',
    entries: entries([{ token: 'palette.divider', pick: (p) => p.divider }]),
  },
];

const paletteGroups: readonly PaletteGroup[] = [...roleGroups, ...structuralGroups];

/**
 * Page background of each scheme, used as the backdrop for the `text`
 * and `divider` tiles. Without this they preview against whichever
 * scheme the *viewer* is in, so a light-mode text colour lands on a dark
 * tile and reads as invisible.
 */
const SCHEME_BACKDROP: SchemePair = {
  light: lightPalette.background?.default ?? '',
  dark: darkPalette.background?.default ?? '',
};

function backdropFor(variant: PaletteGroup['variant'], scheme: keyof SchemePair) {
  // `fill` tiles are the colour itself — a backdrop would be invisible.
  return variant === 'fill' ? undefined : SCHEME_BACKDROP[scheme];
}

function PaletteGroupRow({ group }: { group: PaletteGroup }) {
  return (
    <Stack spacing={1.5}>
      <Stack spacing={0.25}>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, textTransform: 'capitalize' }}
        >
          {group.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {group.description}
        </Typography>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: 3,
        }}
      >
        {group.entries.map(({ token, pair }) => (
          <Stack key={token} spacing={1}>
            <Typography
              variant="caption"
              sx={{
                fontFamily: 'var(--font-geist-mono), monospace',
                fontWeight: 600,
                color: 'text.primary',
              }}
            >
              {token}
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Swatch
                label="light mode"
                value={pair.light}
                variant={group.variant}
                backdrop={backdropFor(group.variant, 'light')}
              />
              <Swatch
                label="dark mode"
                value={pair.dark}
                variant={group.variant}
                backdrop={backdropFor(group.variant, 'dark')}
              />
            </Stack>
          </Stack>
        ))}
      </Box>
    </Stack>
  );
}

PaletteGroupRow.displayName = 'PaletteGroupRow';

export function PaletteSection() {
  return (
    <Stack spacing={4}>
      {paletteGroups.map((group) => (
        <PaletteGroupRow key={group.name} group={group} />
      ))}
    </Stack>
  );
}

PaletteSection.displayName = 'PaletteSection';
