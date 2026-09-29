/**
 * Declared intent versus what rendered.
 *
 * A development build of Atoms writes `--atoms-<property>: "<token>"` next
 * to every colour it styles (see `src/components/_shared/devMarks.ts`).
 * This module reads those marks, lists the ones each interaction state
 * declares, and — when the rendered value disagrees — names what won
 * instead: an inline style, an `sx` prop, or a stylesheet outside Atoms.
 */
import { fiberOf, firstHost, type Fiber } from './react';

// ---------------------------------------------------------------- marks

/** Colour properties a component can mark, plus the focus ring and gradient stops. */
const KNOWN = [
  'background-color',
  'background-image',
  'color',
  'border-color',
  'border-top-color',
  'border-right-color',
  'border-bottom-color',
  'border-left-color',
  'outline-color',
  'fill',
  'stroke',
  'caret-color',
  'text-decoration-color',
  'focus-ring',
  'gradient-from',
  'gradient-to',
  'v',
];

const registered = new Set<string>();

/** Every `--atoms-*` name any stylesheet on the page declares. */
function scanNames(): Set<string> {
  const names = new Set(KNOWN.map((n) => `--atoms-${n}`));
  forEachRule((rule) => {
    for (const match of rule.cssText.matchAll(/--atoms-[a-z-]+/g)) names.add(match[0]);
  });
  return names;
}

/**
 * Custom properties inherit by default, so a child would appear to
 * declare its parent's token. Registering each mark as non-inheriting
 * makes it report only what the element's own rules say. Retroactive, so
 * it can run after the page has styled itself.
 */
export function registerMarks(): boolean {
  let found = false;
  for (const name of scanNames()) {
    if (name === '--atoms-v') found ||= hasRuleWith(name);
    if (registered.has(name)) continue;
    registered.add(name);
    try {
      CSS.registerProperty({ name, syntax: '*', inherits: false });
    } catch {
      // Already registered by an earlier session on this page.
    }
  }
  return found;
}

function hasRuleWith(name: string): boolean {
  let hit = false;
  forEachRule((rule) => {
    if (!hit && rule.style.getPropertyValue(name)) hit = true;
  });
  return hit;
}

const unquote = (value: string) => value.trim().replace(/^"(.*)"$/, '$1').replace(/\\"/g, '"');

/** The token an element's own rules declare for `property`, if any. */
export function declaredToken(el: Element, property: string): string | null {
  const style = getComputedStyle(el);
  const own = style.getPropertyValue(`--atoms-${property}`);
  if (own.trim()) return unquote(own);
  // `border-color` is marked as the shorthand; each side falls back to it.
  const side = /^border-(top|right|bottom|left)-color$/.test(property);
  const shorthand = side ? style.getPropertyValue('--atoms-border-color') : '';
  return shorthand.trim() ? unquote(shorthand) : null;
}

/** Every token this element's own rules declare, by marked property (`background-color` → `surface.primary.default`). */
export function declaredMarks(el: Element): Record<string, string> {
  const style = getComputedStyle(el);
  const out: Record<string, string> = {};
  for (const name of registered) {
    if (name === '--atoms-v') continue;
    const value = style.getPropertyValue(name);
    if (value.trim()) out[name.slice('--atoms-'.length)] = unquote(value);
  }
  return out;
}

/** The Atoms release that drew this element, when it is marked. */
export function declaredVersion(el: Element): string | null {
  const v = getComputedStyle(el).getPropertyValue('--atoms-v');
  return v.trim() ? unquote(v) : null;
}

/**
 * Every Atoms release whose marks are on the page, read from the
 * stylesheets rather than from elements, so it counts components that
 * are not on screen right now. Empty on a production build or a release
 * from before the marks.
 */
export function pageVersions(): string[] {
  const versions = new Set<string>();
  forEachRule((rule) => {
    const v = rule.style.getPropertyValue('--atoms-v');
    if (v.trim()) versions.add(unquote(v));
  }, isEmotionSheet);
  return [...versions];
}

// ---------------------------------------------------------------- stylesheets

/** Emotion (Atoms, MUI) writes its sheets with a `data-emotion` attribute; everything else is outside CSS. */
function isEmotionSheet(sheet: CSSStyleSheet): boolean {
  const owner = sheet.ownerNode;
  return owner instanceof Element && owner.hasAttribute('data-emotion');
}

function readRules(sheet: CSSStyleSheet): CSSRuleList | null {
  try {
    return sheet.cssRules;
  } catch {
    return null; // cross-origin
  }
}

/** Walks every style rule, descending into `@media`, `@supports` and `@layer`. */
function forEachRule(
  visit: (rule: CSSStyleRule, sheet: CSSStyleSheet, media: string) => void,
  filter?: (sheet: CSSStyleSheet) => boolean,
) {
  const descend = (rules: CSSRuleList, sheet: CSSStyleSheet, media: string) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule) visit(rule, sheet, media);
      else if (rule instanceof CSSMediaRule) {
        if (window.matchMedia(rule.conditionText).matches) descend(rule.cssRules, sheet, rule.conditionText);
      } else if ('cssRules' in rule) descend((rule as CSSGroupingRule).cssRules, sheet, media);
    }
  };
  for (const sheet of Array.from(document.styleSheets)) {
    if (filter && !filter(sheet)) continue;
    const rules = readRules(sheet);
    if (rules) descend(rules, sheet, '');
  }
}

