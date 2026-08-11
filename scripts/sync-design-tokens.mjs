import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(SCRIPT_DIR, '..');

// Where the designer's DTCG exports land. Override per-run with
// TOKENS_SEMANTIC / TOKENS_PRIMITIVE / TOKENS_RESPONSIVE when the
// download lands somewhere else (Figma suffixes repeat downloads with
// " (1)", " 3", etc.).
const SEMANTIC_SRC = process.env.TOKENS_SEMANTIC ?? '/Users/ankitverma/Downloads/component (1)';
const PRIMITIVE_SRC =
  process.env.TOKENS_PRIMITIVE ?? '/Users/ankitverma/Downloads/Mode 1.tokens 3.json';
const RESPONSIVE_SRC = process.env.TOKENS_RESPONSIVE ?? '/Users/ankitverma/Downloads/responsive';

// Where to write. Point at a scratch dir to diff a sync before taking it.
const OUT = process.env.TOKENS_OUT ?? resolve(ROOT, 'src/tokens');

const light = JSON.parse(readFileSync(`${SEMANTIC_SRC}/light.tokens.json`, 'utf8'));
const dark = JSON.parse(readFileSync(`${SEMANTIC_SRC}/dark.tokens.json`, 'utf8'));
const primitive = JSON.parse(readFileSync(PRIMITIVE_SRC, 'utf8'));
const desktop = JSON.parse(readFileSync(`${RESPONSIVE_SRC}/Desktop.tokens.json`, 'utf8'));
const mobile = JSON.parse(readFileSync(`${RESPONSIVE_SRC}/Mobile.tokens.json`, 'utf8'));

function toCamel(key) {
  // "card 4 on-color" -> "card4OnColor"; "card6on-color" -> "card6OnColor"
  // "default-hover" -> "defaultHover"; "paragraph spacing" -> "paragraphSpacing"
  // Also normalise digit->letter boundaries so a Figma typo like
  // "card6on-color" (missing space) still capitalises correctly.
  return key
    .toLowerCase()
    .replace(/[-\s]+([a-z0-9])/g, (_, c) => c.toUpperCase())
    .replace(/(\d)([a-z])/g, (_, d, c) => `${d}${c.toUpperCase()}`);
}

function aliasToRef(name) {
  // "grey/100" -> { scale: 'grey', shade: '100' }
  if (!name) return null;
  const [scale, shade] = name.split('/');
  return { scale, shade };
}

// Collect leaves into category trees: { surface: { layers: { page: {...}, ...} } }
function collect(node, lightNode, darkNode) {
  const out = {};
  for (const key of Object.keys(node).filter((k) => !k.startsWith('$'))) {
    const value = node[key];
    const lightVal = lightNode?.[key];
    const darkVal = darkNode?.[key];
    if (value && value.$type) {
      // leaf
      const lAlias = lightVal?.$extensions?.['com.figma.aliasData']?.targetVariableName;
      const dAlias = darkVal?.$extensions?.['com.figma.aliasData']?.targetVariableName;
      out[toCamel(key)] = {
        type: value.$type,
        lightAlias: aliasToRef(lAlias),
        darkAlias: aliasToRef(dAlias),
        lightHex: lightVal?.$value?.hex,
        darkHex: darkVal?.$value?.hex,
        lightNumber: lightVal?.$value,
        darkNumber: darkVal?.$value,
      };
    } else if (value && typeof value === 'object') {
      out[toCamel(key)] = collect(value, lightVal, darkVal);
    }
  }
  return out;
}

const collected = collect(light, light, dark);

// ---- tier -> name normalisation ----
//
// The 2026-08-11 export replaced every named slot with a bare tier
// number: `surface/default/default-hover` became `surface/default/2`,
// `text/primary/body` became `text/primary/1`, and so on. The public API
// keeps descriptive names — a rename would churn ~100 call sites and buy
// nothing — so each group maps its tiers back here.
//
// Accent roles (primary/information/success/error/warning/orange/purple)
// are now a uniform four-rung ladder in both `text` and `icon`, darkest
// first. Figma numbers the first rung `0` on `text/warning`,
// `text/orange`, and `icon/orange`, and `1` everywhere else — the same
// rung either way, so both map to `body`.
const ACCENT_TIERS = { 0: 'body', 1: 'body', 2: 'caption', 3: 'accent', 4: 'onColorHover' };
// `border` roles end on a focus ring rather than a pressed state.
const BORDER_ROLE_TIERS = { 1: 'default', 2: 'defaultHover', 3: 'focus' };
const STATE_TIERS = { 1: 'default', 2: 'defaultHover', 3: 'defaultPressed' };
// `<category>/default` keeps typography slot names; Figma renamed these
// to the `B1`-`B3` type-scale rungs, which we spell out instead.
// `heading` is an identity rename, listed only to hold its position at
// the top of the ladder.
const DEFAULT_SLOTS = { heading: 'heading', b1: 'body', b2: 'caption', b3: 'placeholder' };

