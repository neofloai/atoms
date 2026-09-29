/**
 * Rows: what one element renders, each value matched to its Atoms token.
 * With a development build's marks a colour is `exact` or `drift`
 * against the token its component declared; without them it is a lookup
 * by value. Shared by the panel, the page scan and the export.
 */
import { ATOMS_VERSION } from '../../../src/release/version';
import { parseColor, toHex } from './color';
import { declaredToken, declaredVersion, overrideCause, ownWinner, transitioning } from './drift';
import { styleOf } from './measure';
import { atomsAncestors } from './react';
import {
  lookupColor,
  lookupFamily,
  lookupInset,
  lookupRadius,
  lookupShadow,
  lookupSpace,
  lookupType,
  lookupWeight,
  resolveDeclared,
  type ColorRole,
  type Match,
  type Mode,
} from './tokens';

export { VISUAL_KEY } from '../shared/schema';

export function hasOwnText(el: Element) {
  return [...el.childNodes].some((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
}

export interface Row {
  label: string;
  property: string;
  match: Match;
  swatch?: string;
  css: string;
}

// ---------------------------------------------------------------- rows

/**
 * A colour row. With a declared mark it is `exact` when the rendered
 * value is the declared token's value for this mode and `drift`
 * otherwise, with what caused it. Without one it is a value lookup.
 */
export function colorMatch(el: Element, property: string, value: string, role: ColorRole, mode: Mode, atoms: boolean): Match | null {
  const declared = declaredToken(el, property);
  const byValue = lookupColor(value, role, mode);
  if (!declared) {
    const cause = byValue && atoms ? overrideCause(el, property) : null;
    return byValue && cause ? { ...byValue, status: 'drift', note: [byValue.note, `set by ${cause}`].filter(Boolean).join(' · ') } : byValue;
  }

  const rgba = parseColor(value);
  const hex = rgba && rgba.a > 0 ? toHex(rgba) : 'transparent';
  const shown = byValue?.value ?? hex;
  const d = resolveDeclared(declared, mode);

  if (d.raw) {
    return { status: 'warn', value: shown, tokens: byValue?.tokens ?? [], note: 'the caller passed a raw colour, not a token' };
  }
  if (d.unknown) {
    return { status: 'drift', value: shown, tokens: [d.label], note: `not a token in Atoms ${ATOMS_VERSION} — renamed, removed or newer` };
  }
  if (hex === d.expected && (rgba?.a ?? 1) === 1) {
    return { status: 'exact', value: shown, tokens: [d.label] };
  }
  if (transitioning(el, property)) {
    return { status: 'token', value: shown, tokens: [d.label], note: 'transition running — settles in a moment' };
  }
  const override = overrideCause(el, property);
  if (!override) {
    // The component's own winning rule set a plain value (no token) on purpose.
    const winner = ownWinner(el, property, property);
    if (winner && !winner.marked) {
      return byValue ? { ...byValue, note: [byValue.note, 'set by the component without a token'].filter(Boolean).join(' · ') } : null;
    }
  }
  const other = mode === 'light' ? 'dark' : 'light';
  const version = declaredVersion(el);
  const cause =
    override ??
    (hex === d.other
      ? `matches the ${other} value — switch Mode to ${other[0].toUpperCase()}${other.slice(1)}`
      : version && version !== ATOMS_VERSION
        ? `drawn by Atoms ${version}; the inspector has ${ATOMS_VERSION} values`
        : rgba && rgba.a < 1 && hex === d.expected
          ? `rendered at ${Math.round(rgba.a * 100)}% opacity`
          : 'a theme override or wrapper rendered a different value');
  return { status: 'drift', value: shown, tokens: [d.label], note: `intended ${d.expected} — ${cause}` };
}

/** Marks a non-colour row as drift when something other than the component set it. */
function withOverride(el: Element, property: string, match: Match | null, atoms: boolean): Match | null {
  if (!match || !atoms) return match;
  const cause = overrideCause(el, property);
  if (!cause) return match;
  return { ...match, status: 'drift', note: [match.note, `overridden by ${cause}`].filter(Boolean).join(' · ') };
}

/** Every property worth a row, with its token lookup. */
export function rows(el: Element, mode: Mode, atoms: boolean): Row[] {
  const s = styleOf(el);
  const out: Row[] = [];
  const push = (label: string, property: string, match: Match | null, css: string, swatch?: string) => {
    if (match) out.push({ label, property, match, css, swatch });
  };
  const color = (label: string, property: string, role: ColorRole) => {
    const value = s.getPropertyValue(property);
    push(label, property, colorMatch(el, property, value, role, mode, atoms), `${property}: ${value}`, value);
  };
  const plain = (label: string, property: string, match: Match | null, css: string) =>
    push(label, property, withOverride(el, property, match, atoms), css);

  color('Background', 'background-color', 'background');
  if (s.backgroundImage !== 'none') {
    const from = declaredToken(el, 'gradient-from');
    const to = declaredToken(el, 'gradient-to');
    const image = declaredToken(el, 'background-image');
    const named = from && to ? [`${from} → ${to}`] : image ? [image] : [];
    out.push({
      label: 'Background',
      property: 'background-image',
      match: named.length
        ? { status: 'exact', value: s.backgroundImage.split('(')[0], tokens: named }
        : { status: 'off', value: s.backgroundImage.split('(')[0], tokens: [], note: 'image or gradient — no token' },
      css: `background-image: ${s.backgroundImage}`,
    });
  }

  if (el.namespaceURI === 'http://www.w3.org/2000/svg') {
    color('Fill', 'fill', 'icon');
    color('Stroke', 'stroke', 'icon');
  }

  if (hasOwnText(el) || declaredToken(el, 'color')) color('Text', 'color', 'text');
  if (hasOwnText(el)) {
    const leading = s.lineHeight === 'normal' ? NaN : parseFloat(s.lineHeight);
    const spacing = s.letterSpacing === 'normal' ? 0 : parseFloat(s.letterSpacing);
    plain('Type', 'font-size', lookupType(parseFloat(s.fontSize), leading, spacing), `font-size: ${s.fontSize}; line-height: ${s.lineHeight}; letter-spacing: ${s.letterSpacing}`);
    plain('Weight', 'font-weight', lookupWeight(Number(s.fontWeight)), `font-weight: ${s.fontWeight}`);
    plain('Family', 'font-family', lookupFamily(s.fontFamily), `font-family: ${s.fontFamily}`);
  }

  const sides = ['top', 'right', 'bottom', 'left'] as const;
  const widths = sides.map((side) => (s.getPropertyValue(`border-${side}-style`) === 'none' ? 0 : parseFloat(s.getPropertyValue(`border-${side}-width`))));
  const colours = sides.map((side) => s.getPropertyValue(`border-${side}-color`));
  const drawn = sides.filter((_, i) => widths[i] > 0);
  if (drawn.length) {
    const uniform = drawn.length === 4 && new Set(colours).size === 1 && new Set(widths).size === 1;
    for (const side of uniform ? (['top'] as const) : drawn) {
      const i = sides.indexOf(side);
      const property = `border-${side}-color`;
      const match = colorMatch(el, property, colours[i], 'border', mode, atoms);
      if (match) {
        push(
          uniform ? 'Border' : `Border ${side}`,
          property,
          { ...match, value: `${widths[i]}px · ${match.value}` },
          `border-${uniform ? '' : `${side}-`}width: ${widths[i]}px; border-color: ${colours[i]}`,
          colours[i],
        );
      }
    }
  }

  const ring = declaredToken(el, 'focus-ring');
  if (ring) {
    const d = resolveDeclared(ring, mode);
    const ringColor = /rgba?\([^)]*\)|#[0-9a-f]{3,8}/i.exec(s.boxShadow)?.[0] ?? '';
    const rendered = parseColor(ringColor);
    const hex = rendered ? toHex(rendered) : '';
    push(
      'Focus ring',
      'box-shadow',
      hex === d.expected
        ? { status: 'exact', value: hex, tokens: [d.label] }
        : { status: 'drift', value: hex || 'none', tokens: [d.label], note: `intended ${d.expected} — ${overrideCause(el, 'box-shadow') ?? 'the ring rendered a different colour'}` },
      `box-shadow: ${s.boxShadow}`,
      hex,
    );
  }

  const corners = [s.borderTopLeftRadius, s.borderTopRightRadius, s.borderBottomRightRadius, s.borderBottomLeftRadius];
  if (new Set(corners).size === 1) plain('Radius', 'border-radius', lookupRadius(corners[0]), `border-radius: ${corners[0]}`);
  else corners.forEach((c, i) => plain(`Radius ${['tl', 'tr', 'br', 'bl'][i]}`, 'border-radius', lookupRadius(c), `border-radius: ${corners.join(' ')}`));

  if (!ring) plain('Shadow', 'box-shadow', lookupShadow(s.boxShadow), `box-shadow: ${s.boxShadow}`);

  if (/flex|grid/.test(s.display)) {
    const row = parseFloat(s.rowGap) || 0;
    const col = parseFloat(s.columnGap) || 0;
    if (row === col) plain('Gap', 'row-gap', lookupSpace(row), `gap: ${s.rowGap}`);
    else {
      plain('Row gap', 'row-gap', lookupSpace(row), `row-gap: ${s.rowGap}`);
      plain('Column gap', 'column-gap', lookupSpace(col), `column-gap: ${s.columnGap}`);
    }
  }
  sides.forEach((side, i) =>
    plain(`Padding ${side}`, `padding-${side}`, lookupInset(parseFloat(s.getPropertyValue(`padding-${side}`)), widths[i]), `padding-${side}: ${s.getPropertyValue(`padding-${side}`)}`),
  );
  for (const side of sides) {
    plain(`Margin ${side}`, `margin-${side}`, lookupSpace(parseFloat(s.getPropertyValue(`margin-${side}`))), `margin-${side}: ${s.getPropertyValue(`margin-${side}`)}`);
  }

  if (Number(s.opacity) < 1) {
    out.push({ label: 'Opacity', property: 'opacity', match: { status: 'warn', value: s.opacity, tokens: [], note: 'opacity has no token' }, css: `opacity: ${s.opacity}` });
  }
  return out;
}

// ---------------------------------------------------------------- drift scan

export interface DriftHit {
  el: Element;
  name: string;
  row: string;
  note: string;
}

const SCANNED: [string, string, ColorRole][] = [
  ['Background', 'background-color', 'background'],
  ['Text', 'color', 'text'],
  ['Border', 'border-top-color', 'border'],
  ['Fill', 'fill', 'icon'],
];

/** Every marked element on the page (or inside `within`) whose rendered colour disagrees with what it declared. */
export function scanDrift(mode: Mode, limit = 300, within: Element = document.body): DriftHit[] {
  const hits: DriftHit[] = [];
  for (const el of [within, ...Array.from(within.getElementsByTagName('*'))]) {
    if (el.closest('atoms-inspector')) continue;
    if (!declaredVersion(el)) continue;
    const s = getComputedStyle(el);
    for (const [row, property, role] of SCANNED) {
      if (!declaredToken(el, property)) continue;
      if (property === 'border-top-color' && s.borderTopStyle === 'none') continue;
      const match = colorMatch(el, property, s.getPropertyValue(property), role, mode, true);
      if (match?.status !== 'drift') continue;
      const owner = atomsAncestors(el).find((c) => !c.primitive);
      hits.push({ el, name: owner?.name ?? el.tagName.toLowerCase(), row, note: `${match.tokens[0] ?? ''} · ${match.note ?? ''}` });
      if (hits.length >= limit) return hits;
    }
  }
  return hits;
}
