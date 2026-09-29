/**
 * Turns an `atoms-screen` export — the JSON the Atoms Inspector and Atoms
 * Studio write — into a React file built from `@neofloai/atoms`.
 *
 * The export already names every component and the props the design
 * passed, so most of the file is a straight translation. What it cannot
 * carry is written down instead of guessed: functions become no-op
 * handlers to wire, a list keeps its captured items as sample data, and
 * every place the design overrode the library (an `sx` restyle, an
 * off-token value, a Studio override) is left out of the code and
 * listed as a numbered gap. Copying those as `sx` is exactly what the
 * export's readme tells a builder not to do.
 */
import { VISUAL_KEY } from '@/extension/src/shared/schema';

import type {
  ComponentNode,
  Deviation,
  ElementNode,
  Handover,
  HandoverNode,
  IconNode,
  LayoutNode,
  RepeatNode,
  StyleValue,
} from '@/extension/src/shared/schema';

// ---------------------------------------------------------------- output

export interface Gap {
  n: number;
  deviation: Deviation;
}

export interface ScreenCode {
  componentName: string;
  code: string;
  /** Atoms exports the file imports, components and layout primitives alike. */
  components: string[];
  icons: string[];
  /** Component names the export used that this release does not export. */
  unknown: string[];
  handlers: { what: string; count: number }[];
  todos: string[];
  lists: string[];
  gaps: Gap[];
}

// ---------------------------------------------------------------- literals

const MARKER = /^<(function|object|circular|\d+ (more|items)|[a-z0-9-]+ element)>$/;
const IDENT = /^[A-Za-z_$][\w$]*$/;
const TOKEN_ROOTS = new Set(['surface', 'border', 'text', 'icon', 'colors', 'spacing', 'responsive', 'typography', 'fontWeights', 'fontFamilies', 'elevation', 'radius']);
/** Roots whose leaves are `{ light, dark }` pairs. */
const MODE_ROOTS = new Set(['surface', 'border', 'text', 'icon']);

const quote = (s: string) => `'${s.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
const keyOf = (k: string) => (IDENT.test(k) ? k : quote(k));
const safeComment = (s: string) => s.replace(/\*\//g, '* /').replace(/\s+/g, ' ').trim();
const isMarker = (v: unknown): v is string => typeof v === 'string' && MARKER.test(v);
const camel = (s: string) => s.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
const pad = (n: number) => '  '.repeat(n);

type Primitive = string | number | boolean | null;
const isPrimitive = (v: unknown): v is Primitive => v === null || ['string', 'number', 'boolean'].includes(typeof v);

function literal(v: Primitive): string {
  return typeof v === 'string' ? quote(v) : String(v);
}

/** Text as a JSX child: bare when it reads safely, an expression otherwise. */
function jsxText(s: string): string {
  if (!s) return '';
  return /^\s|\s$|[{}<>&\n\\]/.test(s) ? `{${quote(s)}}` : s;
}

/** An attribute from a plain value: `label="Save"`, `size={16}`, `selected`. */
function renderAttr(name: string, v: Primitive): string {
  if (v === true) return name;
  if (typeof v === 'string') return /["\\\n{}]/.test(v) ? `${name}={${quote(v)}}` : `${name}="${v}"`;
  return `${name}={${String(v)}}`;
}

// ---------------------------------------------------------------- context

interface Slot {
  value: Primitive;
  hint: string;
  pos: 'attr' | 'text';
  name: string;
}

interface Ctx {
  atoms: Set<string>;
  icons: Set<string>;
  tokens: Set<string>;
  known: Set<string>;
  unknown: Set<string>;
  handlers: Map<string, number>;
  todos: Set<string>;
  lists: string[];
  listNotes: string[];
  listNames: Set<string>;
  gaps: Map<string, Gap[]>;
  /** Colour token paths by `light|dark` value, to name a pair the export only has as hex. */
  pairs: Map<string, string[]>;
  version: number;
  /** Set while a list's items are emitted, to find what varies between them. */
  hook: Slot[] | null;
  /** Inside a list item: nested lists are written out rather than hoisted. */
  inList: number;
}

const SLOT = (i: number) => `\u0000${i}\u0000`;

function attr(c: Ctx, name: string, v: Primitive): string {
  if (!c.hook) return renderAttr(name, v);
  c.hook.push({ value: v, hint: name, pos: 'attr', name });
  return `${name}${SLOT(c.hook.length - 1)}`;
}

function text(c: Ctx, s: string, hint = 'text'): string {
  if (!c.hook) return jsxText(s);
  c.hook.push({ value: s, hint, pos: 'text', name: '' });
  return SLOT(c.hook.length - 1);
}

/** A token path as code, importing its root: `text.default.b1` → `text.default.b1`. */
function tokenExpr(c: Ctx, path: string): string | null {
  const root = path.split(/[.[]/)[0];
  if (!TOKEN_ROOTS.has(root)) return null;
  c.tokens.add(root);
  return path;
}

// ---------------------------------------------------------------- values

/** A captured prop value as a JS expression. Markers are left out, with a comment saying what was there. */
function js(c: Ctx, v: unknown, ind: number, where: string, samples?: Map<string, string>, hint = ''): string {
  if (isPrimitive(v)) return literal(v);
  if (Array.isArray(v)) {
    const lines: string[] = [];
    for (const item of v) {
      if (isMarker(item)) {
        lines.push(`// ${item.slice(1, -1)} in the design`);
        continue;
      }
      lines.push(`${js(c, item, ind + 1, where, samples)},`);
    }
    const inline = `[${lines.map((l) => l.replace(/,$/, '')).join(', ')}]`;
    if (!lines.some((l) => l.startsWith('//') || l.includes('\n')) && inline.length <= 72) return inline;
    return `[\n${lines.map((l) => indentBlock(l, ind + 1)).join('\n')}\n${pad(ind)}]`;
  }
  if (v && typeof v === 'object') {
    const obj = v as Record<string, unknown>;
    if (typeof obj.$element === 'string') return elementProp(c, obj as { $element: string; props?: Record<string, unknown>; text?: string }, where);
    const pair = pairToken(c, obj, hint);
    if (pair) return pair;
    const lines: string[] = [];
    for (const [k, val] of Object.entries(obj)) {
      if (val === undefined) continue;
      if (isMarker(val)) {
        if (val === '<function>') {
          const drew = samples && typeof obj.field === 'string' ? samples.get(obj.field) : undefined;
          lines.push(`// ${k}: a function in the design — write it${drew ? `; ${drew}` : ''}`);
          c.todos.add(`${where}: \`${k}\`${typeof obj.field === 'string' ? ` of the \`${obj.field}\` column` : ''} was a function — write it${drew ? `; ${drew}` : ''}.`);
        } else lines.push(`// ${k}: ${val.slice(1, -1)} (not captured)`);
        continue;
      }
      lines.push(`${keyOf(k)}: ${js(c, val, ind + 1, where, samples, k)},`);
    }
    if (!lines.length) return '{}';
    const inline = `{ ${lines.map((l) => l.replace(/,$/, '')).join(', ')} }`;
    if (!lines.some((l) => l.startsWith('//') || l.includes('\n')) && inline.length <= 72) return inline;
    return `{\n${lines.map((l) => indentBlock(l, ind + 1)).join('\n')}\n${pad(ind)}}`;
  }
  return 'undefined';
}