function safeMatches(el: Element, selector: string): boolean {
  try {
    return el.matches(selector);
  } catch {
    return false;
  }
}

/** Splits a selector list on its top-level commas. */
function splitSelectors(list: string): string[] {
  const out: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of list) {
    if (ch === '(' || ch === '[') depth += 1;
    if (ch === ')' || ch === ']') depth -= 1;
    if (ch === ',' && depth === 0) {
      out.push(current.trim());
      current = '';
    } else current += ch;
  }
  if (current.trim()) out.push(current.trim());
  return out;
}

// ---------------------------------------------------------------- states

/** A state marker in a selector, and what the panel calls it. */
const STATE_PATTERNS: [RegExp, string][] = [
  [/:hover\b/g, 'hover'],
  [/:active\b/g, 'pressed'],
  [/\.Mui-focusVisible\b|:focus-visible\b/g, 'focus'],
  [/\.Mui-focused\b|:focus\b(?!-)/g, 'focused'],
  [/\.Mui-disabled\b|:disabled\b/g, 'disabled'],
  [/\.Mui-selected\b|\[aria-selected="?true"?\]/g, 'selected'],
  [/\.Mui-checked\b|:checked\b/g, 'checked'],
  [/\.Mui-expanded\b/g, 'expanded'],
  [/\.Mui-error\b/g, 'error'],
  [/\.Mui-active\b/g, 'active'],
  [/\.Mui-completed\b/g, 'completed'],
];

const STATE_ORDER = ['rest', 'hover', 'pressed', 'focus', 'focused', 'selected', 'checked', 'expanded', 'active', 'completed', 'error', 'disabled'];

export interface StateMarks {
  state: string;
  /** Property (without `--atoms-`) → declared token name. */
  marks: Map<string, string>;
}

/** Strips `:not(...)` so a guard like `:hover:not(.Mui-disabled)` reads as plain hover. */
const stripNots = (selector: string) => selector.replace(/:not\((?:[^()]|\([^()]*\))*\)/g, '');

/**
 * Every state the element's own Atoms rules declare tokens for, read from
 * the stylesheet rather than the live element — so hover, pressed, focus
 * and disabled all show without putting the element into them.
 */
export function declaredStates(el: Element): StateMarks[] {
  const byState = new Map<string, Map<string, string>>();
  forEachRule(
    (rule) => {
      if (!rule.cssText.includes('--atoms-')) return;
      for (const selector of splitSelectors(rule.selectorText)) {
        const states = new Set<string>();
        let base = stripNots(selector);
        for (const [pattern, label] of STATE_PATTERNS) {
          if (pattern.test(base)) states.add(label);
          pattern.lastIndex = 0;
          base = base.replace(pattern, '');
          pattern.lastIndex = 0;
        }
        base = base.trim();
        if (!base || !safeMatches(el, base)) continue;
        const state = states.size ? [...states].sort((a, b) => STATE_ORDER.indexOf(a) - STATE_ORDER.indexOf(b)).join(' + ') : 'rest';
        const marks = byState.get(state) ?? new Map<string, string>();
        for (let i = 0; i < rule.style.length; i += 1) {
          const name = rule.style[i];
          if (!name.startsWith('--atoms-') || name === '--atoms-v') continue;
          marks.set(name.slice('--atoms-'.length), unquote(rule.style.getPropertyValue(name)));
        }
        byState.set(state, marks);
      }
    },
    isEmotionSheet,
  );
  const order = (s: string) => {
    const first = s.split(' + ')[0];
    const i = STATE_ORDER.indexOf(first);
    return (i < 0 ? 99 : i) * 10 + s.split(' + ').length;
  };
  return [...byState.entries()]
    .filter(([, marks]) => marks.size)
    .sort(([a], [b]) => order(a) - order(b))
    .map(([state, marks]) => ({ state, marks }));
}