const ACCENT_ROLES = [
  'primary',
  'information',
  'success',
  'error',
  'warning',
  'orange',
  'purple',
];

const TIER_NAMES = {
  surface: { default: STATE_TIERS, soft: STATE_TIERS },
  border: {
    default: STATE_TIERS,
    soft: BORDER_ROLE_TIERS,
    ...Object.fromEntries(ACCENT_ROLES.map((r) => [r, BORDER_ROLE_TIERS])),
  },
  text: { default: DEFAULT_SLOTS, ...Object.fromEntries(ACCENT_ROLES.map((r) => [r, ACCENT_TIERS])) },
  icon: { default: DEFAULT_SLOTS, ...Object.fromEntries(ACCENT_ROLES.map((r) => [r, ACCENT_TIERS])) },
};

// Emit groups in a fixed order so the generated files stay diffable when
// Figma reorders its variable list.
const GROUP_ORDER = [
  'layers',
  'default',
  'soft',
  'primary',
  'information',
  'success',
  'error',
  'warning',
  'orange',
  'purple',
  'disabled',
];

function orderBy(order, entries) {
  const rank = (k) => {
    const i = order.indexOf(k);
    return i === -1 ? order.length : i;
  };
  return entries.sort(([a], [b]) => rank(a) - rank(b));
}

function renameSlots(group, map, path) {
  const out = {};
  // Walk the map's key order, not the export's, so slots land in ladder
  // order (darkest first) no matter how Figma sorts them.
  const seen = new Set();
  for (const [tier, name] of Object.entries(map)) {
    if (!(tier in group)) continue;
    if (out[name]) throw new Error(`${path}: tiers collide on "${name}"`);
    out[name] = group[tier];
    seen.add(tier);
  }
  for (const [key, leaf] of Object.entries(group)) {
    if (seen.has(key)) continue;
    if (/^\d+$/.test(key)) {
      throw new Error(`${path}/${key}: unmapped tier — add it to TIER_NAMES`);
    }
    out[key] = leaf;
  }
  return out;
}

for (const [category, groups] of Object.entries(TIER_NAMES)) {
  for (const [group, map] of Object.entries(groups)) {
    const node = collected[category]?.[group];
    if (!node) continue;
    collected[category][group] = renameSlots(node, map, `${category}/${group}`);
  }
}

// Nothing downstream can express a numeric key readably, so fail loudly
// if a group we do not know about still carries one.
function assertNoTierKeys(node, path) {
  for (const [key, value] of Object.entries(node)) {
    if (/^\d+$/.test(key)) {
      throw new Error(`${path}/${key}: numeric slot survived normalisation`);
    }
    if (value && !value.type) assertNoTierKeys(value, `${path}/${key}`);
  }
}
for (const category of ['surface', 'border', 'text', 'icon']) {
  assertNoTierKeys(collected[category], category);
}

// Express a value either as `colors.<scale>[<shade>]` if aliased, or raw literal.
function colorExpr(alias, hex) {
  if (alias && alias.scale && alias.shade) {
    return `colors.${alias.scale}[${alias.shade}]`;
  }
  // raw hex fallback
  return JSON.stringify((hex || '').toLowerCase());
}

function emitColorGroup(name, group, indent = '  ') {
  const lines = [`${indent}${name}: {`];
  for (const [k, v] of Object.entries(group)) {
    if (v.type === 'color') {
      const lightExpr = colorExpr(v.lightAlias, v.lightHex);
      const darkExpr = colorExpr(v.darkAlias, v.darkHex);
      lines.push(`${indent}  ${k}: { light: ${lightExpr}, dark: ${darkExpr} },`);
    } else {
      lines.push(emitColorGroup(k, v, indent + '  '));
    }
  }
  lines.push(`${indent}},`);
  return lines.join('\n');
}

