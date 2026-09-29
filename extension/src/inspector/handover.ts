/**
 * The handover export: one screen, or one selected area, as an
 * `atoms-screen` JSON document a developer pastes into Claude with the
 * Atoms MCP connected.
 *
 * It is read off React's fiber tree, not guessed from pixels. Every Atoms
 * component is written with the props the designer's code gave it, layout
 * primitives with their gaps and padding as token names, and everything
 * else as a plain element with its styles matched to tokens. What the
 * library drew inside a component is left out — the component's name and
 * props already say it — except where the caller passed content in.
 */
import { ATOMS_VERSION } from '../../../src/release/version';
import { declaredMarks, flattenSx, pageVersions, type SxEntry } from './drift';
import {
  atomsNameOf,
  displayNameOf,
  elementName,
  fiberOf,
  firstHost,
  iconNameOf,
  isAtomsName,
  primitiveAt,
  type Fiber,
} from './react';
import { rows, scanDrift, VISUAL_KEY, type Row } from './rows';
import type { Match, Mode } from './tokens';

import {
  BUILD_LINE,
  HANDOVER_FORMAT,
  HANDOVER_FORMAT_VERSION,
  type ComponentNode,
  type Deviation,
  type ElementNode,
  type Handover,
  type HandoverNode,
  type IconNode,
  type Layout,
  type LayoutNode,
  type Rect,
  type StyleValue,
  type TextNode,
} from '../shared/schema';

export type { Handover, HandoverNode } from '../shared/schema';

export type HandoverScope = { kind: 'screen' } | { kind: 'selection'; el: Element; label: string };

// ---------------------------------------------------------------- values

const MAX_NODES = 4000;
const MAX_ARRAY = 20;
const MAX_STRING = 400;

/** A prop value as JSON: elements by name, functions as a marker, long lists shortened. */
function serialize(value: unknown, depth = 0, seen = new WeakSet<object>()): unknown {
  if (value === undefined) return undefined;
  if (value === null || typeof value === 'boolean' || typeof value === 'number') return value;
  if (typeof value === 'string') return value.length > MAX_STRING ? `${value.slice(0, MAX_STRING)}…` : value;
  if (typeof value === 'function') return '<function>';
  if (typeof value !== 'object') return String(value);
  if (value instanceof Date) return value.toISOString();
  if (value instanceof Element) return `<${value.tagName.toLowerCase()} element>`;
  const name = elementName(value);
  if (name) {
    const props = (value as { props?: Record<string, unknown> }).props ?? {};
    const out: Record<string, unknown> = { $element: name };
    const inner = serializeProps(props, depth + 1, seen);
    if (Object.keys(inner).length) out.props = inner;
    const text = textOf(props.children);
    if (text) out.text = text;
    return out;
  }
  if (seen.has(value)) return '<circular>';
  if (depth > 4) return Array.isArray(value) ? `<${value.length} items>` : '<object>';
  seen.add(value);
  if (Array.isArray(value)) {
    const items = value.slice(0, MAX_ARRAY).map((v) => serialize(v, depth + 1, seen));
    if (value.length > MAX_ARRAY) items.push(`<${value.length - MAX_ARRAY} more>`);
    return items;
  }
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    const s = serialize(v, depth + 1, seen);
    if (s !== undefined) out[k] = s;
  }
  return out;
}

const SKIPPED_PROPS = new Set(['children', 'key', 'ref', 'className', 'ownerState', 'sx', 'style']);

function serializeProps(props: Record<string, unknown>, depth = 0, seen = new WeakSet<object>()) {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (SKIPPED_PROPS.has(key) || key.startsWith('data-atoms-') || value === undefined) continue;
    out[key] = serialize(value, depth, seen);
  }
  return out;
}

/** Plain text children (`"Submit"`, `["3", " invoices"]`), or null when there are elements. */
function textOf(children: unknown): string | null {
  if (typeof children === 'string' || typeof children === 'number') return String(children);
  if (Array.isArray(children) && children.length && children.every((c) => typeof c === 'string' || typeof c === 'number' || c == null || typeof c === 'boolean')) {
    const text = children.filter((c) => typeof c === 'string' || typeof c === 'number').join('');
    return text || null;
  }
  return null;
}