// ---------------------------------------------------------------- sx

export interface SxEntry {
  /** `''` for the element itself, otherwise the nested selector (`&:hover`, `& .MuiChip-label`). */
  selector: string;
  key: string;
  value: string;
}

/** Stands in for the theme when an `sx` is a function: every read and call returns itself. */
const anyTheme: unknown = new Proxy(function () {}, {
  get: (_, key) => (key === Symbol.toPrimitive ? () => '' : anyTheme),
  apply: () => anyTheme,
});

function show(value: unknown): string {
  if (value === anyTheme) return 'theme(…)';
  if (typeof value === 'string') return `"${value}"`;
  if (typeof value === 'number' || typeof value === 'boolean' || value === null) return String(value);
  if (typeof value === 'function') return 'ƒ';
  if (Array.isArray(value)) return `[${value.map(show).join(', ')}]`;
  if (typeof value === 'object') {
    const entries = Object.entries(value as object);
    return `{ ${entries.map(([k, v]) => `${k}: ${show(v)}`).join(', ')} }`;
  }
  return String(value);
}

const BREAKPOINTS = new Set(['xs', 'sm', 'md', 'lg', 'xl']);

/**
 * Flattens an `sx` prop into one row per property. Functions are called
 * with a stand-in theme — enough to learn which keys they set — arrays
 * are merged, nested selectors keep their selector, and a responsive
 * object (`{ xs: 1, md: 2 }`) stays one row.
 */
export function flattenSx(sx: unknown, selector = ''): SxEntry[] {
  if (!sx) return [];
  if (Array.isArray(sx)) return sx.flatMap((part) => flattenSx(part, selector));
  if (typeof sx === 'function') {
    try {
      return flattenSx((sx as (t: unknown) => unknown)(anyTheme), selector);
    } catch {
      return [{ selector, key: '(function)', value: 'ƒ' }];
    }
  }
  if (typeof sx !== 'object') return [];
  const out: SxEntry[] = [];
  for (const [key, value] of Object.entries(sx as Record<string, unknown>)) {
    const nested = key.includes('&') || key.startsWith(':') || key.startsWith('.') || key.startsWith('@');
    const responsive =
      value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every((k) => BREAKPOINTS.has(k));
    if (nested && value && typeof value === 'object' && !responsive) {
      out.push(...flattenSx(value, key.startsWith(':') ? `&${key}` : key));
    } else if (typeof value === 'function' && !nested) {
      let resolved: unknown;
      try {
        resolved = (value as (t: unknown) => unknown)(anyTheme);
      } catch {
        resolved = value;
      }
      out.push({ selector, key, value: show(resolved) });
    } else {
      out.push({ selector, key, value: show(value) });
    }
  }
  return out;
}

/** Which CSS longhands an `sx` key writes. */
function sxProperties(key: string): string[] {
  const sides = (prefix: string, which: string[]) => which.map((s) => `${prefix}-${s}`);
  const all = ['top', 'right', 'bottom', 'left'];
  const table: Record<string, string[]> = {
    p: sides('padding', all), padding: sides('padding', all),
    px: sides('padding', ['left', 'right']), paddingX: sides('padding', ['left', 'right']), paddingInline: sides('padding', ['left', 'right']),
    py: sides('padding', ['top', 'bottom']), paddingY: sides('padding', ['top', 'bottom']), paddingBlock: sides('padding', ['top', 'bottom']),
    pt: ['padding-top'], pr: ['padding-right'], pb: ['padding-bottom'], pl: ['padding-left'],
    m: sides('margin', all), margin: sides('margin', all),
    mx: sides('margin', ['left', 'right']), marginX: sides('margin', ['left', 'right']),
    my: sides('margin', ['top', 'bottom']), marginY: sides('margin', ['top', 'bottom']),
    mt: ['margin-top'], mr: ['margin-right'], mb: ['margin-bottom'], ml: ['margin-left'],
    gap: ['row-gap', 'column-gap'], rowGap: ['row-gap'], columnGap: ['column-gap'],
    bgcolor: ['background-color'], backgroundColor: ['background-color'], background: ['background-color', 'background-image'],
    color: ['color'],
    border: [...sides('border', all).map((s) => `${s}-color`), ...sides('border', all).map((s) => `${s}-width`)],
    borderColor: sides('border', all).map((s) => `${s}-color`),
    borderRadius: ['border-radius'],
    boxShadow: ['box-shadow'],
    typography: ['font-size', 'line-height', 'font-weight', 'letter-spacing', 'font-family'],
  };
  if (table[key]) return table[key];
  const kebab = key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  // `borderTop`, `paddingLeft`, `fontSize` and the rest are already a property.
  if (/^border-(top|right|bottom|left)$/.test(kebab)) return [`${kebab}-color`, `${kebab}-width`];
  return [kebab];
}