function emitNumberGroup(name, group, indent = '  ') {
  const lines = [`${indent}${name}: {`];
  for (const [k, v] of Object.entries(group)) {
    if (v.type === 'number') {
      lines.push(`${indent}  ${k}: ${v.lightNumber},`);
    } else {
      lines.push(emitNumberGroup(k, v, indent + '  '));
    }
  }
  lines.push(`${indent}},`);
  return lines.join('\n');
}

function writeFile(filename, body) {
  const target = resolve(OUT, filename);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, body, 'utf8');
  console.log('wrote', target);
}

function writeColorFile(filename, varName, header, group) {
  // `surface.ts` declares the shared `ModeToken` type; others re-import it.
  const modeTokenBlock =
    varName === 'surface'
      ? "export interface ModeToken {\n  readonly light: string;\n  readonly dark: string;\n}"
      : "import type { ModeToken } from './surface';\nexport type { ModeToken };";

  writeFile(
    filename,
    `import { colors } from './colors';

${header}

${modeTokenBlock}

export const ${varName} = {
${orderBy(GROUP_ORDER, Object.entries(group))
  .map(([k, v]) => emitColorGroup(k, v))
  .join('\n')}
} as const;

export type ${varName.charAt(0).toUpperCase() + varName.slice(1)}Tokens = typeof ${varName};
`
  );
}

function writeSpacingFile(group) {
  writeFile(
    'spacing.ts',
    `/**
 * Component spacing tokens — aliased to the primitive "Scale" set in
 * Figma, and unchanged since the first sync.
 *
 * Numeric values are pixels and map directly to MUI's spacing helper
 * via the theme. Use these tokens in components/sx rather than raw
 * pixel numbers so future changes propagate cleanly.
 *
 * This is the *component*-scale ladder (4-96px). The page-scale ladder,
 * which resolves differently per breakpoint, lives in \`./responsive.ts\`.
 *
 * Generated from \`light.tokens.json\` (Figma DTCG export); kept in
 * sync via the design hand-off process.
 */

export const spacing = {
${emitNumberGroup('component', group.component).trimEnd()}
} as const;

export type SpacingTokens = typeof spacing;
`
  );
}

// ---- colors.ts, from the primitive variable collection ----

const COLOR_SCALES = ['grey', 'primary', 'blue', 'red', 'yellow', 'orange', 'purple', 'green'];

function extractScale(name) {
  const node = primitive[name];
  if (!node) throw new Error(`primitive collection is missing scale "${name}"`);
  const out = {};
  for (const [shade, v] of Object.entries(node)) {
    if (v && v.$type === 'color') out[shade] = v.$value.hex.toLowerCase();
  }
  return Object.fromEntries(Object.entries(out).sort(([a], [b]) => Number(a) - Number(b)));
}

function writeColorsFile() {
  const scales = Object.fromEntries(COLOR_SCALES.map((s) => [s, extractScale(s)]));

  writeFile(
    'colors.ts',
    `/**
 * Neoflo raw colour scales — the canonical source of truth.
 *
 * Each scale is a single mode (the designer's "Mode 1"). Light/dark
 * variations of *semantic* tokens (surface, border, text, icon) live in
 * \`./surface.ts\`, \`./border.ts\`, \`./icon.ts\`, and \`./text.ts\` and
 * reference these raw values — they should never hardcode hex.
 *
 * Scale names match the designer's Figma library exactly, including
 * \`red\` (not \`error\`) and \`blue\` (not \`info\`). The MUI palette role
 * mapping in \`src/theme/palette.ts\` translates these scales to the
 * \`error\`, \`info\`, etc. roles.
 *
 * Token files are intentionally framework-free: no React, no MUI
 * imports, no \`'use client'\`. Safe to read from Node scripts
 * (\`scripts/generate.ts\`).
 */

export const colors = {
${COLOR_SCALES.map(
  (s) =>
    `  ${s}: {\n${Object.entries(scales[s])
      .map(([shade, hex]) => `    ${shade}: '${hex}',`)
      .join('\n')}\n  },`
).join('\n')}
} as const;

export type ColorScale = keyof typeof colors;
export type ColorShade<S extends ColorScale> = keyof (typeof colors)[S];
export type ColorToken = (typeof colors)[ColorScale][keyof (typeof colors)[ColorScale]];
`
  );
}

// ---- responsive.ts, from the Desktop/Mobile variable collection ----

