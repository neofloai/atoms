/**
 * The selection rules of a picker tree (folders and files, or any nesting), kept apart from the
 * rows so they can be read and tested on their own.
 *
 * The value is a list of ids. A ticked folder stands for everything in it, so its own id is in the
 * value and its descendants' are not: a folder that gains files later still covers them, and the
 * value stays as short as what the person actually chose. Ticking every child of a folder one by
 * one rolls them up into the folder; unticking one child of a ticked folder breaks the folder back
 * into its other children.
 */

export interface TreeNode {
  id: string;
  disabled?: boolean;
}

/** A node's children, if they are known (given, or loaded): `undefined` for a leaf or a folder not yet loaded. */
export type ChildrenOf<T extends TreeNode> = (node: T) => readonly T[] | undefined;

export type CheckState = 'on' | 'off' | 'mixed';

/** On when the node or a folder above it is chosen; mixed when only part of what is inside is. */
export function checkState<T extends TreeNode>(
  node: T,
  selected: ReadonlySet<string>,
  inherited: boolean,
  childrenOf: ChildrenOf<T>,
): CheckState {
  if (inherited || selected.has(node.id)) return 'on';
  const children = childrenOf(node);
  if (!children?.length) return 'off';
  const states = children.map((child) => checkState(child, selected, false, childrenOf));
  if (states.every((s) => s === 'on')) return 'on';
  return states.some((s) => s !== 'off') ? 'mixed' : 'off';
}

function removeDescendants<T extends TreeNode>(node: T, set: Set<string>, childrenOf: ChildrenOf<T>) {
  for (const child of childrenOf(node) ?? []) {
    set.delete(child.id);
    removeDescendants(child, set, childrenOf);
  }
}

/**
 * The value after ticking or unticking the last node of `path` (the root of the tree first).
 * Keeps the order of what stays, with anything new at the end.
 */
export function toggleInTree<T extends TreeNode>(path: readonly T[], value: readonly string[], childrenOf: ChildrenOf<T>): string[] {
  const node = path[path.length - 1];
  if (!node) return [...value];
  const set = new Set(value);
  const chosenAt = path.findIndex((p) => set.has(p.id));

  if (chosenAt === path.length - 1) {
    set.delete(node.id);
  } else if (chosenAt !== -1) {
    // A folder above it is chosen: break that folder into everything but this branch.
    set.delete(path[chosenAt]!.id);
    for (let i = chosenAt; i < path.length - 1; i++) {
      for (const sibling of childrenOf(path[i]!) ?? []) {
        if (sibling.id !== path[i + 1]!.id && !sibling.disabled) set.add(sibling.id);
      }
    }
  } else if (checkState(node, set, false, childrenOf) === 'on') {
    // Everything inside was chosen one by one: clear it.
    removeDescendants(node, set, childrenOf);
  } else {
    removeDescendants(node, set, childrenOf);
    set.add(node.id);
    // Roll a folder up once every child of it is chosen.
    for (let i = path.length - 2; i >= 0; i--) {
      const siblings = childrenOf(path[i]!);
      if (!siblings?.length || !siblings.every((s) => set.has(s.id))) break;
      for (const s of siblings) set.delete(s.id);
      set.add(path[i]!.id);
    }
  }
  return [...value.filter((v) => set.has(v)), ...[...set].filter((v) => !value.includes(v))];
}

/**
 * The nodes a search keeps: those that match, and the folders on the way to them, which open so
 * the matches show. Only what is known is searched; a folder not yet loaded matches by its own name.
 */
export function filterTree<T extends TreeNode>(
  nodes: readonly T[],
  matches: (node: T) => boolean,
  childrenOf: ChildrenOf<T>,
  open: Set<string> = new Set(),
): { nodes: T[]; open: Set<string> } {
  const kept: T[] = [];
  for (const node of nodes) {
    const children = childrenOf(node);
    const inner = children ? filterTree(children, matches, childrenOf, open).nodes : [];
    if (inner.length) open.add(node.id);
    if (inner.length || matches(node)) kept.push(node);
  }
  return { nodes: kept, open };
}