/**
 * The props objects of every element passed into a component. A fiber
 * whose props are one of these was written by the caller, even though it
 * renders deep inside the component's own markup. Elements passed as
 * `children` are walked as part of the tree; those passed through other
 * props (`startIcon`, `action`) are already written out in `props`, so
 * they are collected apart and skipped. Components that clone their
 * children (Tooltip, Tabs) hand them new props objects, so the types of
 * components passed as children are kept too.
 */
function passedElements(props: Record<string, unknown> | null, children: Set<object>, others: Set<object>, types: Set<unknown>) {
  if (!props) return;
  let into = children;
  const visit = (value: unknown, d: number) => {
    if (!value || typeof value !== 'object' || d > 6) return;
    if (Array.isArray(value)) {
      for (const v of value) visit(v, d + 1);
      return;
    }
    if ('$$typeof' in value && 'props' in value) {
      into.add((value as { props: object }).props);
      // `cloneElement` (Tooltip, Tabs) gives the child new props, but keeps its type.
      const type = (value as { type?: unknown }).type;
      if (into === children && type && typeof type !== 'string') types.add(type);
      return;
    }
    if (d < 2 && Object.getPrototypeOf(value) === Object.prototype) {
      for (const v of Object.values(value)) visit(v, d + 1);
    }
  };
  for (const [key, value] of Object.entries(props)) {
    if (key === 'sx' || key === 'style') continue;
    into = key === 'children' ? children : others;
    visit(value, 0);
  }
}

/** The component whose own render created this fiber, in a development build. */
function ownerName(fiber: Fiber): string | null {
  const owner = fiber._debugOwner;
  if (!owner) return null;
  if ('type' in owner) return displayNameOf((owner as Fiber).type) ?? null;
  return (owner as { name?: string }).name ?? null;
}

// ---------------------------------------------------------------- styles

const ZERO = /^-?0(px)?$/;

/** A row's match as a schema value. */
/** `a: 1px; b: rgb(0, 0, 0)` as a record. */
function declarations(css: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const part of css.split(/;(?![^(]*\))/)) {
    const i = part.indexOf(':');
    if (i > 0) out[part.slice(0, i).trim()] = part.slice(i + 1).trim();
  }
  return out;
}

function styleValue(match: Match, css: string): StyleValue {
  const out: StyleValue = { value: match.value, css: declarations(css) };
  if (match.status === 'off') {
    out.off = true;
    if (match.note) out.note = match.note;
  } else if (match.tokens.length === 1) out.token = match.tokens[0];
  else if (match.tokens.length > 1) out.candidates = match.tokens;
  if (match.status === 'warn' && match.note) out.note = match.note;
  if (match.status === 'drift' && match.note) out.note = match.note;
  return out;
}

const camel = (label: string) =>
  label
    .toLowerCase()
    .replace(/\s+(\w)/g, (_, c: string) => c.toUpperCase());

/** The styles an element sets, each with its token. Zero padding, margins and gaps are left out. */
function stylesOf(list: Row[]): Record<string, StyleValue> {
  const out: Record<string, StyleValue> = {};
  for (const row of list) {
    if (/^(Padding|Margin|Gap|Row gap|Column gap)/.test(row.label) && ZERO.test(row.match.value)) continue;
    out[camel(row.label)] = styleValue(row.match, row.css);
  }
  // Four equal sides read as one value.
  for (const box of ['padding', 'margin']) {
    const sides = ['Top', 'Right', 'Bottom', 'Left'].map((s) => out[`${box}${s}`]);
    if (sides.every((v) => v && v.value === sides[0]!.value)) {
      out[box] = { ...sides[0]!, css: { [box]: sides[0]!.value } };
      for (const s of ['Top', 'Right', 'Bottom', 'Left']) delete out[`${box}${s}`];
    }
  }
  return out;
}

