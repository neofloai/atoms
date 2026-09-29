/**
 * The design as Studio holds it: a handover document whose tree is edited
 * in place through small operations, with undo history, and diffed
 * against the captured original when it is exported.
 */
import { describeOverride, overrideTokens } from './overrides';
import { ATOMS_VERSION } from '../../../src/release/version';
import {
  BUILD_LINE,
  HANDOVER_FORMAT_VERSION,
  type ComponentNode,
  type Deviation,
  type Edit,
  type Handover,
  type HandoverNode,
  type LayoutNode,
  type StyleValue,
} from '../shared/schema';

export type NodeWithId = Exclude<HandoverNode, never> & { id: string };

let counter = 0;
export const freshId = (prefix = 'n') => `${prefix}${Date.now().toString(36)}${(counter++).toString(36)}`;

/** The list a node keeps its children in: `children`, or a repeat's `items`. */
export function kidsOf(node: HandoverNode): HandoverNode[] | undefined {
  if (node.kind === 'repeat') return node.items;
  if (node.kind === 'text' || node.kind === 'icon') return undefined;
  return node.children;
}

function kidsFor(node: HandoverNode): HandoverNode[] | null {
  if (node.kind === 'repeat') return node.items;
  if (node.kind === 'text' || node.kind === 'icon') return null;
  if (node.kind === 'element' && /^(img|svg|input|textarea|hr|canvas|video|iframe)$/.test(node.tag)) return null;
  node.children ??= [];
  return node.children;
}

/** Whether a node can take children dropped into it. */
export function acceptsChildren(node: HandoverNode): boolean {
  if (node.kind === 'layout' || node.kind === 'repeat') return true;
  if (node.kind === 'element') return !/^(img|svg|input|textarea|hr|canvas|video|iframe)$/.test(node.tag) && !node.text;
  if (node.kind === 'component') return !!node.children?.some((c) => !('renderedBy' in c && c.renderedBy)) && !node.text;
  return false;
}

/**
 * Gives every node an id — text and repeat nodes have none straight from
 * the inspector. Derived from the parent and position, so the captured
 * original and the edited copy name the same node the same way.
 */
export function ensureIds(node: HandoverNode, parent = 'root', position = 0) {
  if (!node.id) (node as { id: string }).id = parent === 'root' && position === 0 && node.kind !== 'text' ? 'root' : `${parent}.${node.kind === 'text' ? 't' : 'r'}${position}`;
  (kidsOf(node) ?? []).forEach((kid, i) => ensureIds(kid, node.id!, i));
}

export interface Located {
  node: HandoverNode;
  parent: HandoverNode | null;
  index: number;
}

export function index(tree: HandoverNode): Map<string, Located> {
  const map = new Map<string, Located>();
  const visit = (node: HandoverNode, parent: HandoverNode | null, i: number) => {
    if (node.id) map.set(node.id, { node, parent, index: i });
    (kidsOf(node) ?? []).forEach((kid, j) => visit(kid, node, j));
  };
  visit(tree, null, 0);
  return map;
}

export function isInside(tree: HandoverNode, ancestorId: string, id: string): boolean {
  const map = index(tree);
  for (let at = map.get(id); at; at = at.parent?.id ? map.get(at.parent.id) : undefined) {
    if (at.node.id === ancestorId) return true;
    if (!at.parent) break;
  }
  return false;
}

export function labelOf(node: HandoverNode): string {
  switch (node.kind) {
    case 'component':
    case 'layout':
    case 'icon':
      return node.name;
    case 'element':
      return `<${node.tag}>`;
    case 'text':
      return `“${node.text.slice(0, 28)}${node.text.length > 28 ? '…' : ''}”`;
    case 'repeat':
      return `List × ${node.count}`;
  }
}

// ---------------------------------------------------------------- upgrade

/** Brings a version 1 file up to the shape Studio edits: raw `sx` objects rather than flattened entries. */
export function upgrade(doc: Handover): Handover {
  const next = structuredClone(doc);
  if ((next.formatVersion ?? 1) < 2) {
    const visit = (node: HandoverNode) => {
      if ((node.kind === 'component' || node.kind === 'layout') && Array.isArray(node.sx) && node.sx.every((e) => e && typeof e === 'object' && 'key' in e)) {
        const sx: Record<string, unknown> = {};
        for (const e of node.sx as { selector: string; key: string; value: string }[]) {
          const value = parseShown(e.value);
          if (value === undefined) continue;
          if (e.selector) ((sx[e.selector] ??= {}) as Record<string, unknown>)[e.key] = value;
          else sx[e.key] = value;
        }
        node.sx = sx;
      }
      for (const kid of kidsOf(node) ?? []) visit(kid);
    };
    visit(next.tree);
  }
  for (const d of next.deviations) if (!Array.isArray(d.nodes)) d.nodes = [(d as unknown as { node: string }).node];
  ensureIds(next.tree);
  return next;
}