const RESPONSIVE_HEADING_SLOTS = { display: 'display', h1: 'h1', h2: 'h2', h3: 'h3', h4: 'h4' };
const RESPONSIVE_BODY_SLOTS = { b1: 'b1', b2: 'b2', caption: 'caption' };

function typeSlot(node) {
  // Figma exports these three as strings ("120"), not numbers.
  return {
    size: Number(node.size.$value),
    leading: Number(node.leading.$value),
    paragraphSpacing: Number(node['paragraph spacing'].$value),
  };
}

function extractBreakpoint(collection) {
  const fonts = collection.fonts;
  const pick = (group, slots) =>
    Object.entries(slots).map(([out, key]) => {
      const node = Object.entries(group).find(([k]) => toCamel(k) === key)?.[1];
      if (!node) throw new Error(`responsive collection is missing fonts slot "${key}"`);
      return [out, typeSlot(node)];
    });

  return {
    frameWidth: collection['frame width'].$value,
    headings: Object.fromEntries(pick(fonts.headings, RESPONSIVE_HEADING_SLOTS)),
    body: Object.fromEntries(pick(fonts.body, RESPONSIVE_BODY_SLOTS)),
    spacing: Object.fromEntries(
      Object.entries(collection.spacing).map(([k, v]) => [toCamel(k), v.$value])
    ),
  };
}

function writeResponsiveFile() {
  const breakpoints = { desktop: extractBreakpoint(desktop), mobile: extractBreakpoint(mobile) };

  const emitSlots = (slots, indent) =>
    Object.entries(slots)
      .map(
        ([name, s]) =>
          `${indent}${name}: { size: ${s.size}, leading: ${s.leading}, paragraphSpacing: ${s.paragraphSpacing} },`
      )
      .join('\n');

  const emitBreakpoint = (name, bp) => `  ${name}: {
    frameWidth: ${bp.frameWidth},
    headings: {
${emitSlots(bp.headings, '      ')}
    },
    body: {
${emitSlots(bp.body, '      ')}
    },
    spacing: {
${Object.entries(bp.spacing)
  .map(([k, v]) => `      ${k}: ${v},`)
  .join('\n')}
    },
  },`;

  writeFile(
    'responsive.ts',
    `/**
 * Breakpoint-scoped tokens — the Figma "responsive" variable collection,
 * whose two modes are Desktop (1440px frame) and Mobile (440px).
 *
 * Two ladders resolve differently per breakpoint:
 *
 *   - \`headings\` / \`body\` — the *page*-scale type ramp used by marketing
 *     and long-form layouts, where a heading shrinks on small screens
 *     (H1 is 80px on desktop, 56px on mobile). Sizes, leading, and
 *     paragraph spacing are all pixels.
 *   - \`spacing\` — the *page*-scale gap ladder, aliased to the primitive
 *     "Scale" set. The mid rungs halve on mobile (\`m\` is 48px on
 *     desktop, 32px on mobile); \`none\`/\`xxs\`/\`xs\`/\`xl\`/\`xxl\` are shared.
 *
 * Neither replaces its component-scale counterpart: \`./typography.ts\`
 * holds the component type ramp (13px \`b1\`, and the \`h5\`/\`h6\` rungs this
 * collection has no equivalent for) and \`./spacing.ts\` the component gap
 * ladder. The two ramps disagree on the shared \`b1\`/\`b2\`/\`caption\` names
 * and on heading leading — see DESIGNER_QUESTIONS.md #27.
 *
 * Generated from the Figma DTCG export (\`Desktop.tokens.json\` +
 * \`Mobile.tokens.json\`) — never hand-edit.
 */

export const responsive = {
${emitBreakpoint('desktop', breakpoints.desktop)}
${emitBreakpoint('mobile', breakpoints.mobile)}
} as const;

export type Breakpoint = keyof typeof responsive;
export type ResponsiveTokens = typeof responsive;
`
  );
}

writeColorsFile();