function layoutOf(el: Element): Layout | undefined {
  const s = getComputedStyle(el);
  if (!/flex|grid/.test(s.display)) return undefined;
  const layout: Layout = { display: s.display.replace('inline-', 'inline ') };
  if (s.display.includes('flex')) {
    layout.direction = s.flexDirection;
    if (s.flexWrap !== 'nowrap') layout.wrap = s.flexWrap;
  } else if (s.gridTemplateColumns !== 'none') {
    layout.columns = s.gridTemplateColumns;
  }
  if (s.alignItems !== 'normal') layout.align = s.alignItems;
  if (s.justifyContent !== 'normal') layout.justify = s.justifyContent;
  return layout;
}

const REPLACED = /^(img|svg|input|textarea|select|canvas|video|iframe|hr)$/;

/** What a renderer needs to size and place an element in its parent. Defaults are left out. */
function boxOf(el: Element): Record<string, string> | undefined {
  const s = getComputedStyle(el);
  const out: Record<string, string> = {};
  const keep = (property: string, skip: string[]) => {
    const value = s.getPropertyValue(property);
    if (value && !skip.includes(value)) out[property] = value;
  };
  keep('flex-grow', ['0']);
  keep('flex-shrink', ['1']);
  keep('flex-basis', ['auto']);
  keep('align-self', ['auto']);
  keep('position', ['static']);
  if (out.position) for (const side of ['top', 'right', 'bottom', 'left']) keep(side, ['auto']);
  keep('overflow', ['visible']);
  keep('text-align', ['start', 'left']);
  keep('white-space', ['normal']);
  keep('text-overflow', ['clip']);
  keep('min-width', ['auto', '0px']);
  keep('max-width', ['none']);
  keep('grid-column', ['auto', 'auto / auto']);
  keep('grid-row', ['auto', 'auto / auto']);
  if (!/flex|grid/.test(s.display) && s.display !== 'block') keep('display', ['inline']);
  if (REPLACED.test(el.tagName.toLowerCase())) {
    const r = el.getBoundingClientRect();
    out.width = `${Math.round(r.width)}px`;
    out.height = `${Math.round(r.height)}px`;
  }
  return Object.keys(out).length ? out : undefined;
}

/** An inline SVG's markup without scripts or handlers, when it is small enough to carry. */
function svgMarkup(el: Element): string | undefined {
  const copy = el.cloneNode(true) as Element;
  for (const bad of Array.from(copy.querySelectorAll('script, foreignObject'))) bad.remove();
  for (const node of [copy, ...Array.from(copy.querySelectorAll('*'))]) {
    for (const attr of Array.from(node.attributes)) {
      if (/^on/i.test(attr.name) || /javascript:/i.test(attr.value)) node.removeAttribute(attr.name);
    }
  }
  const markup = copy.outerHTML;
  return markup.length <= 30_000 ? markup : undefined;
}

function attrsOf(el: Element): Record<string, string> | undefined {
  const out: Record<string, string> = {};
  for (const name of ['src', 'alt', 'href', 'placeholder', 'type', 'title']) {
    const value = el.getAttribute(name);
    if (value) out[name] = value;
  }
  if (el instanceof HTMLImageElement && el.currentSrc) out.src = el.currentSrc;
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
    if (el.value) out.value = el.value;
  }
  if (el instanceof SVGSVGElement) {
    const markup = svgMarkup(el);
    if (markup) out.markup = markup;
  }
  return Object.keys(out).length ? out : undefined;
}

// ---------------------------------------------------------------- tree

const SKIPPED_TAGS = new Set(['script', 'style', 'link', 'meta', 'noscript', 'template', 'head', 'title', 'atoms-inspector', 'nextjs-portal']);

function hidden(el: Element): boolean {
  if (SKIPPED_TAGS.has(el.tagName.toLowerCase())) return true;
  const s = getComputedStyle(el);
  // `display: contents` draws no box of its own, but its children are on screen (MUI X grid rows).
  if (s.display === 'contents') return false;
  if (!el.getClientRects().length) return true;
  return s.visibility === 'hidden' || s.opacity === '0';
}

