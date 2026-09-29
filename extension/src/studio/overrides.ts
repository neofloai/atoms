/**
 * What Studio can change on a component beyond its props: size, spacing,
 * type, icon size and colours, on the component itself or on a part inside
 * it (the `<input>` of a TextField). Every one is a token where Atoms has a
 * scale for it, and every one goes to the developer as a deviation — the
 * library draws its components one way, and these are the places the design
 * asks for another.
 *
 * An override is stored as `overrides[key] = value`, where the key is the
 * property, optionally after the part's selector (`.MuiInputBase-input
 * type`), and the value a token path, or pixels where Atoms has no scale.
 */
import type { Theme } from '@mui/material/styles';
import { colorToken, scaleValue, typeSlot } from './tokens';

export type OverrideKind = 'color' | 'space' | 'size' | 'type' | 'weight' | 'radius' | 'shadow' | 'icon' | 'borderWidth';
export type OverrideGroup = 'Size' | 'Spacing' | 'Type' | 'Colour and border';

export interface OverrideProperty {
  key: string;
  label: string;
  kind: OverrideKind;
  group: OverrideGroup;
}

export const OVERRIDE_PROPERTIES: OverrideProperty[] = [
  { key: 'width', label: 'Width', kind: 'size', group: 'Size' },
  { key: 'height', label: 'Height', kind: 'size', group: 'Size' },
  { key: 'min-width', label: 'Min width', kind: 'size', group: 'Size' },
  { key: 'icon-size', label: 'Icon size', kind: 'icon', group: 'Size' },
  { key: 'padding-inline', label: 'Side padding', kind: 'space', group: 'Spacing' },
  { key: 'padding-block', label: 'Top and bottom padding', kind: 'space', group: 'Spacing' },
  { key: 'padding-top', label: 'Padding top', kind: 'space', group: 'Spacing' },
  { key: 'padding-right', label: 'Padding right', kind: 'space', group: 'Spacing' },
  { key: 'padding-bottom', label: 'Padding bottom', kind: 'space', group: 'Spacing' },
  { key: 'padding-left', label: 'Padding left', kind: 'space', group: 'Spacing' },
  { key: 'gap', label: 'Gap', kind: 'space', group: 'Spacing' },
  { key: 'type', label: 'Font size', kind: 'type', group: 'Type' },
  { key: 'font-weight', label: 'Weight', kind: 'weight', group: 'Type' },
  { key: 'color', label: 'Text colour', kind: 'color', group: 'Colour and border' },
  { key: 'background-color', label: 'Fill', kind: 'color', group: 'Colour and border' },
  { key: 'border-color', label: 'Border colour', kind: 'color', group: 'Colour and border' },
  { key: 'border-width', label: 'Border width', kind: 'borderWidth', group: 'Colour and border' },
  { key: 'border-radius', label: 'Radius', kind: 'radius', group: 'Colour and border' },
  { key: 'box-shadow', label: 'Shadow', kind: 'shadow', group: 'Colour and border' },
];

const byKey = new Map(OVERRIDE_PROPERTIES.map((p) => [p.key, p]));
export const overrideProperty = (key: string) => byKey.get(key);

/** `".MuiInputBase-input type"` → part `.MuiInputBase-input`, property `type`. */
export function splitKey(key: string): { part: string | null; property: string } {
  const i = key.lastIndexOf(' ');
  if (i < 0) return { part: null, property: key };
  return { part: key.slice(0, i), property: key.slice(i + 1) };
}

export const joinKey = (part: string | null, property: string) => (part ? `${part} ${property}` : property);

/** How an override reads to a person: `Side padding → spacing.component.md`, `Font size of .MuiInputBase-input → …`. */
export function describeOverride(key: string, value: string): string {
  const { part, property } = splitKey(key);
  const label = overrideProperty(property)?.label ?? property;
  return `${label}${part ? ` of ${part}` : ''} → ${value}`;
}

const camel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
const px = (v: string) => (/^\d+(\.\d+)?$/.test(v) ? `${v}px` : v);

/** The CSS one override renders, per mode. */
function declarations(property: string, value: string): { light: Record<string, string>; dark: Record<string, string> } {
  const kind = overrideProperty(property)?.kind;
  const light: Record<string, string> = {};
  const dark: Record<string, string> = {};
  const scaled = () => {
    const v = scaleValue(value);
    return typeof v === 'number' ? `${v}px` : String(v ?? value);
  };
  switch (kind) {
    case 'color': {
      const token = colorToken(value);
      if (token) {
        light[camel(property)] = token.light;
        dark[camel(property)] = token.dark;
      }
      break;
    }
    case 'size':
      // Components hold their height with min-height, so a smaller height needs both.
      light[camel(property)] = px(value);
      if (property === 'height') light.minHeight = px(value);
      if (property === 'width') light.minWidth = px(value);
      break;
    case 'space': {
      const v = scaled();
      if (property === 'padding-inline') Object.assign(light, { paddingLeft: v, paddingRight: v });
      else if (property === 'padding-block') Object.assign(light, { paddingTop: v, paddingBottom: v });
      else light[camel(property)] = v;
      break;
    }
    case 'type': {
      const slot = typeSlot(value);
      if (slot) Object.assign(light, { fontSize: `${slot.size}px`, lineHeight: `${slot.leading}px`, letterSpacing: `${slot.letterSpacing}em` });
      break;
    }
    case 'weight':
      light.fontWeight = String(scaleValue(value) ?? value);
      break;
    case 'radius':
      light.borderRadius = scaled();
      break;
    case 'shadow':
      light.boxShadow = String(scaleValue(value) ?? value);
      break;
    case 'borderWidth':
      Object.assign(light, { borderWidth: px(value), borderStyle: 'solid' });
      break;
    default:
      break;
  }
  return { light, dark };
}

