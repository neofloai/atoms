/**
 * Reverse token lookup: a computed value in, the Atoms token path out.
 *
 * Everything is built from `src/tokens` at bundle time, so the names are
 * exactly the import paths a developer writes (`surface.layers.card1`,
 * `text.primary[1]`, `text.default['heading on-color']`).
 */
import {
  colors,
  elevation,
  fontFamilies,
  fontWeights,
  radius,
  responsive,
  spacing,
  typography,
} from '../../../src/tokens';
import { namedColorTokens, pathSegment as segment, type ColorTokenCategory } from '../../../src/tokens/paths';
import { deltaE, parseColor, toHex, type Rgba } from './color';

export type Mode = 'light' | 'dark';
export type ColorRole = 'background' | 'text' | 'border' | 'icon';

/**
 * `exact` — the component declared this token and it rendered as declared.
 * `token` — the value is a token meant for this property (matched by value).
 * `warn`  — it is a token, but not the kind this property should use.
 * `drift` — the component declared one thing and something else rendered.
 * `off`   — no token carries it.
 */
export type MatchStatus = 'exact' | 'token' | 'warn' | 'drift' | 'off';

export interface Match {
  status: MatchStatus;
  value: string;
  tokens: string[];
  note?: string;
}

// ---------------------------------------------------------------- colour

type ColorCategory = ColorTokenCategory;

interface ColorEntry {
  path: string;
  category: ColorCategory;
  light: Rgba;
  dark: Rgba;
  lightHex: string;
  darkHex: string;
}

/** The same walk the library's development marks name tokens with, so paths always agree. */
const colorEntries: ColorEntry[] = namedColorTokens().flatMap(({ path, category, token }) => {
  const light = parseColor(token.light);
  const dark = parseColor(token.dark);
  return light && dark ? [{ path, category, light, dark, lightHex: toHex(light), darkHex: toHex(dark) }] : [];
});

const entryByPath = new Map(colorEntries.map((e) => [e.path, e]));

export interface Declared {
  /** The name as the component wrote it. */
  name: string;
  /** What to show: one path, or each scheme's source for a composed pair. */
  label: string;
  /** The hex the declared token has in `mode`, and in the other scheme. */
  expected: string | null;
  other: string | null;
  /** The component was handed a bare colour, not a token. */
  raw: boolean;
  /** The name is not a token this inspector knows — renamed, removed, or newer. */
  unknown: boolean;
}

/**
 * Resolves a declared mark (`surface.primary.default`, or a composed
 * `a|b@light` pair) to the hex it should render in each scheme.
 */
export function resolveDeclared(name: string, mode: Mode): Declared {
  if (name === 'raw') return { name, label: 'raw colour', expected: null, other: null, raw: true, unknown: false };
  const parts = name.split('|');
  const half = (part: string, fallback: Mode) => {
    const [path, forced] = part.split('@') as [string, Mode | undefined];
    const entry = entryByPath.get(path);
    const which = forced ?? fallback;
    return { path, entry, hex: entry ? (which === 'light' ? entry.lightHex : entry.darkHex) : null };
  };
  const lightHalf = half(parts[0], 'light');
  const darkHalf = half(parts[1] ?? parts[0], 'dark');
  const unknown = !lightHalf.entry || !darkHalf.entry;
  const label = parts.length > 1 ? `${lightHalf.path} (light) · ${darkHalf.path} (dark)` : parts[0];
  const [mine, theirs] = mode === 'light' ? [lightHalf, darkHalf] : [darkHalf, lightHalf];
  return { name, label, expected: mine.hex, other: theirs.hex, raw: false, unknown };
}

const rampByHex = new Map<string, string>();
for (const [ramp, steps] of Object.entries(colors)) {
  for (const [step, hex] of Object.entries(steps as Record<string, string>)) {
    const key = hex.toLowerCase();
    if (!rampByHex.has(key)) rampByHex.set(key, `colors.${ramp}[${step}]`);
  }
}

const ROLE_CATEGORIES: Record<ColorRole, ColorCategory[]> = {
  background: ['surface'],
  text: ['text'],
  border: ['border'],
  icon: ['icon', 'text'],
};