/** A value as the inspector printed it (`"center"`, `3`, `theme(…)`) back to a value. */
function parseShown(shown: string): unknown {
  if (shown === 'theme(…)' || shown === 'ƒ') return undefined;
  try {
    return JSON.parse(shown);
  } catch {
    return shown.replace(/^"|"$/g, '');
  }
}

// ---------------------------------------------------------------- history

export interface History {
  doc: Handover;
  past: Handover[];
  future: Handover[];
}

const LIMIT = 100;

/** Applies `change` to a copy of the document and records the previous one for undo. */
export function apply(history: History, change: (doc: Handover) => void): History {
  const doc = structuredClone(history.doc);
  change(doc);
  return { doc, past: [...history.past.slice(-LIMIT + 1), history.doc], future: [] };
}

export function undo(history: History): History {
  const previous = history.past[history.past.length - 1];
  if (!previous) return history;
  return { doc: previous, past: history.past.slice(0, -1), future: [history.doc, ...history.future] };
}

export function redo(history: History): History {
  const [next, ...rest] = history.future;
  if (!next) return history;
  return { doc: next, past: [...history.past, history.doc], future: rest };
}

// ---------------------------------------------------------------- operations

export function find(doc: Handover, id: string): Located | undefined {
  return index(doc.tree).get(id);
}

export function removeNode(doc: Handover, id: string) {
  const at = find(doc, id);
  if (!at?.parent) return;
  kidsOf(at.parent)!.splice(at.index, 1);
  if (at.parent.kind === 'repeat') at.parent.count = Math.max(at.parent.items.length, at.parent.count - 1);
}

/** Moves a node into `parentId` at `position`, counted in the parent's list before the move. */
export function moveNode(doc: Handover, id: string, parentId: string, position: number) {
  const map = index(doc.tree);
  const at = map.get(id);
  const target = map.get(parentId);
  if (!at?.parent || !target || id === parentId || isInside(doc.tree, id, parentId)) return;
  const into = kidsFor(target.node);
  if (!into) return;
  const from = kidsOf(at.parent)!;
  let to = position;
  if (from === into && at.index < position) to -= 1;
  from.splice(at.index, 1);
  into.splice(Math.max(0, Math.min(to, into.length)), 0, at.node);
}

/** A deep copy with new ids throughout. */
export function cloneWithNewIds(node: HandoverNode): HandoverNode {
  const copy = structuredClone(node);
  const renew = (n: HandoverNode) => {
    (n as { id: string }).id = freshId(n.kind[0]);
    for (const kid of kidsOf(n) ?? []) renew(kid);
  };
  renew(copy);
  return copy;
}

export function duplicateNode(doc: Handover, id: string): string | null {
  const at = find(doc, id);
  if (!at?.parent) return null;
  const copy = cloneWithNewIds(at.node);
  kidsOf(at.parent)!.splice(at.index + 1, 0, copy);
  return copy.id ?? null;
}

/** Inserts `node` after the selection, or into it when it is a container. */
/** Inserts a new node at a position among a container's children. */
export function insertAt(doc: Handover, node: HandoverNode, parentId: string, position: number) {
  const target = index(doc.tree).get(parentId);
  const into = target ? kidsFor(target.node) : null;
  if (!into) return insertNode(doc, node, parentId);
  into.splice(Math.max(0, Math.min(position, into.length)), 0, node);
  return node.id!;
}

export function insertNode(doc: Handover, node: HandoverNode, near: string | null): string {
  const map = index(doc.tree);
  const at = near ? map.get(near) : undefined;
  if (at && acceptsChildren(at.node)) kidsFor(at.node)!.push(node);
  else if (at?.parent) kidsOf(at.parent)!.splice(at.index + 1, 0, node);
  else kidsFor(doc.tree)?.push(node);
  return node.id!;
}