interface Context {
  /** True while walking what the designer's code wrote; false inside a component's own markup. */
  user: boolean;
  /** Props objects of elements passed into the enclosing components as children. */
  passed: Set<object>;
  /** Props objects of elements passed through other props, which `props` already describes. */
  inProps: Set<object>;
  /** Component types passed as children, which may reach the tree cloned. */
  types: Set<unknown>;
  /** The nearest enclosing Atoms component. */
  parent: string | null;
}

class Builder {
  private count = 0;
  truncated = false;
  readonly components: Record<string, number> = {};
  readonly layouts: Record<string, number> = {};
  readonly icons = new Set<string>();
  readonly tokens = new Set<string>();
  readonly deviations: Deviation[] = [];
  /** Host element → node id, for placing drift hits. */
  readonly hosts = new Map<Element, { id: string; component?: string }>();
  readonly regions = new Set<string>();

  constructor(
    private readonly origin: DOMRect,
    private readonly mode: Mode,
  ) {}

  private nextId(prefix: string) {
    this.count += 1;
    if (this.count > MAX_NODES) this.truncated = true;
    return `${prefix}${this.count}`;
  }

  private rect(el: Element | null): Rect {
    if (!el) return [0, 0, 0, 0];
    const r = el.getBoundingClientRect();
    return [Math.round(r.left - this.origin.left), Math.round(r.top - this.origin.top), Math.round(r.width), Math.round(r.height)];
  }

  private region(el: Element | null): string | undefined {
    const region = el?.getAttribute('data-atoms-region') ?? undefined;
    if (region) this.regions.add(region);
    return region;
  }

  private collectTokens(styles: Record<string, StyleValue> | undefined) {
    for (const v of Object.values(styles ?? {})) if (v.token) this.tokens.add(v.token);
  }

  private offTokens(id: string, styles: Record<string, StyleValue> | undefined, component?: string) {
    for (const [property, v] of Object.entries(styles ?? {})) {
      // A margin past the spacing scale positions a block (beside a sidebar); it is layout, not a spacing choice.
      if (property.startsWith('margin') && Math.abs(parseFloat(v.value)) > 64) continue;
      if (v.off) this.deviate({ kind: 'off-token', component, property, value: v.value, note: v.note }, id);
    }
  }

  private sxDeviations(id: string, name: string, sx: SxEntry[], style: Record<string, string> | undefined, primitive: boolean) {
    for (const e of sx) {
      const visual = !!e.selector || VISUAL_KEY.test(e.key);
      // A primitive's `sx` is how layout is written; only restyling a component is a deviation.
      if (primitive || !visual) continue;
      this.deviate({ kind: 'sx', component: name, property: e.selector ? `${e.selector} ${e.key}` : e.key, value: e.value }, id);
    }
    for (const [property, value] of Object.entries(style ?? {})) {
      this.deviate({ kind: 'style', component: name, property, value }, id);
    }
  }

  private readonly byKey = new Map<string, Deviation>();

  /** Records a deviation, folding repeats of the same one into a single entry. */
  deviate(d: Omit<Deviation, 'nodes'>, node: string) {
    const key = [d.kind, d.component, d.property, d.value, d.note].join('|');
    const existing = this.byKey.get(key);
    if (existing) {
      existing.nodes.push(node);
      return;
    }
    const entry: Deviation = { kind: d.kind, nodes: [node], property: d.property, value: d.value };
    if (d.component) entry.component = d.component;
    if (d.note) entry.note = d.note;
    this.byKey.set(key, entry);
    this.deviations.push(entry);
  }

  walk(fiber: Fiber | null, ctx: Context, out: HandoverNode[]) {
    for (let f = fiber; f; f = f.sibling) {
      if (this.truncated) return;
      this.visit(f, ctx, out);
    }
  }