export function lookupColor(value: string, role: ColorRole, mode: Mode): Match | null {
  const rgba = parseColor(value);
  if (!rgba || rgba.a === 0) return null;
  const hex = toHex(rgba);
  const shown = rgba.a < 1 ? `${hex} · ${Math.round(rgba.a * 100)}%` : hex;
  const preferred = ROLE_CATEGORIES[role];
  const exact = colorEntries.filter((e) => (mode === 'light' ? e.lightHex : e.darkHex) === hex);
  const fitting = exact.filter((e) => preferred.includes(e.category));

  if (fitting.length) {
    return rgba.a < 1
      ? { status: 'warn', value: shown, tokens: fitting.map((e) => e.path), note: 'token colour with opacity applied' }
      : { status: 'token', value: shown, tokens: fitting.map((e) => e.path) };
  }
  if (exact.length) {
    return {
      status: 'warn',
      value: shown,
      tokens: exact.map((e) => e.path),
      note: `a ${[...new Set(exact.map((e) => e.category))].join(' / ')} token used as ${role === 'background' ? 'a background' : `a ${role} colour`}`,
    };
  }
  const ramp = rampByHex.get(hex);
  if (ramp) {
    return { status: 'off', value: shown, tokens: [ramp], note: 'raw ramp step — it has no dark value' };
  }

  let nearest: ColorEntry | null = null;
  let best = Infinity;
  for (const entry of colorEntries) {
    if (!preferred.includes(entry.category)) continue;
    const distance = deltaE(rgba, mode === 'light' ? entry.light : entry.dark);
    if (distance < best) {
      best = distance;
      nearest = entry;
    }
  }
  return {
    status: 'off',
    value: shown,
    tokens: [],
    note: nearest ? `not a token · nearest ${nearest.path} (ΔE ${best.toFixed(1)})` : 'not a token',
  };
}

// ---------------------------------------------------------------- spacing

const round = (n: number) => Math.round(n * 100) / 100;
const same = (a: number, b: number) => Math.abs(a - b) < 0.05;
const px = (n: number) => `${round(n)}px`;

const spaceScale = Object.entries(spacing.component)
  .map(([key, value]) => ({ path: `spacing.component${segment(key)}`, value }))
  .sort((a, b) => a.value - b.value);

const pageSpaceScale = (Object.keys(responsive) as (keyof typeof responsive)[]).flatMap((bp) =>
  Object.entries(responsive[bp].spacing).map(([key, value]) => ({
    path: `responsive.${bp}.spacing${segment(key)}`,
    value,
  })),
);

/** Spacing for a padding, margin, gap, or measured distance. Zero returns null. */
export function lookupSpace(value: number): Match | null {
  if (same(value, 0)) return null;
  const magnitude = Math.abs(value);
  const exact = spaceScale.filter((s) => same(s.value, magnitude));
  if (exact.length) return { status: 'token', value: px(value), tokens: exact.map((s) => s.path) };

  const page = pageSpaceScale.filter((s) => same(s.value, magnitude));
  if (page.length) {
    return {
      status: 'warn',
      value: px(value),
      tokens: page.map((s) => s.path),
      note: 'page-scale spacing, not spacing.component',
    };
  }
  const below = [...spaceScale].reverse().find((s) => s.value < magnitude);
  const above = spaceScale.find((s) => s.value > magnitude);
  const between = [below, above]
    .filter(Boolean)
    .map((s) => `${s!.path} (${s!.value})`)
    .join(' and ');
  return { status: 'off', value: px(value), tokens: [], note: `not a token · between ${between}` };
}

/**
 * Padding next to a border. Atoms components often pad `step - border`
 * so the visible inset lands on the scale (a 1px border plus 7px padding
 * is an 8px inset), which reads as the token it was built from.
 */
export function lookupInset(padding: number, borderWidth: number): Match | null {
  const own = lookupSpace(padding);
  if (!own || own.status === 'token' || !borderWidth) return own;
  const total = lookupSpace(padding + borderWidth);
  if (total?.status !== 'token') return own;
  return {
    status: 'token',
    value: px(padding),
    tokens: total.tokens,
    note: `${px(padding)} + ${px(borderWidth)} border = ${px(padding + borderWidth)} inset`,
  };
}

/** The token name alone, for a label on the canvas. */
export function spaceLabel(value: number): string {
  const match = lookupSpace(value);
  if (!match || match.status !== 'token') return px(value);
  return `${px(value)} · ${match.tokens[0].split('.').pop()}`;
}

// ---------------------------------------------------------------- radius

const radiusScale = Object.entries(radius).map(([key, value]) => ({ path: `radius${segment(key)}`, value }));

export function lookupRadius(value: string): Match | null {
  if (value.endsWith('%')) {
    return { status: 'warn', value, tokens: [], note: 'percentage radius — radius.full draws a pill or circle' };
  }
  const n = parseFloat(value);
  if (Number.isNaN(n) || same(n, 0)) return null;
  const exact = radiusScale.filter((r) => same(r.value, n) || (r.path === 'radius.full' && n >= 999));
  if (exact.length) return { status: 'token', value: px(n), tokens: exact.map((r) => r.path) };
  const nearest = radiusScale
    .filter((r) => r.value < 999)
    .reduce((a, b) => (Math.abs(b.value - n) < Math.abs(a.value - n) ? b : a));
  return { status: 'off', value: px(n), tokens: [], note: `not a token · nearest ${nearest.path} (${nearest.value})` };
}

// ---------------------------------------------------------------- type

interface TypeSlot {
  path: string;
  size: number;
  leading: number;
  letterSpacing?: number;
}

const typeScale: TypeSlot[] = Object.entries(typography).flatMap(([group, slots]) =>
  Object.entries(slots).map(([slot, s]) => ({
    path: `typography.${group}${segment(slot)}`,
    size: s.size,
    leading: s.leading,
    letterSpacing: s.letterSpacing,
  })),
);