/** Whether a longhand the panel shows is written by an `sx` property. */
function sxWrites(key: string, property: string): boolean {
  const written = sxProperties(key);
  if (property === 'border-radius') return written.some((w) => w.startsWith('border') && w.endsWith('radius'));
  return written.includes(property);
}

/**
 * The nearest fibers carrying an `sx`, with the element each renders
 * first. A wrapper forwards the caller's `sx` object down through MUI's
 * own fibers (`Button` → `MuiButtonRoot`); each object is credited to the
 * outermost fiber holding it, which is the component the caller wrote.
 */
function sxCarriers(el: Element, limit = 12): { fiber: Fiber; root: Element }[] {
  const bySx = new Map<unknown, { fiber: Fiber; root: Element }>();
  let steps = 0;
  for (let fiber = fiberOf(el); fiber && steps < 200 && bySx.size <= limit; fiber = fiber.return, steps += 1) {
    const sx = fiber.memoizedProps?.sx;
    if (typeof fiber.type === 'string' || !sx) continue;
    const root = firstHost(fiber);
    if (root && root.contains(el)) bySx.set(sx, { fiber, root });
  }
  return [...bySx.values()];
}

/** A CSS transition on `property` is still running, so value and mark can briefly disagree. */
export function transitioning(el: Element, property: string): boolean {
  return el.getAnimations().some(
    (a) => a instanceof CSSTransition && a.playState === 'running' && (a.transitionProperty === property || property.startsWith(`${a.transitionProperty}-`)),
  );
}

/** The `sx` entries that land on `el` for `property`, nearest carrier first. */
function sxHitting(el: Element, property: string): { entry: SxEntry; owner: string }[] {
  const hits: { entry: SxEntry; owner: string }[] = [];
  for (const { fiber, root } of sxCarriers(el)) {
    for (const entry of flattenSx(fiber.memoizedProps?.sx)) {
      if (!sxWrites(entry.key, property)) continue;
      const selector = entry.selector.trim();
      let lands = false;
      if (!selector || /^&(:|\.Mui-)/.test(selector)) lands = root === el;
      else if (selector.includes('&')) {
        try {
          const scoped = selector.replace(/&/g, ':scope');
          lands = Array.from(root.querySelectorAll(scoped)).includes(el) || root.matches(selector.replace(/&/g, ''));
        } catch {
          lands = false;
        }
      }
      if (lands) hits.push({ entry, owner: ownerName(fiber) });
    }
    if (hits.length) break;
  }
  return hits;
}

function ownerName(fiber: Fiber): string {
  const t = fiber.type as { displayName?: string; name?: string; render?: { name?: string } } | null;
  return t?.displayName ?? t?.name ?? t?.render?.name ?? 'component';
}

// ---------------------------------------------------------------- causes

/** Shorthands that also set a longhand the panel reports. */
function propertyFamily(property: string): string[] {
  const out = [property];
  const side = /^(padding|margin)-(top|right|bottom|left)$/.exec(property);
  if (side) out.push(side[1], `${side[1]}-${side[2] === 'top' || side[2] === 'bottom' ? 'block' : 'inline'}`);
  const border = /^border-(top|right|bottom|left)-(color|width)$/.exec(property);
  if (border) out.push(`border-${border[2]}`, `border-${border[1]}`, 'border');
  if (property === 'background-color' || property === 'background-image') out.push('background');
  if (/^(row|column)-gap$/.test(property)) out.push('gap');
  if (/^font-|^line-height$/.test(property)) out.push('font');
  return out;
}

/** The last rule outside Atoms that matches `el` and sets `property`. */
function outsideRule(el: Element, property: string): string | null {
  const family = propertyFamily(property);
  let found: string | null = null;
  forEachRule(
    (rule, sheet, media) => {
      const set = family.find((p) => rule.style.getPropertyValue(p));
      if (!set) return;
      const selector = splitSelectors(rule.selectorText).find((s) => safeMatches(el, s));
      if (!selector) return;
      const file = sheet.href ? sheet.href.split('/').pop()?.split('?')[0] : 'an inline <style>';
      found = `${selector} { ${set}: ${rule.style.getPropertyValue(set)} } in ${file}${media ? ` (${media})` : ''}`;
    },
    (sheet) => !isEmotionSheet(sheet),
  );
  return found;
}

