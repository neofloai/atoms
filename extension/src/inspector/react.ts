/**
 * Reads Atoms components off React's fiber tree. React stores each DOM
 * node's fiber on an expando key (`__reactFiber$<random>`), visible only
 * from the page's own JavaScript world — which is why the background
 * worker injects this script with `world: 'MAIN'`.
 *
 * A fiber is an Atoms component when its type carries an explicit
 * `displayName` that `src/index.ts` exports. MUI sets no `displayName`,
 * so the Atoms `Button` is found and the MUI `Button` inside it is not.
 */
declare const __ATOMS_COMPONENTS__: string[];

const PUBLIC = new Set(__ATOMS_COMPONENTS__);

export interface Fiber {
  /** React's work tag: 5 is a DOM element, 6 a text node. */
  tag?: number;
  type: unknown;
  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  stateNode: unknown;
  memoizedProps: Record<string, unknown> | null;
  /** Development builds only: the component whose render created this element. */
  _debugOwner?: Fiber | { name?: string } | null;
}

export interface AtomsComponent {
  name: string;
  fiber: Fiber;
  /** A MUI layout primitive Atoms re-exports as-is (`Box`, `Stack`, `Grid`, `Container`). */
  primitive?: boolean;
}

/**
 * The layout primitives carry no `displayName` — Atoms re-exports MUI's
 * own — so they are recognised by the root class MUI gives them.
 */
const PRIMITIVE_CLASSES: [string, string][] = [
  ['MuiStack-root', 'Stack'],
  ['MuiGrid-root', 'Grid'],
  ['MuiContainer-root', 'Container'],
  ['MuiBox-root', 'Box'],
];

export function fiberOf(node: Element): Fiber | null {
  for (const key of Object.keys(node)) {
    if (key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$')) {
      return (node as unknown as Record<string, Fiber>)[key];
    }
  }
  return null;
}

export function displayNameOf(type: unknown): string | undefined {
  if (!type || typeof type === 'string') return undefined;
  const t = type as { displayName?: string; render?: { displayName?: string }; type?: { displayName?: string } };
  return t.displayName ?? t.render?.displayName ?? t.type?.displayName;
}

/** Whether a name is an Atoms component's. */
export function isAtomsName(name: string | null | undefined): boolean {
  return !!name && PUBLIC.has(name);
}

/** The Atoms component a fiber is, or null. */
export function atomsNameOf(fiber: Fiber): string | null {
  const name = displayNameOf(fiber.type);
  return name && PUBLIC.has(name) ? name : null;
}

/**
 * The icon a fiber is: a Phosphor icon (`CaretDownIcon`), which Atoms
 * re-exports from `@neofloai/atoms/icons`, renders straight into
 * `IconBase`.
 */
export function iconNameOf(fiber: Fiber): string | null {
  const name = displayNameOf(fiber.type);
  if (!name || !fiber.child) return null;
  if (displayNameOf(fiber.child.type) !== 'IconBase') return null;
  return name.endsWith('Icon') ? name : `${name}Icon`;
}

/** Whether any of the first few hundred elements carries a React fiber. */
export function hasReact(): boolean {
  const all = document.body?.getElementsByTagName('*') ?? [];
  for (let i = 0; i < Math.min(all.length, 300); i += 1) if (fiberOf(all[i])) return true;
  return false;
}

/**
 * Atoms components enclosing `node`, innermost first. A `memo(forwardRef())`
 * shows up as two fibers of the same name; the outer one is kept because
 * it holds the props the caller wrote.
 */
export function atomsAncestors(node: Element): AtomsComponent[] {
  const found: AtomsComponent[] = [];
  for (let fiber = fiberOf(node); fiber; fiber = fiber.return) {
    if (fiber.stateNode instanceof Element) {
      const primitive = primitiveAt(fiber);
      if (primitive) found.push(primitive);
      continue;
    }
    const name = displayNameOf(fiber.type);
    if (!name || !PUBLIC.has(name)) continue;
    const last = found[found.length - 1];
    if (last && last.name === name && last.fiber.return === fiber) last.fiber = fiber;
    else found.push({ name, fiber });
  }
  return found;
}

/**
 * A host fiber whose element carries a primitive's root class resolves to
 * the outermost component fiber that renders it first — `Stack`, not the
 * `StackRoot` styled element inside it — because that fiber holds the
 * props the caller wrote (`spacing`, `direction`).
 */