const pageTypeScale: TypeSlot[] = (Object.keys(responsive) as (keyof typeof responsive)[]).flatMap((bp) =>
  (['headings', 'body'] as const).flatMap((group) =>
    Object.entries(responsive[bp][group]).map(([slot, s]) => ({
      path: `responsive.${bp}.${group}${segment(slot)}`,
      size: s.size,
      leading: s.leading,
    })),
  ),
);

/** `leading` is NaN for `line-height: normal`. */
export function lookupType(size: number, leading: number, letterSpacingPx: number): Match {
  const shown = Number.isNaN(leading) ? `${round(size)} / normal` : `${round(size)} / ${round(leading)}`;
  const full = typeScale.filter((t) => same(t.size, size) && same(t.leading, leading));
  if (full.length) {
    const slot = full[0];
    const expected = (slot.letterSpacing ?? 0) * size;
    if (Math.abs(expected - letterSpacingPx) > 0.05) {
      return {
        status: 'warn',
        value: shown,
        tokens: full.map((t) => t.path),
        note: `letter-spacing ${round(letterSpacingPx)}px, the slot sets ${round(expected)}px`,
      };
    }
    return { status: 'token', value: shown, tokens: full.map((t) => t.path) };
  }
  const sizeOnly = typeScale.filter((t) => same(t.size, size));
  if (sizeOnly.length) {
    return {
      status: 'warn',
      value: shown,
      tokens: sizeOnly.map((t) => t.path),
      note: `size matches, the slot's leading is ${sizeOnly.map((t) => t.leading).join(' / ')}`,
    };
  }
  const page = pageTypeScale.filter((t) => same(t.size, size) && (Number.isNaN(leading) || same(t.leading, leading)));
  if (page.length) {
    return { status: 'warn', value: shown, tokens: page.map((t) => t.path), note: 'page-scale type, not the product slots' };
  }
  const nearest = typeScale.reduce((a, b) => (Math.abs(b.size - size) < Math.abs(a.size - size) ? b : a));
  return {
    status: 'off',
    value: shown,
    tokens: [],
    note: `not a type slot · nearest ${nearest.path} (${nearest.size}/${nearest.leading})`,
  };
}

export function lookupWeight(weight: number): Match {
  const exact = Object.entries(fontWeights).filter(([, w]) => w === weight);
  if (exact.length) return { status: 'token', value: String(weight), tokens: exact.map(([k]) => `fontWeights.${k}`) };
  return { status: 'off', value: String(weight), tokens: [], note: 'DM Sans ships 400, 500 and 600' };
}

/** The literal family names inside each token's stack, first one wins. */
const familyTokens = Object.entries(fontFamilies).flatMap(([group, stacks]) =>
  Object.entries(stacks).map(([key, stack]) => ({
    path: `fontFamilies.${group}.${key}`,
    first: /"([^"]+)"/.exec(stack as string)?.[1].toLowerCase() ?? '',
  })),
);

/** `__DM_Sans_4a2b1c`, `'DM Sans Fallback'` and `"DM Sans"` all read as `dm sans`. */
function familyName(raw: string): string {
  return raw
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .replace(/^_+/, '')
    .replace(/_/g, ' ')
    .replace(/\s+[0-9a-f]{5,}$/i, '')
    .replace(/\s+fallback$/i, '')
    .toLowerCase();
}

export function lookupFamily(computed: string): Match {
  const families = computed.split(',').map(familyName);
  const first = computed.split(',')[0].trim().replace(/^['"]|['"]$/g, '');
  for (const family of families) {
    const hits = familyTokens.filter((t) => t.first === family);
    // Marketing's serif is the product serif; name the product token first.
    if (hits.length) return { status: 'token', value: first, tokens: hits.map((t) => t.path) };
  }
  return { status: 'off', value: first, tokens: [], note: 'not an Atoms font family' };
}

// ---------------------------------------------------------------- elevation

let shadowByComputed: Map<string, string> | null = null;

/** Tokens are authored strings; compare them the way the browser serialises them. */
function canonicalShadows(): Map<string, string> {
  if (shadowByComputed) return shadowByComputed;
  shadowByComputed = new Map();
  const probe = document.createElement('div');
  probe.style.display = 'none';
  document.documentElement.appendChild(probe);
  for (const [key, value] of Object.entries(elevation)) {
    probe.style.boxShadow = value;
    shadowByComputed.set(getComputedStyle(probe).boxShadow, `elevation.${key}`);
  }
  probe.remove();
  return shadowByComputed;
}

export function lookupShadow(computed: string): Match | null {
  if (!computed || computed === 'none') return null;
  const token = canonicalShadows().get(computed);
  if (token) return { status: 'token', value: token.replace('elevation.', ''), tokens: [token] };
  return { status: 'off', value: 'custom shadow', tokens: [], note: 'not an elevation token' };
}