/**
 * The `sx` for a component's overrides. `&&` doubles the component's own
 * class, so an override wins over the rules the component writes for its
 * parts (a Button sizes its icons with `.MuiButton-startIcon > *`).
 */
export function overridesSx(overrides?: Record<string, string>) {
  if (!overrides || !Object.keys(overrides).length) return null;
  return (theme: Theme) => {
    const out: Record<string, Record<string, unknown>> = {};
    const at = (selector: string) => (out[selector] ??= {});
    for (const [key, value] of Object.entries(overrides)) {
      const { part, property } = splitKey(key);
      const base = part ? `&& ${part}` : '&&';
      if (property === 'icon-size') {
        Object.assign(at(`${base} svg`), { width: px(value), height: px(value), fontSize: px(value) });
        continue;
      }
      const { light, dark } = declarations(property, value);
      const target = at(base);
      Object.assign(target, light);
      if (Object.keys(dark).length) Object.assign(target, theme.applyStyles('dark', dark));
    }
    return out;
  };
}

/** Token paths an override set uses, for the handover's summary. */
export function overrideTokens(overrides?: Record<string, string>): string[] {
  return Object.values(overrides ?? {}).filter((v) => /^[a-z]+[.[]/.test(v));
}

// ---------------------------------------------------------------- parts

const STATE = /-(size|color|variant|disable|full|focus|adorned|multiline|formControl|text$|outlined|contained|standard|filled|elevation|rounded|vertical|horizontal|hidden|shrink|animated|readOnly)/;
const PREFERRED = /-(root|input|label|icon|startIcon|endIcon|notchedOutline|thumb|track|bar|message|action|avatar|deleteIcon|indicator|wrapper|content|title)$/;

function stableClass(el: Element): string | null {
  const classes = [...el.classList].filter((c) => /^Mui[A-Za-z]+-[a-z][A-Za-z]*$/.test(c));
  return classes.find((c) => PREFERRED.test(c)) ?? classes.find((c) => !STATE.test(c)) ?? null;
}

/**
 * A selector for `el` relative to the component's root element: the nearest
 * MUI part class (`.MuiInputBase-input`), then child steps to the element.
 * `null` when `el` is the root itself.
 */
export function partSelector(el: Element, root: Element): string | null {
  if (el === root || !root.contains(el)) return null;
  const steps: string[] = [];
  let anchored = false;
  for (let e: Element | null = el; e && e !== root; e = e.parentElement) {
    const cls = stableClass(e);
    if (cls) {
      steps.unshift(`.${cls}`);
      anchored = true;
      break;
    }
    const parent = e.parentElement;
    if (!parent) break;
    steps.unshift(`${e.tagName.toLowerCase()}:nth-child(${[...parent.children].indexOf(e) + 1})`);
  }
  const path = steps.join(' > ');
  return anchored ? path : `> ${path}`;
}

/** What each override property reads as on an element now, for the panel's "now" hints. */
export function measuredValue(el: Element, property: string): string {
  const s = (el.ownerDocument.defaultView ?? window).getComputedStyle(el);
  const r = el.getBoundingClientRect();
  const n = (v: string) => `${Math.round(parseFloat(v) * 100) / 100}`;
  switch (property) {
    case 'width':
      return `${n(String(r.width))}px`;
    case 'height':
      return `${n(String(r.height))}px`;
    case 'min-width':
      return s.minWidth;
    case 'icon-size': {
      const svg = el.querySelector('svg');
      const b = svg?.getBoundingClientRect();
      return b ? `${n(String(b.width))}px` : '—';
    }
    case 'padding-inline':
      return s.paddingLeft === s.paddingRight ? s.paddingLeft : `${s.paddingLeft} / ${s.paddingRight}`;
    case 'padding-block':
      return s.paddingTop === s.paddingBottom ? s.paddingTop : `${s.paddingTop} / ${s.paddingBottom}`;
    case 'type':
      return `${n(s.fontSize)} / ${s.lineHeight === 'normal' ? 'normal' : n(s.lineHeight)}`;
    case 'border-width':
      return s.borderTopStyle === 'none' ? 'none' : s.borderTopWidth;
    case 'border-color':
      return s.borderTopColor;
    case 'border-radius':
      return s.borderTopLeftRadius;
    default:
      return s.getPropertyValue(property);
  }
}
