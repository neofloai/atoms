/**
 * What each Atoms component accepts, read from the generated docs data
 * (`data/components.json`, the same source the MCP serves), turned into
 * controls: a union of string literals becomes a dropdown, a boolean a
 * toggle, text a text field. A family page (`Tabs` documents `Tab` too)
 * is split so each component gets its own props.
 */
import data from '../../../data/components.json';

export type Control =
  | { kind: 'select'; options: string[] }
  | { kind: 'boolean' }
  | { kind: 'number' }
  | { kind: 'text' }
  | { kind: 'json' }
  | { kind: 'readonly' };

export interface PropMeta {
  name: string;
  type: string;
  default?: string;
  description?: string;
  control: Control;
}

export interface ComponentMeta {
  name: string;
  category: string;
  tagline: string;
  props: PropMeta[];
  /** Whether it takes `children`. */
  children: boolean;
}

interface Raw {
  name: string;
  category: string;
  tagline: string;
  props: { name: string; type: string; default?: string; description?: string }[];
}

/** String literals in a type, with `'h1'–'h6'` expanded. */
function literals(type: string): string[] {
  const out: string[] = [];
  const range = /'([a-z]+)(\d)'\s*[–-]\s*'\1(\d)'/g;
  let expanded = type;
  for (const m of type.matchAll(range)) {
    const items = [];
    for (let i = Number(m[2]); i <= Number(m[3]); i += 1) items.push(`'${m[1]}${i}'`);
    expanded = expanded.replace(m[0], items.join(' | '));
  }
  for (const m of expanded.matchAll(/'([^']+)'/g)) out.push(m[1]);
  return [...new Set(out)];
}

function controlFor(type: string): Control {
  const t = type.trim();
  if (/=>/.test(t) || /^Ref</.test(t) || /ElementType/.test(t) || /^SxProps/.test(t)) return { kind: 'readonly' };
  const lits = literals(t);
  const rest = t.replace(/'[^']*'/g, '');
  if (/\btrue\b/.test(rest) && /\bfalse\b/.test(rest)) lits.push('true', 'false');
  if (lits.length >= 2 && !/\bstring\b/.test(rest)) return { kind: 'select', options: lits };
  if (t === 'boolean') return { kind: 'boolean' };
  if (/^number$/.test(t)) return { kind: 'number' };
  if (/^(string|ReactNode|React\.ReactNode)$/.test(t)) return { kind: 'text' };
  return { kind: 'json' };
}

const byName = new Map<string, ComponentMeta>();

function add(name: string, raw: Raw, props: PropMeta[]) {
  const existing = byName.get(name);
  if (existing) {
    existing.props.push(...props.filter((p) => !existing.props.some((q) => q.name === p.name)));
    return;
  }
  byName.set(name, {
    name,
    category: raw.category,
    tagline: raw.tagline,
    props: props.filter((p) => p.name !== 'children' && p.name !== 'sx' && p.name !== 'ref'),
    children: props.some((p) => p.name === 'children'),
  });
}

for (const raw of (data as unknown as { components: Raw[] }).components) {
  const own: PropMeta[] = [];
  const parts = new Map<string, PropMeta[]>();
  for (const p of raw.props) {
    // `Tab label` belongs to Tab; `value / defaultValue` is two props.
    const prefixed = /^([A-Z][A-Za-z]+)\s+(.+)$/.exec(p.name);
    const owner = prefixed ? prefixed[1] : raw.name;
    const rest = prefixed ? prefixed[2] : p.name;
    const names = rest.split(/\s*\/\s*/);
    const types = p.type.split(/\s+\/\s+/);
    names.forEach((name, i) => {
      if (!/^[a-zA-Z][\w-]*$/.test(name)) return;
      const type = types.length === names.length ? types[i] : p.type;
      const meta: PropMeta = { name, type, default: p.default, description: p.description, control: controlFor(type) };
      if (owner === raw.name) own.push(meta);
      else parts.set(owner, [...(parts.get(owner) ?? []), meta]);
    });
  }
  add(raw.name, raw, own);
  for (const [name, props] of parts) add(name, { ...raw, tagline: `Part of ${raw.name}.` }, props);
}

export const metaOf = (name: string) => byName.get(name);

/** Components grouped by their docs category, for the insert palette. */
export function paletteGroups(available: Set<string>): { category: string; names: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const meta of byName.values()) {
    if (!available.has(meta.name)) continue;
    groups.set(meta.category, [...(groups.get(meta.category) ?? []), meta.name]);
  }
  for (const name of available) {
    if (!byName.has(name)) groups.set('More', [...(groups.get('More') ?? []), name]);
  }
  return [...groups.entries()].map(([category, names]) => ({ category, names: names.sort() })).sort((a, b) => a.category.localeCompare(b.category));
}
