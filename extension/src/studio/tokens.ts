/**
 * Every token Studio can pick, read from `src/tokens` at build time, and
 * how each one turns into CSS. Colours stay mode-aware: a picked colour
 * renders its light value in light mode and its dark value in dark.
 */
import { elevation, fontFamilies, fontWeights, radius, responsive, spacing, typography } from '../../../src/tokens';
import { namedColorTokens, pathSegment, type ColorTokenCategory } from '../../../src/tokens/paths';

import type { ModeToken } from '../../../src/tokens';

export interface ColorOption {
  path: string;
  category: ColorTokenCategory;
  token: ModeToken;
}

export const colorOptions: ColorOption[] = namedColorTokens().map((t) => ({ path: t.path, category: t.category, token: t.token }));
const colorByPath = new Map(colorOptions.map((c) => [c.path, c]));

export interface ScaleOption {
  path: string;
  label: string;
  value: number | string;
}

export const spaceOptions: ScaleOption[] = [
  ...Object.entries(spacing.component).map(([k, v]) => ({ path: `spacing.component${pathSegment(k)}`, label: `${k} · ${v}px`, value: v })),
  ...(Object.keys(responsive) as (keyof typeof responsive)[]).flatMap((bp) =>
    Object.entries(responsive[bp].spacing).map(([k, v]) => ({ path: `responsive.${bp}.spacing${pathSegment(k)}`, label: `page ${bp} ${k} · ${v}px`, value: v as number })),
  ),
];

export const radiusOptions: ScaleOption[] = Object.entries(radius).map(([k, v]) => ({ path: `radius${pathSegment(k)}`, label: `${k} · ${v >= 999 ? 'full' : `${v}px`}`, value: v }));

export const shadowOptions: ScaleOption[] = Object.entries(elevation).map(([k, v]) => ({ path: `elevation${pathSegment(k)}`, label: k, value: v }));

export const weightOptions: ScaleOption[] = Object.entries(fontWeights).map(([k, v]) => ({ path: `fontWeights${pathSegment(k)}`, label: `${k} · ${v}`, value: v }));

export const familyOptions: ScaleOption[] = Object.entries(fontFamilies).flatMap(([group, stacks]) =>
  Object.entries(stacks).map(([k, v]) => ({ path: `fontFamilies.${group}${pathSegment(k)}`, label: `${group} ${k}`, value: v as string })),
);

export interface TypeOption {
  path: string;
  label: string;
  size: number;
  leading: number;
  letterSpacing: number;
}

export const typeOptions: TypeOption[] = Object.entries(typography).flatMap(([group, slots]) =>
  Object.entries(slots).map(([slot, s]) => ({
    path: `typography.${group}${pathSegment(slot)}`,
    label: `${slot} · ${s.size}/${s.leading}`,
    size: s.size,
    leading: s.leading,
    letterSpacing: s.letterSpacing,
  })),
);

const scales = new Map<string, ScaleOption>([...spaceOptions, ...radiusOptions, ...shadowOptions, ...weightOptions, ...familyOptions].map((o) => [o.path, o]));
const typeByPath = new Map(typeOptions.map((t) => [t.path, t]));

export function colorToken(path: string | undefined): ModeToken | null {
  if (!path) return null;
  const clean = path.split('|')[0].replace(/@(light|dark)$/, '');
  return colorByPath.get(clean)?.token ?? null;
}

export const scaleValue = (path: string) => scales.get(path)?.value;
export const typeSlot = (path: string) => typeByPath.get(path);

/** What each style key edits, and which tokens it offers. */
export type StyleKind = 'color' | 'space' | 'size' | 'radius' | 'shadow' | 'type' | 'weight' | 'family' | 'other';

export function styleKind(key: string): StyleKind {
  if (/^(background|text|border|borderTop|borderRight|borderBottom|borderLeft|fill|stroke)$/.test(key)) return 'color';
  if (/^(gap|rowGap|columnGap|padding|margin)/.test(key)) return 'space';
  if (/^(width|height|minWidth|minHeight|maxWidth|maxHeight)$/.test(key)) return 'size';
  if (/^radius/.test(key)) return 'radius';
  if (key === 'shadow') return 'shadow';
  if (key === 'type') return 'type';
  if (key === 'weight') return 'weight';
  if (key === 'family') return 'family';
  return 'other';
}

/** The colour category that fits a style key or CSS property. */
export function colorCategoryFor(key: string): ColorTokenCategory {
  if (/^(background|background-color)$/.test(key)) return 'surface';
  if (/^(text|color)$/.test(key)) return 'text';
  if (/^border/.test(key)) return 'border';
  return 'icon';
}

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** The CSS property (or properties) a style key sets. */
export function cssPropertiesFor(key: string): string[] {
  switch (key) {
    case 'background':
      return ['background-color'];
    case 'text':
      return ['color'];
    case 'border':
      return ['border-color'];
    case 'radius':
      return ['border-radius'];
    case 'shadow':
      return ['box-shadow'];
    case 'type':
      return ['font-size', 'line-height', 'letter-spacing'];
    case 'weight':
      return ['font-weight'];
    case 'family':
      return ['font-family'];
    default:
      if (/^border(Top|Right|Bottom|Left)$/.test(key)) return [`${kebab(key)}-color`];
      if (/^radius(Tl|Tr|Br|Bl)$/.test(key)) {
        const corner = { Tl: 'top-left', Tr: 'top-right', Br: 'bottom-right', Bl: 'bottom-left' }[key.slice(6)]!;
        return [`border-${corner}-radius`];
      }
      return [kebab(key)];
  }
}

/** A style value for a picked token, with the CSS it renders (colours as their light value; the renderer picks per mode). */
export function styleForToken(key: string, path: string, previous?: Record<string, string>): { value: string; token: string; css: Record<string, string> } {
  const kind = styleKind(key);
  const props = cssPropertiesFor(key);
  if (kind === 'color') {
    const token = colorToken(path);
    const hex = token?.light ?? '';
    const css: Record<string, string> = { [props[0]]: hex };
    // A border picked on an element with none gets a 1px solid line to show on.
    if (/^border/.test(key)) {
      const width = Object.entries(previous ?? {}).find(([k]) => /width$/.test(k));
      const side = /^border(Top|Right|Bottom|Left)$/.test(key) ? `${kebab(key)}` : 'border';
      css[`${side}-width`] = width?.[1] ?? '1px';
      css[`${side}-style`] = 'solid';
    }
    return { value: hex, token: path, css };
  }
  if (kind === 'type') {
    const slot = typeSlot(path)!;
    return {
      value: `${slot.size} / ${slot.leading}`,
      token: path,
      css: { 'font-size': `${slot.size}px`, 'line-height': `${slot.leading}px`, 'letter-spacing': `${slot.letterSpacing}em` },
    };
  }
  const raw = scaleValue(path);
  const value = typeof raw === 'number' ? (kind === 'weight' ? String(raw) : `${raw}px`) : String(raw ?? '');
  return { value: kind === 'shadow' ? path.replace('elevation.', '') : value, token: path, css: Object.fromEntries(props.map((p) => [p, value])) };
}
