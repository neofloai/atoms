import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const SRC = '/Users/ankitverma/Downloads/component (1)';
const OUT = '/Users/ankitverma/Desktop/neoflo/atoms/src/tokens';

const light = JSON.parse(readFileSync(`${SRC}/light.tokens.json`, 'utf8'));
const dark = JSON.parse(readFileSync(`${SRC}/dark.tokens.json`, 'utf8'));

function toCamel(key) {
  // "card 4 on-color" -> "card4OnColor"; "card6on-color" -> "card6OnColor"
  // "default-hover" -> "defaultHover"; "heading on-color" -> "headingOnColor"
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

function writeColorFile(filename, varName, header, group) {
  // `surface.ts` declares the shared `ModeToken` type; others re-import it.
  const modeTokenBlock =
    varName === 'surface'
      ? "export interface ModeToken {\n  readonly light: string;\n  readonly dark: string;\n}"
      : "import type { ModeToken } from './surface';\nexport type { ModeToken };";

  const body = `import { colors } from './colors';

${header}

${modeTokenBlock}

export const ${varName} = {
${Object.entries(group)
  .map(([k, v]) => emitColorGroup(k, v))
  .join('\n')}
} as const;

export type ${varName.charAt(0).toUpperCase() + varName.slice(1)}Tokens = typeof ${varName};
`;
  const target = resolve(OUT, filename);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, body, 'utf8');
  console.log('wrote', target);
}

function writeSpacingFile(group) {
  const body = `/**
 * Spacing tokens — aliased to the primitive "Scale" set in Figma.
 *
 * Numeric values are pixels and map directly to MUI's spacing helper
 * via the theme. Use these tokens in components/sx rather than raw
 * pixel numbers so future changes propagate cleanly.
 *
 * Generated from \`light.tokens.json\` (Figma DTCG export); kept in
 * sync via the design hand-off process.
 */

export const spacing = {
${emitNumberGroup('component', group.component).trimEnd()}
} as const;

export type SpacingTokens = typeof spacing;
`;
  const target = resolve(OUT, 'spacing.ts');
  writeFileSync(target, body, 'utf8');
  console.log('wrote', target);
}

// surface.ts
const surfaceHeader = `/**
 * Surface semantic tokens.
 *
 * Generated from Figma DTCG export (\`light.tokens.json\` +
 * \`dark.tokens.json\`). Every leaf is a \`{ light, dark }\` pair so
 * components automatically pick up the right value when the MUI
 * colour scheme flips.
 *
 * Groups:
 *   - \`layers\`        -> page background + four nested card surfaces
 *                       (cards 4–6 are "on-color" inverse variants)
 *   - \`default\`       -> neutral default surface + hover/pressed states
 *   - \`<role>\`        -> primary, information, success, error, warning
 *                       each with default/default-hover/default-pressed
 *                       plus subtle/subtle-hover/subtle-pressed
 *   - \`disabled\`      -> single disabled surface
 *
 * \`information\` corresponds to MUI's \`info\` palette role; values are
 * sourced from the \`purple\` raw scale.`;

writeColorFile(
  'surface.ts',
  'surface',
  surfaceHeader + '\n */',
  collected.surface
);

// border.ts
const borderHeader = `/**
 * Border semantic tokens.
 *
 * Mirrors the shape of \`surface\` — same groups (\`layers\`, \`default\`,
 * per-role, \`disabled\`) but interaction states are \`default\` /
 * \`defaultHover\` / \`focus\` (no \`pressed\`).
 *
 * Generated from the Figma DTCG export.`;

writeColorFile(
  'border.ts',
  'border',
  borderHeader + '\n */',
  collected.border
);

// text.ts
const textHeader = `/**
 * Text semantic tokens.
 *
 * Per the Figma export, each role exposes typography *slots* rather
 * than interaction states:
 *
 *   text.default.{ heading, body, caption, placeholder,
 *                  headingOnColor, bodyOnColor, captionOnColor,
 *                  placeholderOnColor }
 *   text.primary.{ heading, body, caption, placeholder }
 *   text.information.{ ... } (mirrors primary)
 *   text.success.{ heading, body, caption, onColorHover }
 *   text.error.{ ... }    (mirrors success)
 *   text.warning.{ ... }  (mirrors success)
 *   text.disabled.{ default, onColor }
 *
 * Generated from the Figma DTCG export.`;

writeColorFile(
  'text.ts',
  'text',
  textHeader + '\n */',
  collected.text
);

// icon.ts (NEW)
const iconHeader = `/**
 * Icon semantic tokens.
 *
 * Identical shape to \`text\` — designers use the same typography slots
 * (heading/body/caption/placeholder, role-specific on-color-hover) for
 * icon colours so an icon next to a body string can pick up the
 * matching token automatically.
 *
 * Generated from the Figma DTCG export.`;

writeColorFile(
  'icon.ts',
  'icon',
  iconHeader + '\n */',
  collected.icon
);

writeSpacingFile(collected.spacing);

console.log('done');