/** Wraps a node in a new Stack. */
export function wrapInStack(doc: Handover, id: string, direction: 'row' | 'column'): string | null {
  const at = find(doc, id);
  if (!at?.parent) return null;
  const stack: LayoutNode = {
    kind: 'layout',
    id: freshId('l'),
    name: 'Stack',
    rect: 'rect' in at.node ? at.node.rect : [0, 0, 0, 0],
    props: { direction },
    layout: { display: 'flex', direction },
    styles: { gap: { value: '8px', token: 'spacing.component.xs', css: { gap: '8px' } } },
    children: [at.node],
  };
  kidsOf(at.parent)!.splice(at.index, 1, stack);
  return stack.id;
}

/** Style keys whose edit makes the matching `sx` keys (and Stack `spacing`) obsolete. */
const SX_KEYS: Record<string, string[]> = {
  gap: ['gap', 'rowGap', 'columnGap'],
  rowGap: ['rowGap'],
  columnGap: ['columnGap'],
  padding: ['p', 'padding', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft', 'paddingX', 'paddingY'],
  margin: ['m', 'margin', 'mx', 'my', 'mt', 'mr', 'mb', 'ml', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'marginX', 'marginY'],
  background: ['bgcolor', 'backgroundColor', 'background'],
  text: ['color'],
  border: ['border', 'borderColor', 'borderWidth', 'borderStyle'],
  radius: ['borderRadius'],
  shadow: ['boxShadow'],
  type: ['fontSize', 'lineHeight', 'letterSpacing', 'typography'],
  weight: ['fontWeight'],
  family: ['fontFamily'],
};
for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
  const short = side[0].toLowerCase();
  SX_KEYS[`padding${side}`] = [`p${short}`, `padding${side}`, side === 'Top' || side === 'Bottom' ? 'py' : 'px'];
  SX_KEYS[`margin${side}`] = [`m${short}`, `margin${side}`, side === 'Top' || side === 'Bottom' ? 'my' : 'mx'];
  SX_KEYS[`border${side}`] = [`border${side}`, `border${side}Color`];
}

/** Sets (or, with `null`, clears) one style of a layout or element node. */
export function setStyle(doc: Handover, id: string, key: string, value: StyleValue | null) {
  const at = find(doc, id);
  if (!at || (at.node.kind !== 'layout' && at.node.kind !== 'element')) return;
  const node = at.node;
  node.styles ??= {};
  // One value for all sides replaces the per-side ones, and the other way round.
  const family = /^(padding|margin)/.exec(key)?.[1];
  if (family && key === family) for (const side of ['Top', 'Right', 'Bottom', 'Left']) delete node.styles[`${family}${side}`];
  if (family && key !== family && node.styles[family]) {
    const all = node.styles[family];
    for (const side of ['Top', 'Right', 'Bottom', 'Left']) node.styles[`${family}${side}`] ??= { ...all, css: { [`${family}-${side.toLowerCase()}`]: all.value } };
    delete node.styles[family];
  }
  if (value) node.styles[key] = value;
  else delete node.styles[key];
  if (node.kind === 'layout') {
    dropSx(node, SX_KEYS[key] ?? []);
    if (key === 'gap' || key === 'rowGap' || key === 'columnGap') delete node.props.spacing;
  }
}

function dropSx(node: LayoutNode | ComponentNode, keys: string[]) {
  if (!node.sx || typeof node.sx !== 'object' || Array.isArray(node.sx)) return;
  for (const key of keys) delete (node.sx as Record<string, unknown>)[key];
  if (!Object.keys(node.sx as object).length) delete node.sx;
}

/** Removes one `sx` entry — `bgcolor`, or `&:hover backgroundColor` inside a selector. */
export function removeSx(node: ComponentNode | LayoutNode, property: string) {
  if (!node.sx || typeof node.sx !== 'object') return;
  const parts = property.split(' ');
  const key = parts.pop()!;
  const selector = parts.join(' ');
  const sx = node.sx as Record<string, unknown>;
  if (selector) {
    const nested = (sx[selector] ?? sx[selector.replace(/^&/, '')]) as Record<string, unknown> | undefined;
    if (nested) {
      delete nested[key];
      if (!Object.keys(nested).length) delete sx[selector];
    }
  } else delete sx[key];
  if (!Object.keys(sx).length) delete node.sx;
}

/** The flat `selector key` list of an `sx` object, the way deviations name its entries. */
export function sxEntries(sx: unknown): { property: string; value: unknown }[] {
  if (!sx || typeof sx !== 'object' || Array.isArray(sx)) return [];
  const out: { property: string; value: unknown }[] = [];
  for (const [key, value] of Object.entries(sx as Record<string, unknown>)) {
    const nested = /[&:.@]/.test(key[0]) || key.includes('&');
    if (nested && value && typeof value === 'object' && !Array.isArray(value)) {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) out.push({ property: `${key.startsWith(':') ? `&${key}` : key} ${k}`, value: v });
    } else out.push({ property: key, value });
  }
  return out;
}

