/**
 * Development-only marks for the Atoms Inspector.
 *
 * In a development build every colour a component styles through
 * `paired`, `pairedFocusRing` or `focusRing` also writes a CSS custom
 * property naming the token it came from, next to the value:
 *
 *     background-color: #4949dc;
 *     --atoms-background-color: "surface.primary.default";
 *     --atoms-v: "2.1.0";
 *
 * The inspector reads the declared name, resolves it for the current
 * mode, and compares it with what rendered — an `sx`, a `style`, a
 * global stylesheet or a stale theme shows up as drift instead of as a
 * lookalike token. Being CSS, the marks follow every state selector the
 * value does (`:hover`, `.Mui-focusVisible`, `.Mui-disabled`) and never
 * touch the DOM, so there is nothing to hydrate.
 *
 * Every gate is spelled `process.env.NODE_ENV === 'development'` inline,
 * as the condition of a ternary around the development-only call — never
 * through a shared constant, and never as an early `return`. Bundlers fold
 * that exact expression while parsing, so the call and everything it
 * reaches drop out of a production bundle. `npm run check:dev-marks`
 * proves it on the built package. Test runs (`NODE_ENV=test`) stay
 * unmarked too.
 */
import { namedColorTokens } from '@/src/tokens/paths';
import { ATOMS_VERSION } from '@/src/release/version';

import type { CSSObject } from '@mui/material/styles';
import type { ModeToken } from '@/src/tokens';

type Half = 'light' | 'dark';

/*
 * Everything below the public functions is development-only, and is only
 * ever reached through `process.env.NODE_ENV === 'development' ? … : …`.
 * That shape matters: bundlers fold the condition while parsing and never
 * see the call, so the name table and the colour tokens it walks drop out
 * of a production bundle. An early `return` inside the function does not
 * — the bundler still counts the code after it as used.
 */

/**
 * A `{ light, dark }` pair built from two tokens, for the few places the
 * design takes each scheme's value from a different rung. Use it instead
 * of writing the object by hand so the pair keeps both token names.
 *
 * `lightHalf` / `darkHalf` pick which scheme's value to read from each
 * token — `modePair(t, t, 'light', 'light')` is `t`'s light value in both.
 */
export function modePair(
  lightFrom: ModeToken,
  darkFrom: ModeToken,
  lightHalf: Half = 'light',
  darkHalf: Half = 'dark'
): ModeToken {
  const pair: ModeToken = { light: lightFrom[lightHalf], dark: darkFrom[darkHalf] };
  return process.env.NODE_ENV === 'development'
    ? rememberPair(pair, lightFrom, darkFrom, lightHalf, darkHalf)
    : pair;
}

/**
 * `--atoms-<property>` for each entry, plus the release that drew them.
 * An empty object outside development.
 */
export function tokenMarks(styles: Record<string, ModeToken>): CSSObject {
  return process.env.NODE_ENV === 'development' ? devTokenMarks(styles) : {};
}

/** The focus ring's token, which rides `box-shadow` and so gets a name of its own. */
export function focusRingMark(ring: ModeToken): CSSObject {
  return process.env.NODE_ENV === 'development' ? devFocusRingMark(ring) : {};
}

/**
 * Marks a region of a pattern for the inspector:
 * `<Stack {...atomsRegion('invoice-dashboard', 'toolbar')}>`.
 *
 * Returns `data-atoms-pattern` / `data-atoms-region` attributes in a
 * development build and an empty object otherwise, so a pasted pattern
 * ships nothing extra.
 */
export function atomsRegion(
  pattern: string,
  region: string
): { 'data-atoms-pattern'?: string; 'data-atoms-region'?: string } {
  return process.env.NODE_ENV === 'development'
    ? { 'data-atoms-pattern': pattern, 'data-atoms-region': region }
    : {};
}

// ---------------------------------------------------------------- development only

let names: WeakMap<ModeToken, string> | null = null;

/**
 * Pairs `modePair` assembled from two tokens' halves. The name records
 * both halves (`light path|dark path`), with `@light` / `@dark` when a
 * half is taken from the other scheme, so the inspector can resolve each.
 */
let composed: WeakMap<ModeToken, string> | null = null;

/** Token paths by object, built on first use. */
function nameOf(token: ModeToken): string | undefined {
  if (!names) {
    names = new WeakMap();
    for (const entry of namedColorTokens()) names.set(entry.token, entry.path);
  }
  return names.get(token) ?? composed?.get(token);
}

function rememberPair(
  pair: ModeToken,
  lightFrom: ModeToken,
  darkFrom: ModeToken,
  lightHalf: Half,
  darkHalf: Half
): ModeToken {
  const light = nameOf(lightFrom);
  const dark = nameOf(darkFrom);
  if (light && dark) {
    composed ??= new WeakMap();
    composed.set(
      pair,
      `${light}${lightHalf === 'light' ? '' : '@dark'}|${dark}${darkHalf === 'dark' ? '' : '@light'}`
    );
  }
  return pair;
}

const kebab = (property: string) => property.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** The declared name for one token, or `raw` when a caller handed over a bare colour. */
const declaredName = (token: ModeToken) => `"${nameOf(token) ?? 'raw'}"`;

function devTokenMarks(styles: Record<string, ModeToken>): CSSObject {
  const marks: CSSObject = { '--atoms-v': `"${ATOMS_VERSION}"` };
  for (const [property, token] of Object.entries(styles)) {
    if (property.startsWith('--')) continue;
    marks[`--atoms-${kebab(property)}`] = declaredName(token);
  }
  return marks;
}

function devFocusRingMark(ring: ModeToken): CSSObject {
  return { '--atoms-v': `"${ATOMS_VERSION}"`, '--atoms-focus-ring': declaredName(ring) };
}