/** The colour category a prop or style name points at: `bg` → surface, `border` → border. */
function categoryOf(hint: string): string | null {
  if (/^(bg|background|surface|fill)/i.test(hint)) return 'surface';
  if (/^border/i.test(hint)) return 'border';
  if (/^(text|color|label)/i.test(hint)) return 'text';
  if (/^icon/i.test(hint)) return 'icon';
  return null;
}

/** Picks the path in the category the name points at, when several share a value. */
function preferred(paths: string[], hint: string): string {
  const category = categoryOf(hint);
  return (category && paths.find((p) => p.startsWith(`${category}.`))) || paths[0];
}

/** A `{ light, dark }` pair captured as hex, back to the token it came from. */
function pairToken(c: Ctx, obj: Record<string, unknown>, hint: string): string | null {
  const keys = Object.keys(obj);
  if (keys.length !== 2 || typeof obj.light !== 'string' || typeof obj.dark !== 'string') return null;
  const paths = c.pairs.get(`${obj.light.toLowerCase()}|${obj.dark.toLowerCase()}`);
  return paths ? tokenExpr(c, preferred(paths, hint)) : null;
}

function indentBlock(block: string, ind: number): string {
  const [first, ...rest] = block.split('\n');
  return [pad(ind) + first, ...rest].join('\n');
}

const isElement = (v: unknown): v is { $element: string; props?: Record<string, unknown>; text?: string } =>
  !!v && typeof v === 'object' && typeof (v as { $element?: unknown }).$element === 'string';

/** An element passed through a prop: `startIcon={<CaretDownIcon />}`. */
function elementProp(c: Ctx, el: { $element: string; props?: Record<string, unknown>; text?: string }, where: string): string {
  const name = resolveName(c, el.$element);
  if (!name) {
    c.todos.add(`${where}: passed \`<${el.$element}>\`, the design's own component — rebuild it from Atoms${el.text ? ` (it read "${el.text}")` : ''}.`);
    return el.text ? `<span>${jsxText(el.text)}</span>` : `null /* TODO: was <${el.$element}>, the design's own component */`;
  }
  const attrs = propAttrs(c, el.props ?? {}, 0, `${where} <${name}>`, name, false);
  const open = [name, ...attrs].join(' ');
  return el.text ? `<${open}>${jsxText(el.text)}</${name}>` : `<${open} />`;
}

/** The identifier to write for a component name, importing it; null when nothing exports it. */
function resolveName(c: Ctx, name: string): string | null {
  if (/^[a-z]/.test(name)) return name;
  if (c.known.has(name)) {
    c.atoms.add(name);
    return name;
  }
  if (/Icon$/.test(name)) {
    c.icons.add(name);
    return name;
  }
  return null;
}

/** Attributes for a props object. Handlers become no-ops to wire; other functions and markers are left out. */
function propAttrs(c: Ctx, props: Record<string, unknown>, ind: number, where: string, label: string, slots = true, samples?: Map<string, string>): string[] {
  const out: string[] = [];
  for (const [k, v] of Object.entries(props)) {
    if (v === undefined) continue;
    if (v === '<function>') {
      if (/^on[A-Z]/.test(k)) {
        out.push(`${k}={() => {}}`);
        const key = `\`${label}\` ${k}`;
        c.handlers.set(key, (c.handlers.get(key) ?? 0) + 1);
      } else c.todos.add(`${where}: \`${k}\` was a function — write it.`);
      continue;
    }
    if (isMarker(v)) {
      if (/ element>$/.test(v)) c.todos.add(`${where}: \`${k}\` pointed at an element on the page (${v.slice(1, -1)}) — hold it in state.`);
      else c.todos.add(`${where}: \`${k}\` was not captured (${v.slice(1, -1)}).`);
      continue;
    }
    if (isPrimitive(v)) out.push(slots ? attr(c, k, v) : renderAttr(k, v));
    else if (isElement(v) && !resolveName(c, v.$element)) {
      c.todos.add(`${where}: \`${k}\` was \`<${v.$element}>\`, the design's own element — left out; pass an Atoms icon or component instead${v.text ? ` (it read "${v.text}")` : ''}.`);
    } else out.push(`${k}={${js(c, v, ind, where, samples, k)}}`);
  }
  return out;
}

// ---------------------------------------------------------------- JSX

interface Emitted {
  /** Comments that belong above the node. */
  notes: string[];
  lines: string[];
}

/** A tag with its attributes and children, one attribute per line when it does not fit. */
function tag(name: string, attrs: string[], children: string[] | null, ind: number): string[] {
  const oneLine = attrs.every((a) => !a.includes('\n')) && pad(ind).length + name.length + attrs.join(' ').length < 90;
  const head = oneLine ? [`${pad(ind)}<${[name, ...attrs].join(' ')}`] : [`${pad(ind)}<${name}`, ...attrs.map((a) => indentBlock(a, ind + 1))];
  if (!children || !children.length) {
    if (oneLine) return [`${head[0]} />`];
    return [...head, `${pad(ind)}/>`];
  }
  const close = `</${name}>`;
  // A lone text child fits on the tag's own line.
  if (oneLine && children.length === 1 && !children[0].trim().startsWith('<') && !children[0].trim().startsWith('{/*')) {
    const line = `${head[0]}>${children[0].trim()}${close}`;
    if (line.length < 110) return [line];
  }
  return [...(oneLine ? [`${head[0]}>`] : [...head, `${pad(ind)}>`]), ...children, `${pad(ind)}${close}`];
}