export function primitiveAt(host: Fiber): AtomsComponent | null {
  const el = host.stateNode as Element;
  const hit = PRIMITIVE_CLASSES.find(([cls]) => el.classList?.contains(cls));
  if (!hit) return null;
  // Up from the element: MUI's Emotion-styled root (`StackRoot`), then the
  // primitive itself. Stop there — above it sit the app's own components
  // (or a framework's) that happen to render the same element first.
  let styled = false;
  for (let f = host.return; f && typeof f.type !== 'string'; f = f.return) {
    if (firstHost(f) !== el) break;
    const type = f.type as { __emotion_real?: unknown } | null;
    if (type && typeof type === 'object' && '__emotion_real' in type) styled = true;
    else if (type && typeof type === 'function' && '__emotion_real' in type) styled = true;
    else if (styled) return { name: hit[1], fiber: f, primitive: true };
  }
  return null;
}

/** The first DOM element a fiber renders. */
export function firstHost(fiber: Fiber): Element | null {
  if (fiber.stateNode instanceof Element) return fiber.stateNode;
  const stack: Fiber[] = fiber.child ? [fiber.child] : [];
  while (stack.length) {
    const next = stack.shift()!;
    if (next.stateNode instanceof Element) return next.stateNode;
    if (next.sibling) stack.unshift(next.sibling);
    if (next.child) stack.unshift(next.child);
  }
  return null;
}

/** The first DOM element a component renders. */
export function hostRoot(component: AtomsComponent): Element | null {
  return firstHost(component.fiber);
}

// ---------------------------------------------------------------- props

export type PropValue =
  | { kind: 'literal'; text: string }
  | { kind: 'string'; text: string }
  | { kind: 'element'; text: string }
  | { kind: 'other'; text: string };

const SKIPPED = new Set(['children', 'key', 'ref', 'className', 'ownerState']);

export function elementName(value: unknown): string | null {
  if (!value || typeof value !== 'object' || !('$$typeof' in value)) return null;
  const type = (value as unknown as { type: unknown }).type;
  if (typeof type === 'string') return type;
  const t = type as { displayName?: string; name?: string; render?: { name?: string } } | null;
  return t?.displayName ?? t?.name ?? t?.render?.name ?? 'Element';
}

export function readProps(component: AtomsComponent): [string, PropValue][] {
  const props = component.fiber.memoizedProps ?? {};
  const out: [string, PropValue][] = [];
  for (const [key, value] of Object.entries(props)) {
    if (SKIPPED.has(key) || value === undefined) continue;
    if (typeof value === 'string') out.push([key, { kind: 'string', text: value }]);
    else if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
      out.push([key, { kind: 'literal', text: String(value) }]);
    } else if (typeof value === 'function') out.push([key, { kind: 'other', text: 'ƒ' }]);
    else if (elementName(value)) out.push([key, { kind: 'element', text: `<${elementName(value)} />` }]);
    else if (Array.isArray(value)) out.push([key, { kind: 'other', text: `[${value.length}]` }]);
    else out.push([key, { kind: 'other', text: '{…}' }]);
  }
  return out;
}

/** A `<Name …>` snippet built from the props the caller wrote. */
export function toJsx(component: AtomsComponent): string {
  const attrs: string[] = [];
  for (const [key, value] of readProps(component)) {
    if (value.kind === 'string') attrs.push(`${key}="${value.text}"`);
    else if (value.kind === 'literal') attrs.push(value.text === 'true' ? key : `${key}={${value.text}}`);
    else if (value.kind === 'element') attrs.push(`${key}={${value.text}}`);
    else if (value.text === 'ƒ') attrs.push(`${key}={() => {}}`);
    else attrs.push(`${key}={${value.text === '{…}' ? '{ … }' : '[ … ]'}}`);
  }
  const children = component.fiber.memoizedProps?.children;
  const inner =
    typeof children === 'string' || typeof children === 'number'
      ? String(children)
      : children
        ? '…'
        : '';
  const open = attrs.length > 2 ? `<${component.name}\n  ${attrs.join('\n  ')}\n` : `<${component.name}${attrs.length ? ` ${attrs.join(' ')}` : ''}`;
  return inner ? `${open}>${inner}</${component.name}>` : `${open}${attrs.length > 2 ? '' : ' '}/>`;
}