// surface.ts
const surfaceHeader = `/**
 * Surface semantic tokens.
 *
 * Generated from the Figma "component" collection DTCG export
 * (\`light.tokens.json\` + \`dark.tokens.json\`, 2026-08-11). Every leaf is
 * a \`{ light, dark }\` pair so components automatically pick up the right
 * value when the MUI colour scheme flips.
 *
 * Groups:
 *   - \`layers\`   -> page background + six nested card surfaces
 *                  (cards 4–6 are "on-color" inverse variants)
 *   - \`default\`  -> neutral surface + hover/pressed states
 *   - \`soft\`     -> tinted neutral surface, on the \`primary\` scale
 *   - \`<role>\`   -> primary, information, success, error, warning,
 *                  orange, purple — each with default/defaultHover/
 *                  defaultPressed plus subtle/subtleHover/subtlePressed
 *   - \`disabled\` -> single disabled surface
 *
 * \`information\` corresponds to MUI's \`info\` palette role; values are
 * sourced from the \`blue\` raw scale.
 *
 * The 2026-08-11 export renamed \`default\`'s three slots to bare tier
 * numbers and completed the \`orange\`/\`purple\` ladders, which previously
 * had only a \`default\` rung with \`dark\` mirroring \`light\` as a
 * placeholder. Both are now real per-mode values.
 *
 * Two rungs in that export read as slips rather than intent, and are
 * carried through verbatim rather than second-guessed: \`purple.subtle\`
 * aliases \`primary/50\` where every other purple rung sits on the
 * \`purple\` scale, and \`soft\`'s three dark values are all
 * \`primary/1000\` — a flat ladder. See DESIGNER_QUESTIONS.md #28.
 */`;

writeColorFile('surface.ts', 'surface', surfaceHeader, collected.surface);

// border.ts
const borderHeader = `/**
 * Border semantic tokens.
 *
 * Mirrors the shape of \`surface\` — same groups (\`layers\`, \`default\`,
 * \`soft\`, per-role, \`disabled\`). Interaction states end on a focus ring
 * rather than a pressed state (\`default\` / \`defaultHover\` / \`focus\`);
 * the neutral \`default\` group is the exception and keeps
 * \`defaultPressed\`, matching its \`surface\` counterpart.
 *
 * Generated from the Figma "component" collection DTCG export
 * (2026-08-11), which renamed every slot to a bare tier number and added
 * the \`soft\` group. \`soft\`'s three dark values are all \`grey/900\` — a
 * flat ladder, carried through verbatim. See DESIGNER_QUESTIONS.md #28.
 */`;

writeColorFile('border.ts', 'border', borderHeader, collected.border);

// text.ts
const textHeader = `/**
 * Text semantic tokens.
 *
 * Each role exposes typography *slots* rather than interaction states:
 *
 *   text.default.{ heading, body, caption, placeholder, subtle,
 *                  headingOnColor, bodyOnColor, captionOnColor,
 *                  placeholderOnColor }
 *   text.<role>.{ body, caption, accent, onColorHover }
 *   text.disabled.{ default, onColor }
 *
 * \`<role>\` is primary, information, success, error, warning, orange, or
 * purple. Every one is now a uniform four-rung ladder, darkest first: in
 * light mode \`body\`/\`caption\`/\`accent\`/\`onColorHover\` resolve to shades
 * 700/600/500/400 (800/700/600/500 for the two warm scales, which need an
 * extra rung of contrast against a light page), and dark mode walks the
 * same ladder from the other end.
 *
 * Generated from the Figma "component" collection DTCG export
 * (2026-08-11). That export numbered the slots instead of naming them
 * (\`text/primary/1\`); the names above are ours, mapped in
 * \`scripts/sync-design-tokens.mjs\`. It also dropped the accent roles'
 * darkest \`heading\` rung — nothing consumed it — and replaced the
 * hand-guessed \`orange\`/\`purple\` singletons, whose \`dark\` mirrored
 * \`light\`, with the full per-mode ladder.
 *
 * \`default\` keeps its descriptive slot names; Figma calls
 * \`body\`/\`caption\`/\`placeholder\` \`b1\`/\`b2\`/\`b3\` after the type-scale
 * rungs they pair with.
 */`;

writeColorFile('text.ts', 'text', textHeader, collected.text);

// icon.ts
const iconHeader = `/**
 * Icon semantic tokens.
 *
 * Identical shape to \`text\`, and as of the 2026-08-11 export identical
 * *values* too on every accent role — designers use the same typography
 * slots for icon colours so an icon next to a body string picks up the
 * matching token automatically. Only \`default\`'s \`subtle\` rung and
 * \`disabled.onColor\` still differ between the two.
 *
 * Generated from the Figma "component" collection DTCG export; see
 * \`./text.ts\` for how the numbered Figma slots map to these names.
 */`;

writeColorFile('icon.ts', 'icon', iconHeader, collected.icon);

writeSpacingFile(collected.spacing);
writeResponsiveFile();

console.log('done');