function withNotes(e: Emitted, ind: number, jsx: boolean): string[] {
  const notes = e.notes.map((n) => (jsx ? `${pad(ind)}{/* ${safeComment(n)} */}` : `${pad(ind)}// ${safeComment(n)}`));
  return [...notes, ...e.lines];
}

interface Inherit {
  type?: string;
  color?: string;
  weight?: string;
  /** Set for a Stack's direct children: the margin its spacing gives them. */
  stack?: 'row' | 'column';
}

/**
 * Props a parent adds when it clones its children (a Tooltip's listeners,
 * the Tabs' selection), which the design never wrote.
 */
const CLONED: Record<string, RegExp> = {
  Tooltip: /^(data-mui-internal-clone-element|aria-labelledby|aria-describedby|title|className|on(TouchStart|TouchEnd|MouseOver|MouseLeave|MouseMove|Focus|Blur))$/,
  Tabs: /^(indicator|selected|selectionFollowsFocus|onChange|textColor|fullWidth)$/,
};

function children(c: Ctx, nodes: HandoverNode[] | undefined, ind: number, inh: Inherit, parent?: string): string[] {
  const out: string[] = [];
  const cloned = parent ? CLONED[parent] : undefined;
  for (let n of nodes ?? []) {
    // A grid's cells are drawn by its column renderers; those are written from the samples instead.
    if (n.kind === 'component' && n.renderedBy && (n.cell || n.renderedBy === 'DataGrid')) continue;
    if (cloned && (n.kind === 'component' || n.kind === 'layout' || n.kind === 'icon')) n = { ...n, props: Object.fromEntries(Object.entries(n.props).filter(([k]) => !cloned.test(k))) };
    out.push(...withNotes(emit(c, n, ind, inh), ind, true));
  }
  return out;
}

function nodeNotes(c: Ctx, node: HandoverNode, inline: Set<number> = new Set()): string[] {
  const notes: string[] = [];
  if ('region' in node && node.region) notes.push(`Region: ${node.region}`);
  if ('note' in node && node.note) notes.push(`Designer's note: ${node.note}`);
  const gaps = (node.id ? c.gaps.get(node.id) : undefined)?.filter((g) => !inline.has(g.n)) ?? [];
  for (const g of gaps) notes.push(`⚠ Gap ${g.n}: ${gapLine(g.deviation)} — ${keptInCode(g.deviation) ? 'kept as the design wrote it; swap it for a token' : 'left out of the code'}`);
  return notes;
}

/**
 * Whether the code keeps a gap's value. A layout's own sx and the design's
 * own markup are written as they were, off-token values included; what
 * restyles an Atoms component is left out.
 */
export function keptInCode(d: Deviation): boolean {
  if (d.kind === 'off-token') return !d.component || /^(Box|Stack|Grid|Container)$/.test(d.component);
  return false;
}

export function gapLine(d: Deviation): string {
  const where = d.component ? `${d.component} ` : '';
  const what = d.kind === 'override' ? 'override' : d.kind === 'off-token' ? 'off-token' : d.kind;
  return `${where}${what} ${d.property} ${d.value}${d.note ? ` (${d.note})` : ''}`;
}

function emit(c: Ctx, node: HandoverNode, ind: number, inh: Inherit): Emitted {
  switch (node.kind) {
    case 'text':
      return { notes: [], lines: [pad(ind) + text(c, node.text)] };
    case 'icon':
      return emitIcon(c, node, ind);
    case 'component':
      return emitComponent(c, node, ind);
    case 'layout':
      return emitLayout(c, node, ind, inh);
    case 'element':
      return emitElement(c, node, ind, inh);
    case 'repeat':
      return emitRepeat(c, node, ind, inh);
  }
}

function emitIcon(c: Ctx, node: IconNode, ind: number): Emitted {
  const name = resolveName(c, node.name) ?? node.name;
  return { notes: nodeNotes(c, node), lines: tag(name, propAttrs(c, node.props, ind + 1, node.name, node.name), null, ind) };
}

function labelOf(node: ComponentNode): string {
  const label = node.text ?? (typeof node.props.label === 'string' ? node.props.label : typeof node.props.title === 'string' ? node.props.title : '');
  return label ? `${node.name} "${label.length > 30 ? `${label.slice(0, 30)}…` : label}"` : node.name;
}

function emitComponent(c: Ctx, node: ComponentNode, ind: number): Emitted {
  const notes = nodeNotes(c, node);
  const name = resolveName(c, node.name);
  if (!name) {
    c.unknown.add(node.name);
    notes.push(`TODO: <${node.name}> is not an Atoms export — find the Atoms component that fits`);
  }
  const written = name ?? node.name;
  // A grid's cell renderers are functions; what they drew, and how the cells read, guide the ones to write.
  const samples = new Map<string, string>();
  for (const kid of node.children ?? []) {
    if (kid.kind !== 'component' || !kid.cell || samples.has(kid.cell.field)) continue;
    samples.set(kid.cell.field, `it drew \`${inlineJsx(c, kid)}\``);
  }
  for (const [field, read] of cellReadings(node)) samples.set(field, samples.has(field) ? `${samples.get(field)}, and the cells read ${read}` : `the cells read ${read}`);
  const label = c.hook ? `${node.name} (in a list)` : labelOf(node);
  const attrs = propAttrs(c, node.props, ind + 1, label, label, true, samples);
  const sx = placementSx(c, node.sx, ind + 1);
  if (sx) attrs.push(`sx={${sx}}`);
  const kids = node.text !== undefined ? [pad(ind + 1) + text(c, node.text, 'label')] : children(c, node.children, ind + 1, {}, node.name);
  return { notes, lines: tag(written, attrs, kids, ind) };
}