  visit(f: Fiber, ctx: Context, out: HandoverNode[]) {
    const props = f.memoizedProps;
    if (props && typeof props === 'object' && ctx.inProps.has(props)) return;
    const user =
      ctx.user ||
      (!!props && typeof props === 'object' && ctx.passed.has(props)) ||
      (typeof f.type !== 'string' && !!f.type && ctx.types.has(f.type));

    const name = atomsNameOf(f);
    if (name) {
      // Drawn by another Atoms component's own implementation: part of that component, not placed.
      const owner = ownerName(f);
      const internal = !user && isAtomsName(owner);
      if (internal) {
        this.walk(f.child, ctx, out);
        return;
      }
      out.push(this.component(f, name, user ? null : ctx.parent, ctx));
      return;
    }

    const icon = iconNameOf(f);
    if (icon) {
      if (user) out.push(this.iconNode(f, icon));
      return;
    }

    if (typeof f.type === 'string') {
      const el = f.stateNode as Element;
      if (!(el instanceof Element) || hidden(el)) return;
      // An inline SVG is one picture; its shapes are not layout.
      if (el instanceof SVGElement && !(el instanceof SVGSVGElement)) return;
      if (user && el instanceof SVGSVGElement) {
        const id = this.nextId('e');
        this.hosts.set(el, { id });
        const node: ElementNode = { kind: 'element', id, tag: 'svg', rect: this.rect(el) };
        const box = boxOf(el);
        if (box) node.box = box;
        const attrs = attrsOf(el);
        if (attrs) node.attrs = attrs;
        out.push(node);
        return;
      }
      if (!user) {
        this.walk(f.child, ctx, out);
        return;
      }
      const primitive = primitiveAt(f);
      if (primitive) out.push(this.layout(el, primitive.name, primitive.fiber, f, ctx));
      else this.element(el, f, ctx, out);
      return;
    }

    if (f.tag === 6) {
      const text = typeof props === 'string' ? (props as string) : '';
      if (user && text.trim()) out.push({ kind: 'text', text: text.length > MAX_STRING ? `${text.slice(0, MAX_STRING)}…` : text });
      return;
    }

    this.walk(f.child, user ? { ...ctx, user: true } : ctx, out);
  }

  component(f: Fiber, name: string, renderedBy: string | null, ctx: Context): ComponentNode {
    // `memo(forwardRef())` is two fibers of the same name; the outer one holds the props.
    let inner = f;
    while (inner.child && !inner.child.sibling && atomsNameOf(inner.child) === name) inner = inner.child;
    const props = f.memoizedProps ?? {};
    const host = firstHost(f);
    const id = this.nextId('c');
    const node: ComponentNode = { kind: 'component', id, name, rect: this.rect(host), props: serializeProps(props) };
    const region = this.region(host);
    if (region) node.region = region;
    const text = textOf(props.children);
    if (text) node.text = text;
    const sx = flattenSx(props.sx);
    if (sx.length) node.sx = serialize(props.sx);
    const style = props.style && typeof props.style === 'object'
      ? Object.fromEntries(Object.entries(props.style as Record<string, unknown>).map(([k, v]) => [k, String(v)]))
      : undefined;
    if (style && Object.keys(style).length) node.style = style;
    if (renderedBy) {
      node.renderedBy = renderedBy;
      const cell = host?.closest('[data-field]');
      const row = cell?.closest('[data-id]');
      if (cell && row) node.cell = { row: row.getAttribute('data-id')!, field: cell.getAttribute('data-field')! };
    }
    if (host && name === 'DataGrid') {
      const cells = gridCells(host);
      if (cells) node.cells = cells;
    }
    if (host) {
      const marks = declaredMarks(host);
      if (Object.keys(marks).length) {
        node.tokens = marks;
        for (const t of Object.values(marks)) for (const part of t.split('|')) this.tokens.add(part.replace(/@(light|dark)$/, ''));
      }
      this.hosts.set(host, { id, component: name });
    }
    this.components[name] = (this.components[name] ?? 0) + 1;
    this.countPropElements(node.props);
    this.sxDeviations(id, name, sx, style, false);

    const passed = new Set(ctx.passed);
    const inProps = new Set(ctx.inProps);
    const types = new Set<unknown>();
    passedElements(props, passed, inProps, types);
    const children: HandoverNode[] = [];
    this.walk(inner.child, { user: false, passed, inProps, types, parent: name }, children);
    if (children.length) node.children = collapse(children);
    return node;
  }