// ---------------------------------------------------------------- export

function allNodes(tree: HandoverNode): HandoverNode[] {
  const out: HandoverNode[] = [];
  const visit = (n: HandoverNode) => {
    out.push(n);
    for (const kid of kidsOf(n) ?? []) visit(kid);
  };
  visit(tree);
  return out;
}

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

/** What changed between the captured design and this one, node by node. */
export function diff(original: Handover, doc: Handover): Edit[] {
  const before = index(original.tree);
  const after = index(doc.tree);
  const edits: Edit[] = [];
  for (const [id, now] of after) {
    const was = before.get(id);
    const node = now.node;
    if (!was) {
      edits.push({ node: id, change: 'added', detail: `${labelOf(node)} added${now.parent ? ` to ${labelOf(now.parent)}` : ''}` });
      continue;
    }
    const old = was.node;
    if ((was.parent?.id ?? null) !== (now.parent?.id ?? null) || was.index !== now.index) {
      if (was.parent?.id !== now.parent?.id) edits.push({ node: id, change: 'moved', detail: `${labelOf(node)} moved into ${now.parent ? labelOf(now.parent) : 'the root'}` });
    }
    if ((old.kind === 'component' || old.kind === 'layout') && node.kind === old.kind && old.name !== (node as ComponentNode).name) {
      edits.push({ node: id, change: 'component', detail: `${old.name} swapped for ${(node as ComponentNode).name}` });
    }
    if ('props' in old && 'props' in node && !same(old.props, node.props)) {
      const keys = new Set([...Object.keys(old.props), ...Object.keys(node.props)]);
      for (const key of keys) {
        if (!same(old.props[key], node.props[key])) edits.push({ node: id, change: 'props', detail: `${labelOf(node)} ${key}: ${JSON.stringify(old.props[key]) ?? 'unset'} → ${JSON.stringify(node.props[key]) ?? 'unset'}` });
      }
    }
    if ('text' in old && 'text' in node && old.text !== node.text) edits.push({ node: id, change: 'text', detail: `${labelOf(old)} text → “${node.text ?? ''}”` });
    if ('styles' in old || 'styles' in node) {
      const a = ('styles' in old && old.styles) || {};
      const b = ('styles' in node && node.styles) || {};
      for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
        const x = a[key];
        const y = b[key];
        if ((x?.token ?? x?.value) !== (y?.token ?? y?.value)) edits.push({ node: id, change: 'style', detail: `${labelOf(node)} ${key}: ${x?.token ?? x?.value ?? 'unset'} → ${y?.token ?? y?.value ?? 'unset'}` });
      }
    }
    if ('layout' in old && 'layout' in node && !same(old.layout, node.layout)) edits.push({ node: id, change: 'layout', detail: `${labelOf(node)} layout → ${Object.values(node.layout ?? {}).join(' ')}` });
    if (node.kind === 'component' && !same((old as ComponentNode).overrides, node.overrides)) {
      for (const [key, value] of Object.entries(node.overrides ?? {})) {
        if ((old as ComponentNode).overrides?.[key] !== value) edits.push({ node: id, change: 'override', detail: `${node.name} ${describeOverride(key, value)}` });
      }
      for (const key of Object.keys((old as ComponentNode).overrides ?? {})) {
        if (!node.overrides?.[key]) edits.push({ node: id, change: 'override', detail: `${node.name} ${key} override removed` });
      }
    }
    if (old.kind !== 'text' && old.kind !== 'repeat' && node.kind !== 'text' && node.kind !== 'repeat' && (old.note ?? '') !== (node.note ?? '') && node.note) {
      edits.push({ node: id, change: 'note', detail: `note on ${labelOf(node)}: ${node.note}` });
    }
  }
  for (const [id, was] of before) if (!after.has(id)) edits.push({ node: id, change: 'removed', detail: `${labelOf(was.node)} removed` });
  // Children that stayed in the same parent but in a new order.
  for (const [id, now] of after) {
    const was = before.get(id);
    if (!was) continue;
    const ids = (n: HandoverNode) => (kidsOf(n) ?? []).map((k) => k.id).filter((k): k is string => !!k);
    const stayed = new Set(ids(now.node));
    const a = ids(was.node).filter((k) => stayed.has(k));
    const b = ids(now.node).filter((k) => a.includes(k));
    if (a.join() !== b.join()) edits.push({ node: id, change: 'moved', detail: `children of ${labelOf(now.node)} reordered: ${b.map((k) => labelOf(after.get(k)!.node)).join(', ')}` });
  }
  return edits;
}