/** A node on one line, children included, for a note about what a function drew. */
function inlineJsx(c: Ctx, node: HandoverNode): string {
  const quiet: Ctx = { ...c, hook: null, inList: 1, handlers: new Map(), todos: new Set() };
  const line = emit(quiet, node, 0, {})
    .lines.map((l) => l.trim())
    .join(' ')
    .replace(/\s+/g, ' ')
    .replace(/> </g, '><');
  return line.length > 240 ? `${line.slice(0, 240)}…` : line;
}

/** How a grid column's cells read on screen, from the first rows: `"$4,250.00", "$12,780.50"`. */
function cellReadings(node: ComponentNode): Map<string, string> {
  const out = new Map<string, string>();
  const byField = new Map<string, string[]>();
  for (const row of Object.values(node.cells ?? {})) {
    for (const [field, value] of Object.entries(row)) byField.set(field, [...(byField.get(field) ?? []), value]);
  }
  for (const [field, values] of byField) {
    const shown = [...new Set(values)].slice(0, 3).map((v) => JSON.stringify(v.length > 60 ? `${v.slice(0, 60)}…` : v));
    out.set(field, shown.join(', '));
  }
  return out;
}

/** The part of a component's `sx` that places it. What restyles it is a gap, already listed. */
function placementSx(c: Ctx, raw: unknown, ind: number): string | null {
  const sx = sxObject(raw);
  if (!sx || typeof sx !== 'object' || Array.isArray(sx)) return null;
  const kept: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(sx as Record<string, unknown>)) {
    if (VISUAL_KEY.test(k) || /[&:.\s]/.test(k) || isMarker(v)) continue;
    kept[k] = v;
  }
  return Object.keys(kept).length ? js(c, kept, ind, 'sx') : null;
}

/**
 * The `sx` keys that already set a style, so a style they cover is not
 * written twice. Mirrors Atoms Studio, which drops these keys when a
 * designer sets the style itself.
 */
const COVERS: Record<string, string[]> = {
  gap: ['gap', 'rowGap', 'columnGap'],
  rowGap: ['rowGap', 'gap'],
  columnGap: ['columnGap', 'gap'],
  padding: ['p', 'padding'],
  margin: ['m', 'margin'],
  background: ['bgcolor', 'backgroundColor', 'background'],
  border: ['border', 'borderColor', 'borderWidth'],
  radius: ['borderRadius'],
  shadow: ['boxShadow'],
};
for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
  const short = side[0].toLowerCase();
  const axis = side === 'Top' || side === 'Bottom' ? 'y' : 'x';
  COVERS[`padding${side}`] = [`p${short}`, `padding${side}`, `p${axis}`, `padding${axis.toUpperCase()}`, 'p', 'padding'];
  COVERS[`margin${side}`] = [`m${short}`, `margin${side}`, `m${axis}`, `margin${axis.toUpperCase()}`, 'm', 'margin'];
  COVERS[`border${side}`] = [`border${side}`, `border${side}Color`, 'border', 'borderColor'];
}

/**
 * A layout's sx: what the design wrote, plus every style it does not
 * cover — a Studio edit replaces the sx key it touches with the style.
 * Text styles are inherited on a layout, so they are left to the text.
 */
function layoutSx(c: Ctx, node: LayoutNode, ind: number, inh: Inherit, notes: string[]): string | null {
  const raw = node.sx === '<function>' ? undefined : sxObject(node.sx);
  if (node.sx === '<function>') notes.push(`TODO: this ${node.name}'s sx was a function; the code rebuilds it from what it drew`);
  if (raw !== undefined && (typeof raw !== 'object' || raw === null || Array.isArray(raw))) return `{${js(c, raw, ind, `${node.name} sx`)}}`;
  const written = (raw ?? {}) as Record<string, unknown>;
  const has = (keys: string[]) => keys.some((k) => k in written || k in node.props);

  const entries: SxEntry[] = Object.entries(written).map(([k, v]) => ({ key: keyOf(k), light: js(c, v, ind + 1, `${node.name} sx`, undefined, k) }));
  const layout = node.layout;
  if (layout) {
    const stack = node.name === 'Stack';
    const display = layout.display.replace(' ', '-');
    if (!stack && node.name !== 'Grid' && display !== 'block' && !has(['display'])) entries.push({ key: 'display', light: quote(display) });
    const direction = layout.direction && layout.direction !== (stack ? 'column' : 'row') ? layout.direction : null;
    if (direction && !has(['direction', 'flexDirection'])) entries.push({ key: 'flexDirection', light: quote(direction) });
    if (layout.wrap && !has(['flexWrap', 'useFlexGap'])) entries.push({ key: 'flexWrap', light: quote(layout.wrap) });
    if (layout.align && !has(['alignItems'])) entries.push({ key: 'alignItems', light: quote(layout.align) });
    if (layout.justify && !has(['justifyContent'])) entries.push({ key: 'justifyContent', light: quote(layout.justify) });
    if (layout.columns && !has(['gridTemplateColumns', 'columns'])) entries.push({ key: 'gridTemplateColumns', light: quote(layout.columns), comment: 'as measured — write the real tracks' });
  }
  const skip = new Set(['text', 'type', 'weight', 'family']);
  for (const key of Object.keys(node.styles ?? {})) {
    if (has(COVERS[key] ?? [key])) skip.add(key);
    // A Stack's spacing draws its gap.
    if (/^(gap|rowGap|columnGap)$/.test(key) && node.props.spacing !== undefined) skip.add(key);
  }
  entries.push(...sxEntries(c, node.styles, undefined, undefined, inh, skip, node.id));
  return printSx(entries, ind);
}

function emitLayout(c: Ctx, node: LayoutNode, ind: number, inh: Inherit): Emitted {
  const inline = new Set<number>();
  for (const g of c.gaps.get(node.id) ?? []) if (g.deviation.kind === 'off-token' && node.styles?.[g.deviation.property]) inline.add(g.n);
  const notes = nodeNotes(c, node, inline);
  const name = resolveName(c, node.name) ?? (c.atoms.add('Box'), 'Box');
  const attrs = propAttrs(c, node.props, ind + 1, node.name, node.name);
  const sx = layoutSx(c, node, ind + 1, inh, notes);
  if (sx) attrs.push(`sx=${sx}`);
  // A Stack's spacing is margin on its children; the children must not write it again.
  const spaced = node.name === 'Stack' && node.props.spacing !== undefined;
  const direction = typeof node.props.direction === 'string' && node.props.direction.startsWith('row') ? 'row' : 'column';
  return { notes, lines: tag(name, attrs, children(c, node.children, ind + 1, { ...inh, stack: spaced ? direction : undefined }, node.name), ind) };
}