  /** Components and icons passed through props (`startIcon={<CaretDownIcon />}`) count toward the summary too. */
  private countPropElements(value: unknown) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) {
      for (const v of value) this.countPropElements(v);
      return;
    }
    const element = (value as { $element?: unknown }).$element;
    if (typeof element === 'string') {
      if (isAtomsName(element)) this.components[element] = (this.components[element] ?? 0) + 1;
      else if (/Icon$/.test(element)) this.icons.add(element);
    }
    for (const v of Object.values(value)) this.countPropElements(v);
  }

  iconNode(f: Fiber, name: string): IconNode {
    this.icons.add(name);
    return { kind: 'icon', id: this.nextId('i'), name, props: serializeProps(f.memoizedProps ?? {}), rect: this.rect(firstHost(f)) };
  }

  layout(el: Element, name: string, fiber: Fiber, host: Fiber, ctx: Context): LayoutNode {
    const id = this.nextId('l');
    const props = fiber.memoizedProps ?? {};
    const node: LayoutNode = { kind: 'layout', id, name, rect: this.rect(el), props: serializeProps(props) };
    const region = this.region(el);
    if (region) node.region = region;
    const layout = layoutOf(el);
    if (layout) node.layout = layout;
    const styles = stylesOf(rows(el, this.mode, false));
    if (Object.keys(styles).length) node.styles = styles;
    if (props.sx) node.sx = serialize(props.sx);
    this.collectTokens(styles);
    this.offTokens(id, styles, name);
    this.hosts.set(el, { id, component: name });
    this.layouts[name] = (this.layouts[name] ?? 0) + 1;
    const children: HandoverNode[] = [];
    this.walk(host.child, { ...ctx, user: true }, children);
    ownText(host, children);
    if (children.length) node.children = collapse(children);
    return node;
  }

  /** A plain element. One that neither styles nor lays anything out is dropped, and its children take its place. */
  element(el: Element, f: Fiber, ctx: Context, out: HandoverNode[]) {
    const children: HandoverNode[] = [];
    this.walk(f.child, { ...ctx, user: true }, children);
    ownText(f, children);
    const styles = stylesOf(rows(el, this.mode, false));
    const layout = layoutOf(el);
    const region = this.region(el);
    const onlyText = children.length === 1 && children[0].kind === 'text';
    const meaningful = Object.keys(styles).length || layout || region || /^(img|svg|input|textarea|select|button|a|hr|canvas|video|iframe)$/.test(el.tagName.toLowerCase());
    if (!meaningful && !onlyText) {
      out.push(...children);
      return;
    }
    const id = this.nextId('e');
    const node: ElementNode = { kind: 'element', id, tag: el.tagName.toLowerCase(), rect: this.rect(el) };
    if (region) node.region = region;
    if (onlyText) node.text = (children[0] as TextNode).text;
    else if (children.length) node.children = collapse(children);
    if (layout) node.layout = layout;
    if (Object.keys(styles).length) node.styles = styles;
    const box = boxOf(el);
    if (box) node.box = box;
    const attrs = attrsOf(el);
    if (attrs) node.attrs = attrs;
    this.collectTokens(styles);
    this.offTokens(id, styles);
    this.hosts.set(el, { id });
    out.push(node);
  }

  /** Without React: the same elements, read from the DOM alone. */
  domElement(el: Element, out: HandoverNode[]) {
    if (hidden(el) || this.truncated) return;
    if (el instanceof SVGElement) {
      if (el instanceof SVGSVGElement) out.push({ kind: 'element', id: this.nextId('e'), tag: 'svg', rect: this.rect(el) });
      return;
    }
    const children: HandoverNode[] = [];
    for (const child of Array.from(el.childNodes)) {
      if (child instanceof Element) this.domElement(child, children);
      else if (child.nodeType === Node.TEXT_NODE && child.textContent?.trim()) children.push({ kind: 'text', text: child.textContent.trim() });
    }
    const fake = { child: null } as unknown as Fiber;
    const before = out.length;
    this.element(el, fake, { user: true, passed: new Set(), inProps: new Set(), types: new Set(), parent: null }, out);
    const node = out[before];
    if (out.length === before + 1 && node && node.kind === 'element' && node.tag === el.tagName.toLowerCase()) {
      if (children.length === 1 && children[0].kind === 'text') node.text = (children[0] as TextNode).text;
      else if (children.length) node.children = collapse(children);
    } else {
      out.push(...children);
    }
  }
}