/**
 * What set `property` on `el`, other than the component: an inline
 * style, an `sx`, or a stylesheet outside Atoms. `null` when the
 * component's own rules are the only source.
 */
export function overrideCause(el: Element, property: string): string | null {
  const inline = propertyFamily(property).find((p) => (el as HTMLElement).style?.getPropertyValue(p));
  if (inline) return `style prop sets ${inline}: ${(el as HTMLElement).style.getPropertyValue(inline)}`;
  const sx = sxHitting(el, property)[0];
  if (sx) {
    const where = sx.entry.selector ? `'${sx.entry.selector}': { ${sx.entry.key}: ${sx.entry.value} }` : `${sx.entry.key}: ${sx.entry.value}`;
    return `sx on ${sx.owner} — ${where}`;
  }
  const outside = outsideRule(el, property);
  if (outside) return `outside CSS — ${outside}`;
  return null;
}

// ---------------------------------------------------------------- cascade

/** `[ids, classes + attributes + pseudo-classes, elements]` for one selector — enough to rank Emotion's rules. */
function specificity(selector: string): [number, number, number] {
  let rest = selector;
  let a = 0, b = 0, c = 0;
  // `:not(x)` / `:is(x)` count as their argument; `:where(x)` counts nothing.
  rest = rest.replace(/:where\((?:[^()]|\([^()]*\))*\)/g, '');
  rest = rest.replace(/:(?:not|is|has)\(((?:[^()]|\([^()]*\))*)\)/g, (_, inner: string) => {
    const [ia, ib, ic] = specificity(inner);
    a += ia; b += ib; c += ic;
    return '';
  });
  rest = rest.replace(/\[[^\]]*\]/g, () => { b += 1; return ''; });
  rest = rest.replace(/::[\w-]+/g, () => { c += 1; return ''; });
  rest = rest.replace(/#[\w-]+/g, () => { a += 1; return ''; });
  rest = rest.replace(/\.[\w-]+|:[\w-]+/g, () => { b += 1; return ''; });
  rest.replace(/(^|[\s>+~])([a-zA-Z][\w-]*)/g, (m) => { c += 1; return m; });
  return [a, b, c];
}

const outranks = (x: [number, number, number], y: [number, number, number]) =>
  x[0] !== y[0] ? x[0] > y[0] : x[1] !== y[1] ? x[1] > y[1] : x[2] >= y[2];

/**
 * The Atoms/MUI rule that wins `property` for `el` as it is right now
 * (live `:hover` and all), and whether that rule carries the property's
 * mark. A winner without a mark is the component setting a plain value
 * on purpose — `transparent` on a selected tab's hover, say — which is
 * not drift even though a lower rule declared a token.
 */
export function ownWinner(el: Element, property: string, mark: string): { marked: boolean; value: string } | null {
  const family = propertyFamily(property);
  let best: { spec: [number, number, number]; marked: boolean; value: string } | null = null;
  forEachRule(
    (rule) => {
      const set = family.find((p) => rule.style.getPropertyValue(p));
      if (!set) return;
      for (const selector of splitSelectors(rule.selectorText)) {
        if (!safeMatches(el, selector)) continue;
        const spec = specificity(selector);
        if (!best || outranks(spec, best.spec)) {
          best = {
            spec,
            marked: !!rule.style.getPropertyValue(`--atoms-${mark}`) || (mark.startsWith('border-') && !!rule.style.getPropertyValue('--atoms-border-color')),
            value: rule.style.getPropertyValue(set),
          };
        }
      }
    },
    isEmotionSheet,
  );
  return best;
}

// ---------------------------------------------------------------- theme variables

/** The last Atoms/MUI rule matching `el` that declares `property` through a `var()`, e.g. `var(--mui-palette-text-primary)`. */
export function declaredVariable(el: Element, property: string): string | null {
  let found: string | null = null;
  forEachRule(
    (rule) => {
      const value = rule.style.getPropertyValue(property);
      if (!value.includes('var(')) return;
      if (splitSelectors(rule.selectorText).some((s) => safeMatches(el, s))) found = value.trim();
    },
    isEmotionSheet,
  );
  return found;
}