/**
 * The sx as an object. Version 1 files wrote it as the inspector's flat
 * entries (`{ selector, key, value }`, values as JSON); later ones as written.
 */
function sxObject(sx: unknown): unknown {
  if (!Array.isArray(sx) || !sx.every((e) => e && typeof e === 'object' && 'key' in e && 'value' in e)) return sx;
  const out: Record<string, unknown> = {};
  for (const e of sx as { selector?: string; key: string; value: string }[]) {
    let value: unknown = e.value;
    for (const text of [e.value, e.value.replace(/([{,]\s*)([A-Za-z_$][\w$]*)\s*:/g, '$1"$2":')]) {
      try {
        value = JSON.parse(text);
        break;
      } catch {
        // Not JSON; a bare word, or an object written as JS, which the second pass quotes.
      }
    }
    const at = e.selector ? ((out[e.selector] ??= {}) as Record<string, unknown>) : out;
    at[e.key] = value;
  }
  return out;
}

// ---------------------------------------------------------------- plain markup

const VARIANTS: Record<string, string> = {
  'typography.headings.h1': 'h1',
  'typography.headings.h2': 'h2',
  'typography.headings.h3': 'h3',
  'typography.headings.h4': 'h4',
  'typography.headings.h5': 'h5',
  'typography.headings.h6': 'h6',
  'typography.body.b1': 'body1',
  'typography.body.b2': 'body2',
  'typography.body.caption': 'caption',
};
const VARIANT_TAG: Record<string, string> = { body1: 'p', body2: 'p', caption: 'span' };
const WEIGHT_NAMES: Record<string, string> = { 'fontWeights.regular': 'regular', 'fontWeights.medium': 'medium', 'fontWeights.semibold': 'semibold' };
const TEXT_BLOCK = /^(h[1-6]|p|label|li|dt|dd|figcaption|blockquote|legend)$/;

function ownText(node: ElementNode): string | null {
  if (node.text !== undefined) return node.text;
  const kids = node.children ?? [];
  if (kids.length && kids.every((k) => k.kind === 'text')) return kids.map((k) => (k as { text: string }).text).join('');
  return null;
}

interface SxEntry {
  key: string;
  light: string;
  dark?: string;
  comment?: string;
}

/** sx entries for matched styles, layout and placement. Inherited text styles are written only where they change. */
function sxEntries(c: Ctx, styles: Record<string, StyleValue> | undefined, layout: ElementNode['layout'], box: Record<string, string> | undefined, inh: Inherit, skip: Set<string>, id?: string): SxEntry[] {
  const out: SxEntry[] = [];
  if (layout) {
    const display = layout.display.replace(' ', '-');
    out.push({ key: 'display', light: quote(display) });
    if (layout.direction && layout.direction !== 'row') out.push({ key: 'flexDirection', light: quote(layout.direction) });
    if (layout.wrap) out.push({ key: 'flexWrap', light: quote(layout.wrap) });
    if (layout.columns) out.push({ key: 'gridTemplateColumns', light: quote(layout.columns), comment: 'as measured — write the real tracks' });
    if (layout.align) out.push({ key: 'alignItems', light: quote(layout.align) });
    if (layout.justify) out.push({ key: 'justifyContent', light: quote(layout.justify) });
  }
  for (const [k, v] of Object.entries(box ?? {})) {
    if (k === 'display' && layout) continue;
    out.push({ key: camel(k), light: /^-?\d+(\.\d+)?$/.test(v) ? v : quote(v) });
  }
  const gapFor = (key: string) => (id ? c.gaps.get(id)?.find((g) => g.deviation.property === key && (g.deviation.kind === 'off-token' || g.deviation.kind === 'drift')) : undefined);
  for (const [key, v] of Object.entries(styles ?? {})) {
    if (skip.has(key)) continue;
    if ((key === 'marginTop' && inh.stack === 'column') || (key === 'marginLeft' && inh.stack === 'row')) continue;
    if (key === 'text' && v.value === inh.color) continue;
    if (key === 'type' && v.value === inh.type) continue;
    if (key === 'weight' && v.value === inh.weight) continue;
    // The theme sets the product sans; only another family is worth writing.
    if (key === 'family' && (v.token === 'fontFamilies.product.sans' || (!v.token && !v.off))) continue;
    const gap = gapFor(key);
    const token = v.token ?? (v.candidates ? preferred(v.candidates, key) : undefined);
    const others = v.candidates?.filter((t) => t !== token && (!categoryOf(key) || t.startsWith(`${categoryOf(key)}.`))) ?? [];
    const also = !v.token && others.length ? `or ${others.join(', ')} — the value matches each` : undefined;
    const comment = gap ? `⚠ Gap ${gap.n}: ${v.note ?? 'off-token'}` : v.off ? `⚠ off-token${v.note ? `: ${v.note}` : ''}` : also;
    out.push(...styleEntry(c, key, v, v.off ? undefined : token, comment));
  }
  return out;
}

function borderWidth(v: StyleValue): string | null {
  const m = /^(\d+(\.\d+)?px)\s·/.exec(v.value);
  return m ? m[1] : null;
}

const px = (expr: string) => `\`\${${expr}}px\``;

function styleEntry(c: Ctx, key: string, v: StyleValue, token: string | undefined, comment?: string): SxEntry[] {
  const expr = token ? tokenExpr(c, token) : null;
  const root = token?.split(/[.[]/)[0] ?? '';
  const colour = (property: string): SxEntry => {
    if (expr && MODE_ROOTS.has(root)) return { key: property, light: `${expr}.light`, dark: `${expr}.dark`, comment };
    if (expr) return { key: property, light: expr, comment };
    const raw = v.value.includes('·') ? v.value.split('·').pop()!.trim() : v.value;
    return { key: property, light: quote(raw), comment };
  };
  switch (true) {
    case key === 'text':
      return [colour('color')];
    case key === 'background':
      return [colour('backgroundColor')];
    case key === 'fill' || key === 'stroke':
      return [colour(key)];
    case /^border(Top|Right|Bottom|Left)?$/.test(key): {
      const width = borderWidth(v);
      return [...(width ? [{ key, light: quote(`${width} solid`) }] : []), colour(`${key}Color`)];
    }
    case /^radius/.test(key): {
      const corner = { Tl: 'borderTopLeftRadius', Tr: 'borderTopRightRadius', Br: 'borderBottomRightRadius', Bl: 'borderBottomLeftRadius' }[key.slice(6)] ?? 'borderRadius';
      return [{ key: corner, light: expr ? px(expr) : quote(v.value), comment }];
    }
    case key === 'shadow':
      return [{ key: 'boxShadow', light: expr ?? quote(v.css?.['box-shadow'] ?? v.value), comment }];
    case key === 'weight':
      return [{ key: 'fontWeight', light: expr ?? (/^\d+$/.test(v.value) ? v.value : quote(v.value)), comment }];
    case key === 'family':
      return [{ key: 'fontFamily', light: expr ?? quote(v.value), comment }];
    case key === 'type': {
      const variant = token ? VARIANTS[token] : undefined;
      if (variant) return [{ key: 'typography', light: quote(variant), comment }];
      if (v.css) return Object.entries(v.css).map(([k, val]) => ({ key: camel(k), light: quote(val), comment }));
      const [size, leading] = v.value.split('/').map((s) => s.trim());
      return [
        { key: 'fontSize', light: quote(`${size}px`), comment },
        ...(leading && leading !== 'normal' ? [{ key: 'lineHeight', light: quote(`${leading}px`) }] : []),
      ];
    }
    case /^(padding|margin|gap|rowGap|columnGap)/.test(key):
      return [{ key, light: expr ? px(expr) : quote(v.value), comment }];
    case key === 'opacity':
      return [{ key, light: v.value, comment }];
    default: {
      if (v.css) return Object.entries(v.css).map(([k, val]) => ({ key: camel(k), light: quote(val), comment }));
      return [{ key, light: quote(v.value), comment }];
    }
  }
}

/** `{{ … }}`, or a theme function when a colour has a dark value. Null when there is nothing to write. */
function printSx(entries: SxEntry[], ind: number): string | null {
  if (!entries.length) return null;
  const line = (e: SxEntry, value: string) => `${e.key}: ${value},${e.comment ? ` // ${safeComment(e.comment)}` : ''}`;
  const dark = entries.filter((e) => e.dark);
  if (!dark.length) {
    const inline = `{{ ${entries.map((e) => `${e.key}: ${e.light}`).join(', ')} }}`;
    if (!entries.some((e) => e.comment) && inline.length <= 72) return inline;
    return `{{\n${entries.map((e) => pad(ind + 1) + line(e, e.light)).join('\n')}\n${pad(ind)}}}`;
  }
  return [
    '{(theme) => ({',
    ...entries.map((e) => pad(ind + 1) + line(e, e.light)),
    `${pad(ind + 1)}...theme.applyStyles('dark', {`,
    ...dark.map((e) => `${pad(ind + 2)}${e.key}: ${e.dark},`),
    `${pad(ind + 1)}}),`,
    `${pad(ind)}})}`,
  ].join('\n');
}

function styleSx(c: Ctx, styles: Record<string, StyleValue> | undefined, layout: ElementNode['layout'], box: Record<string, string> | undefined, ind: number, inh: Inherit, skip: Set<string>, textual: boolean, id?: string): string | null {
  // An element without text of its own inherits its type; it does not set it.
  const skipped = new Set(skip);
  if (!textual) for (const k of ['type', 'family']) skipped.add(k);
  return printSx(sxEntries(c, styles, layout, box, inh, skipped, id), ind);
}

function emitElement(c: Ctx, node: ElementNode, ind: number, inh: Inherit): Emitted {
  const styles = node.styles ?? {};
  const own = ownText(node);
  const textual = own !== null && own.trim() !== '';
  const inline = new Set<number>();
  for (const g of c.gaps.get(node.id) ?? []) if ((g.deviation.kind === 'off-token' || g.deviation.kind === 'drift') && styles[g.deviation.property]) inline.add(g.n);
  const notes = nodeNotes(c, node, inline);
  const next: Inherit = { type: styles.type?.value ?? inh.type, color: styles.text?.value ?? inh.color, weight: styles.weight?.value ?? inh.weight };
  const attrs = node.attrs ?? {};
  const kids = () => (textual ? [pad(ind + 1) + text(c, own!)] : children(c, node.children, ind + 1, next));

  if (node.tag === 'hr') {
    c.atoms.add('Divider');
    return { notes, lines: tag('Divider', [], null, ind) };
  }
  if (node.tag === 'svg') {
    c.atoms.add('Box');
    notes.push(`TODO: the design drew its own inline SVG here (${Math.round(node.rect[2])}×${Math.round(node.rect[3])}) — use NeofloLogo if it is the logo, an icon if one fits, or add it as an asset`);
    return { notes, lines: tag('Box', [`sx={{ width: ${Math.round(node.rect[2])}, height: ${Math.round(node.rect[3])}, flexShrink: 0 }}`], null, ind) };
  }
  if (node.tag === 'a' && textual && attrs.href) {
    c.atoms.add('Link');
    return { notes, lines: tag('Link', [attr(c, 'href', attrs.href)], kids(), ind) };
  }
  if (/^(button|input|textarea|select)$/.test(node.tag)) {
    const instead = node.tag === 'button' ? 'Button or IconButton' : node.tag === 'select' ? 'Select' : 'TextField';
    notes.push(`TODO: a plain <${node.tag}> in the design — use ${instead}`);
  }

  const variant = styles.type?.token ? VARIANTS[styles.type.token] : undefined;
  const useTypography = textual && !!variant && (TEXT_BLOCK.test(node.tag) || styles.type!.value !== inh.type);
  const skip = new Set<string>();
  const props: string[] = [];
  let name = 'Box';
  if (useTypography) {
    name = 'Typography';
    props.push(renderAttr('variant', variant!));
    const defaultTag = VARIANT_TAG[variant!] ?? variant!;
    if (node.tag !== defaultTag) props.push(renderAttr('component', node.tag));
    skip.add('type');
    skip.add('family');
    const weight = styles.weight?.token ? WEIGHT_NAMES[styles.weight.token] : undefined;
    const fallback = /^h[1-6]$/.test(variant!) ? 'medium' : 'regular';
    if (weight) {
      skip.add('weight');
      if (weight !== fallback) props.push(renderAttr('weight', weight));
    }
  } else if (node.tag !== 'div') props.push(renderAttr('component', node.tag));
  c.atoms.add(name);

  if (node.tag === 'img') {
    if (attrs.src) props.push(attr(c, 'src', attrs.src));
    props.push(attr(c, 'alt', attrs.alt ?? ''));
  }
  if (node.tag === 'a' && attrs.href) props.push(attr(c, 'href', attrs.href));
  if (attrs.placeholder) props.push(attr(c, 'placeholder', attrs.placeholder));
  if (attrs.title) props.push(attr(c, 'title', attrs.title));

  const sx = styleSx(c, styles, node.layout, node.box, ind + 1, useTypography ? { ...inh, type: styles.type?.value } : inh, skip, textual, node.id);
  if (sx) props.push(`sx=${sx}`);
  const isVoid = /^(img|input|br|wbr)$/.test(node.tag);
  return { notes, lines: tag(name, props, isVoid ? null : kids(), ind) };
}

// ---------------------------------------------------------------- lists

const snake = (s: string) => s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[^A-Za-z0-9]+/g, '_').toUpperCase();

function itemName(node: HandoverNode): string {
  switch (node.kind) {
    case 'element':
      return node.tag;
    case 'text':
    case 'repeat':
      return 'item';
    default:
      return node.name;
  }
}

function replaceSlots(lines: string[], render: (i: number) => string): string[] {
  return lines.map((l) => l.replace(/\u0000(\d+)\u0000/g, (_, i: string) => render(Number(i))));
}

function renderSlotLiteral(s: Slot): string {
  if (s.pos === 'text') return jsxText(String(s.value));
  return renderAttr(s.name, s.value).slice(s.name.length);
}

function emitRepeat(c: Ctx, node: RepeatNode, ind: number, inh: Inherit): Emitted {
  const items = node.items.filter((n) => !(n.kind === 'component' && n.renderedBy));
  if (!items.length) return { notes: [], lines: [] };
  const more = node.count > items.length ? node.count - items.length : 0;
  const notes: string[] = [];

  // A list inside a list item is written out; hoisting it would need data per outer item.
  if (c.inList > 0 || c.hook) {
    if (more) notes.push(`${node.count} on the captured screen; ${items.length} kept`);
    const lines = items.flatMap((item) => withNotes(emit(c, item, ind, inh), ind, true));
    return { notes, lines };
  }

  // Emit each item with its plain values as slots, then compare: when every item has the same code
  // around its slots, the list is one template over data.
  const runs = items.map((item, i) => {
    const hook: Slot[] = [];
    const scratch: Ctx = i === 0 ? c : { ...c, handlers: new Map(), todos: new Set() };
    scratch.hook = hook;
    scratch.inList = 1;
    const e = emit(scratch, item, ind + 1, inh);
    scratch.hook = null;
    scratch.inList = 0;
    c.hook = null;
    return { e, hook, lines: withNotes(e, ind + 1, false), ctx: scratch };
  });
  const skeleton = (r: (typeof runs)[number]) => r.lines.join('\n');
  const same = runs.every((r) => skeleton(r) === skeleton(runs[0]) && r.hook.length === runs[0].hook.length);

  if (!same) {
    for (const r of runs.slice(1)) {
      for (const [k, n] of r.ctx.handlers) c.handlers.set(k, (c.handlers.get(k) ?? 0) + n);
      for (const t of r.ctx.todos) c.todos.add(t);
    }
    if (more) notes.push(`${node.count} on the captured screen; the first ${items.length} are written out — build the list from data`);
    else notes.push(`A list of ${items.length} — build it from data`);
    // Written out again without slots; the first pass already recorded what each item needs wiring.
    const quiet: Ctx = { ...c, handlers: new Map(), todos: new Set() };
    const lines = items.flatMap((item) => withNotes(emit(quiet, item, ind, inh), ind, true));
    return { notes, lines };
  }

  // Which slots vary between items become fields; the rest stay literal.
  const base = runs[0].hook;
  const fields = new Map<number, string>();
  const used = new Set<string>();
  base.forEach((slot, i) => {
    if (runs.every((r) => r.hook[i].value === slot.value)) return;
    let name = IDENT.test(slot.hint) ? slot.hint : 'value';
    for (let n = 2; used.has(name); n += 1) name = `${slot.hint}${n}`;
    used.add(name);
    fields.set(i, name);
  });

  const root = runs[0].lines.findIndex((l) => l.trimStart().startsWith('<'));
  const addKey = (lines: string[], key: string) => lines.map((l, i) => (i === root ? l.replace(/^(\s*<[\w.]+)/, `$1 key={${key}}`) : l));

  if (!fields.size) {
    notes.push(`${node.count} alike`);
    const body = addKey(replaceSlots(runs[0].lines, (i) => renderSlotLiteral(base[i])), 'index');
    return { notes, lines: [`${pad(ind)}{Array.from({ length: ${node.count} }, (_, index) => (`, ...body, `${pad(ind)}))}`] };
  }

  let listName = `${snake(itemName(items[0]))}_ITEMS`;
  for (let n = 2; c.listNames.has(listName); n += 1) listName = `${snake(itemName(items[0]))}_ITEMS_${n}`;
  c.listNames.add(listName);

  const unique = [...fields.entries()].find(([i]) => {
    const values = runs.map((r) => r.hook[i].value);
    return typeof values[0] === 'string' && new Set(values).size === values.length;
  });
  const key = unique ? `item.${unique[1]}` : 'index';

  const data = runs.map((r) => `  { ${[...fields.entries()].map(([i, f]) => `${f}: ${literal(r.hook[i].value)}`).join(', ')} },`);
  c.lists.push(
    [
      more ? `/** ${items.length} of the ${node.count} on the captured screen — sample data; load the real list. */` : `/** Sample data, as captured. */`,
      `const ${listName} = [`,
      ...data,
      '] as const;',
    ].join('\n'),
  );
  c.listNotes.push(`\`${listName}\`: ${items.length}${more ? ` of ${node.count}` : ''} ${itemName(items[0])} items, fields ${[...fields.values()].map((f) => `\`${f}\``).join(', ')}.`);

  const body = addKey(
    replaceSlots(runs[0].lines, (i) => {
      const field = fields.get(i);
      const slot = base[i];
      if (!field) return renderSlotLiteral(slot);
      return slot.pos === 'text' ? `{item.${field}}` : `={item.${field}}`;
    }),
    key,
  );
  const args = key === 'index' ? '(item, index)' : '(item)';
  return { notes, lines: [`${pad(ind)}{${listName}.map(${args} => (`, ...body, `${pad(ind)}))}`] };
}

// ---------------------------------------------------------------- file

export function pascal(name: string): string {
  const words = name.replace(/\.atoms$/, '').split(/[^A-Za-z0-9]+/).filter(Boolean);
  const out = words.map((w) => w[0].toUpperCase() + w.slice(1)).join('');
  return /^[A-Za-z]/.test(out) ? out : `Screen${out}`;
}

/** Finds a node by id, or the first one marking a pattern region by that name. */
export function findNode(root: HandoverNode, query: string): HandoverNode | null {
  let byRegion: HandoverNode | null = null;
  const walk = (n: HandoverNode): HandoverNode | null => {
    if (n.id === query) return n;
    if (!byRegion && 'region' in n && n.region === query) byRegion = n;
    const kids = n.kind === 'repeat' ? n.items : 'children' in n ? (n.children ?? []) : [];
    for (const k of kids) {
      const hit = walk(k);
      if (hit) return hit;
    }
    return null;
  };
  return walk(root) ?? byRegion;
}

/** Every node id in a subtree, to keep only the gaps that fall inside it. */
function idsIn(root: HandoverNode): Set<string> {
  const ids = new Set<string>();
  const walk = (n: HandoverNode) => {
    if (n.id) ids.add(n.id);
    const kids = n.kind === 'repeat' ? n.items : 'children' in n ? (n.children ?? []) : [];
    kids.forEach(walk);
  };
  walk(root);
  return ids;
}

/** Every `{ light, dark }` leaf under the colour roots, by value. */
export function colourPairs(tokens: Record<string, unknown>): Map<string, string[]> {
  const out = new Map<string, string[]>();
  const walk = (v: unknown, path: string) => {
    if (!v || typeof v !== 'object') return;
    const o = v as Record<string, unknown>;
    if (typeof o.light === 'string' && typeof o.dark === 'string') {
      const key = `${o.light.toLowerCase()}|${o.dark.toLowerCase()}`;
      out.set(key, [...(out.get(key) ?? []), path]);
      return;
    }
    for (const [k, child] of Object.entries(o)) walk(child, /^\d+$/.test(k) ? `${path}[${k}]` : IDENT.test(k) ? `${path}.${k}` : `${path}[${quote(k)}]`);
  };
  for (const root of MODE_ROOTS) walk(tokens[root], root);
  return out;
}

export function screenCode(doc: Handover, root: HandoverNode, known: Iterable<string>, componentName: string, pairs: Map<string, string[]> = new Map(), part?: string): ScreenCode {
  const inside = idsIn(root);
  const gaps: Gap[] = [];
  const byNode = new Map<string, Gap[]>();
  for (const d of doc.deviations ?? []) {
    if (d.resolution?.status === 'fixed') continue;
    if (!d.nodes.some((id) => inside.has(id))) continue;
    const gap = { n: gaps.length + 1, deviation: d };
    gaps.push(gap);
    for (const id of d.nodes) byNode.set(id, [...(byNode.get(id) ?? []), gap]);
  }

  const c: Ctx = {
    atoms: new Set(),
    icons: new Set(),
    tokens: new Set(),
    known: new Set(known),
    unknown: new Set(),
    handlers: new Map(),
    todos: new Set(),
    lists: [],
    listNotes: [],
    listNames: new Set(),
    gaps: byNode,
    pairs,
    version: doc.formatVersion ?? 1,
    hook: null,
    inList: 0,
  };

  const body = emit(c, root, 2, { type: '13 / 20', weight: '400' });
  const jsx = withNotes(body, 2, false);
  const multiple = root.kind === 'repeat' || root.kind === 'text';
  const returned = multiple ? ['    <>', ...jsx.map((l) => `  ${l}`), '    </>'] : jsx;

  const named = (set: Set<string>) => [...set].sort();
  const importLine = (names: string[], from: string) =>
    names.length ? (names.join(', ').length > 60 ? `import {\n${names.map((n) => `  ${n},`).join('\n')}\n} from '${from}';` : `import { ${names.join(', ')} } from '${from}';`) : '';

  const header = [
    `/**`,
    part
      ? ` * \`${safeComment(part)}\` of ${safeComment(doc.name)}, rebuilt from its Atoms export (${doc.source.mode} mode).`
      : ` * ${safeComment(doc.name)} — rebuilt from its Atoms export (${doc.scope.kind === 'screen' ? 'the whole screen' : `"${safeComment(doc.scope.label)}"`}, ${doc.scope.size.width}×${doc.scope.size.height}, ${doc.source.mode} mode).`,
    ...(doc.note ? [` *`, ` * Designer's note: ${safeComment(doc.note)}`] : []),
    ` */`,
  ];

  const code = [
    `'use client';`,
    '',
    ...[importLine(named(c.atoms), '@neofloai/atoms'), importLine(named(c.icons), '@neofloai/atoms/icons'), importLine(named(c.tokens), '@neofloai/atoms/tokens')].filter(Boolean),
    '',
    ...(c.lists.length ? [c.lists.join('\n\n'), ''] : []),
    ...header,
    `export default function ${componentName}() {`,
    '  return (',
    ...returned,
    '  );',
    '}',
    '',
  ].join('\n');

  return {
    componentName,
    code,
    components: named(c.atoms),
    icons: named(c.icons),
    unknown: named(c.unknown),
    handlers: [...c.handlers.entries()].map(([what, count]) => ({ what, count })),
    todos: [...c.todos],
    lists: c.listNotes,
    gaps,
  };
}