/**
 * What each visible grid cell reads, so a rebuild can show formatted
 * values (`$4,250.00`) that a column's formatter produced.
 */
function gridCells(host: Element): Record<string, Record<string, string>> | undefined {
  const out: Record<string, Record<string, string>> = {};
  for (const row of Array.from(host.querySelectorAll('[role="row"][data-id]')).slice(0, 50)) {
    const cells: Record<string, string> = {};
    for (const cell of Array.from(row.querySelectorAll('[role="gridcell"][data-field]'))) {
      const text = (cell as HTMLElement).innerText?.trim() ?? '';
      if (text) cells[cell.getAttribute('data-field')!] = text.slice(0, 200);
    }
    out[row.getAttribute('data-id')!] = cells;
  }
  return Object.keys(out).length ? out : undefined;
}

/**
 * An element whose only child is a string has no text fiber — React sets
 * its text content directly — so the string is read from its props.
 */
function ownText(host: Fiber, children: HandoverNode[]) {
  const own = host.memoizedProps?.children;
  if (!children.length && (typeof own === 'string' || typeof own === 'number') && String(own).trim()) {
    const text = String(own);
    children.push({ kind: 'text', text: text.length > MAX_STRING ? `${text.slice(0, MAX_STRING)}…` : text });
  }
}

/** The shape of a node, ignoring its content — siblings with one shape are a list. */
function shape(node: HandoverNode, depth = 0): string {
  if (node.kind === 'text') return 't';
  if (node.kind === 'repeat') return `r(${shape(node.items[0], depth)})`;
  const head = node.kind === 'element' ? node.tag : node.name;
  const keys = 'props' in node ? Object.keys(node.props).sort().join(',') : '';
  const kids = depth < 3 && 'children' in node && node.children ? node.children.map((c) => shape(c, depth + 1)).join(';') : '';
  return `${node.kind}:${head}[${keys}]{${kids}}`;
}

/**
 * Items a list keeps in full. Short lists — four alerts, six cards — keep
 * every item, since each says something different; long ones (table rows,
 * a feed) keep the first dozen as samples.
 */
const LIST_ITEMS = 12;

/** Runs of three or more siblings with the same shape become one `repeat`. */
function collapse(nodes: HandoverNode[]): HandoverNode[] {
  const out: HandoverNode[] = [];
  for (let i = 0; i < nodes.length; ) {
    const s = shape(nodes[i]);
    let j = i + 1;
    while (j < nodes.length && shape(nodes[j]) === s) j += 1;
    if (j - i >= 3 && nodes[i].kind !== 'text') out.push({ kind: 'repeat', count: j - i, items: nodes.slice(i, Math.min(j, i + LIST_ITEMS)) });
    else out.push(...nodes.slice(i, j));
    i = j;
  }
  return out;
}

// ---------------------------------------------------------------- build

const README = [
  'This file describes a screen built with @neofloai/atoms. Rebuild it with the same library, using the Atoms MCP.',
  BUILD_LINE,
  'Start with check_version (atoms.version is the release the design used) or start_project for a new app.',
  'If pattern is set, call get_pattern with pattern.name first and follow its arrangement; region names match its regions.',
  'Call get_component for every name in summary.components before using it. props are exactly what the design passed; keep them.',
  'layout nodes are Stack / Box / Grid / Container with their props; gaps and padding are given as token names.',
  'element nodes are plain markup the design wrote itself; build them from the named tokens, or use the Atoms component that fits.',
  'icon nodes are exports of @neofloai/atoms/icons.',
  'repeat nodes are lists: build them from data. items lists every item of a short list and the first twelve of a long one; all text is sample content.',
  'deviations are places the design overrode Atoms (sx, style, off-token values, drift). Do not copy them as sx — use a prop, or raise them with the design team as a library gap.',
  'rect is [x, y, width, height] in CSS pixels from the top-left of the exported area. The image, when present, is the same area.',
];