/**
 * Deviations as they stand after editing: gone with their nodes, marked
 * fixed when the value was brought onto a token or the `sx` removed, and
 * a new one for each component colour changed outside its props.
 */
export function liveDeviations(doc: Handover): Deviation[] {
  const map = index(doc.tree);
  const out: Deviation[] = [];
  for (const d of doc.deviations) {
    const nodes = d.nodes.filter((id) => map.has(id) || id === 'root');
    if (!nodes.length) continue;
    const next: Deviation = { ...d, nodes };
    if (!d.resolution) {
      const stillThere = nodes.some((id) => {
        const node = map.get(id)?.node;
        if (!node) return true;
        if (d.kind === 'off-token' && (node.kind === 'layout' || node.kind === 'element')) return !!node.styles?.[d.property]?.off;
        if ((d.kind === 'sx' || d.kind === 'style') && (node.kind === 'component' || node.kind === 'layout')) {
          if (d.kind === 'style') return node.kind === 'component' && !!node.style?.[d.property];
          return sxEntries(node.sx).some((e) => e.property === d.property);
        }
        return true;
      });
      if (!stillThere) next.resolution = { status: 'fixed' };
    }
    out.push(next);
  }
  for (const node of map.values()) {
    if (node.node.kind !== 'component') continue;
    for (const [property, value] of Object.entries(node.node.overrides ?? {})) {
      out.push({
        kind: 'override',
        nodes: [node.node.id],
        component: node.node.name,
        property,
        value,
        note: 'changed in Atoms Studio outside the component’s props — find the prop that does this, or raise it as a library gap. A property after a selector applies to that part of the component',
      });
    }
  }
  return out;
}

/** The document as it goes to a developer: counts refreshed, edits listed, deviations brought up to date. */
export function finalize(doc: Handover, original: Handover, name: string): Handover {
  const out = structuredClone(doc);
  const components: Record<string, number> = {};
  const layouts: Record<string, number> = {};
  const icons = new Set<string>();
  const tokens = new Set<string>();
  const countElements = (value: unknown) => {
    if (!value || typeof value !== 'object') return;
    const el = (value as { $element?: unknown }).$element;
    if (typeof el === 'string') {
      if (/Icon$/.test(el)) icons.add(el);
      else if (/^[A-Z]/.test(el)) components[el] = (components[el] ?? 0) + 1;
    }
    for (const v of Object.values(value)) countElements(v);
  };
  for (const node of allNodes(out.tree)) {
    if (node.kind === 'component' && !node.renderedBy) {
      components[node.name] = (components[node.name] ?? 0) + 1;
      countElements(node.props);
      for (const t of [...Object.values(node.tokens ?? {}), ...overrideTokens(node.overrides)]) tokens.add(t.split('|')[0].replace(/@(light|dark)$/, ''));
    }
    if (node.kind === 'layout') layouts[node.name] = (layouts[node.name] ?? 0) + 1;
    if (node.kind === 'icon') icons.add(node.name);
    if ((node.kind === 'layout' || node.kind === 'element') && node.styles) for (const v of Object.values(node.styles)) if (v.token) tokens.add(v.token);
  }
  const sort = (o: Record<string, number>) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
  out.name = name;
  out.formatVersion = HANDOVER_FORMAT_VERSION;
  out.exportedAt = new Date().toISOString();
  out.summary = { components: sort(components), layouts: sort(layouts), icons: [...icons].sort(), tokens: [...tokens].sort() };
  out.deviations = liveDeviations(doc);
  const edits = diff(original, doc);
  if (edits.length) out.edited = { at: new Date().toISOString(), edits };
  else delete out.edited;
  out.atoms = { ...out.atoms, inspectorVersion: ATOMS_VERSION };
  if (!out.readme.includes(BUILD_LINE)) out.readme = [out.readme[0], BUILD_LINE, ...out.readme.slice(1).filter((line) => !line.startsWith('Call build_from_json'))];
  if (!out.readme.some((line) => line.includes('edited'))) {
    out.readme = [
      ...out.readme,
      'edited lists what the designer changed in Atoms Studio after capture; the tree already includes those changes. note fields are the designer’s notes for you. A deviation with a resolution was fixed or accepted as a library gap on purpose.',
    ];
  }
  return out;
}