/** The handover document for a scope. */
export function buildHandover(scope: HandoverScope, name: string, mode: Mode, marked: boolean): Handover {
  const root = scope.kind === 'screen' ? document.body : scope.el;
  const origin = scope.kind === 'screen' ? new DOMRect(-window.scrollX, -window.scrollY, 0, 0) : root.getBoundingClientRect();
  const builder = new Builder(origin, mode);
  const top: HandoverNode[] = [];

  const fiber = fiberOf(root);
  if (fiber) {
    // Start at the outermost fiber that renders only this element, so a
    // selected component is exported as itself rather than as its markup.
    let start: Fiber = fiber;
    for (let f = fiber.return; f && typeof f.type !== 'string' && f.tag !== 3; f = f.return) {
      if (f.child !== start || start.sibling) break;
      start = f;
    }
    const ctx: Context = { user: true, passed: new Set(), inProps: new Set(), types: new Set(), parent: null };
    if (scope.kind === 'screen') builder.walk(fiber.child, ctx, top);
    else builder.visit(start, ctx, top);
  } else {
    for (const child of Array.from(root.children)) builder.domElement(child, top);
  }

  const rootRect = root.getBoundingClientRect();
  const tree: HandoverNode =
    top.length === 1
      ? top[0]
      : { kind: 'element', id: 'root', tag: root.tagName.toLowerCase(), rect: [0, 0, Math.round(rootRect.width), Math.round(rootRect.height)], children: collapse(top) };

  // Colour drift the page scan finds inside the area, placed on the node that owns it.
  for (const hit of scanDrift(mode, 200, root)) {
    let owner: { id: string; component?: string } | undefined;
    for (let el: Element | null = hit.el; el && !owner; el = el.parentElement) owner = builder.hosts.get(el);
    builder.deviate({ kind: 'drift', component: owner?.component ?? hit.name, property: hit.row, value: hit.note.split(' · ')[0], note: hit.note.split(' · ').slice(1).join(' · ') }, owner?.id ?? 'root');
  }

  const patternEl = scope.kind === 'selection' ? scope.el.closest('[data-atoms-pattern]') ?? scope.el.querySelector('[data-atoms-pattern]') : document.querySelector('[data-atoms-pattern]');
  const patternName = patternEl?.getAttribute('data-atoms-pattern') ?? null;
  const versions = pageVersions();

  const handover: Handover = {
    format: HANDOVER_FORMAT,
    formatVersion: HANDOVER_FORMAT_VERSION,
    name,
    exportedAt: new Date().toISOString(),
    readme: README,
    atoms: { version: versions.length === 1 ? versions[0] : versions.length ? versions.join(' + ') : null, inspectorVersion: ATOMS_VERSION, marked },
    source: {
      url: `${location.origin}${location.pathname}`,
      title: document.title,
      viewport: { width: window.innerWidth, height: window.innerHeight },
      mode,
    },
    scope: {
      kind: scope.kind,
      label: scope.kind === 'screen' ? 'Whole screen' : scope.label,
      size: { width: Math.round(scope.kind === 'screen' ? document.documentElement.scrollWidth : rootRect.width), height: Math.round(scope.kind === 'screen' ? document.documentElement.scrollHeight : rootRect.height) },
    },
    pattern: patternName ? { name: patternName, regions: [...builder.regions] } : null,
    summary: {
      components: sortCounts(builder.components),
      layouts: sortCounts(builder.layouts),
      icons: [...builder.icons].sort(),
      tokens: [...builder.tokens].sort(),
    },
    deviations: builder.deviations,
    tree,
  };
  if (builder.truncated) handover.truncated = true;
  return handover;
}

function sortCounts(counts: Record<string, number>) {
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

/** A file-safe version of what the designer typed. */
export function fileName(name: string): string {
  const cleaned = name.trim().replace(/[^\w\- .]+/g, '-').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^[-.]+|[-.]+$/g, '');
  return cleaned || 'atoms-handover';
}
