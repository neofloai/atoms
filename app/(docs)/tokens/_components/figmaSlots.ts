/**
 * Formats a `text`/`icon` rung as the Figma variable name a designer
 * says out loud, plus the property path a developer types.
 *
 * There is no mapping here any more, and that is the point. Since the
 * 2026-09-09 sync these token keys *are* the Figma variable names, so
 * both strings are the same three parts assembled two ways:
 *
 *   category  group    key      ->  text/default/b2
 *                               ->  text.default.b2
 *
 * The docs page leads with the Figma spelling because that is what
 * arrives in a design review ("make this text/primary/3"), and puts the
 * accessor beneath it because that is what gets pasted into a component.
 *
 * `surface` and `border` still rename Figma's tier numbers on the way in
 * (`border/primary/2` -> `border.primary.defaultHover`, in
 * `scripts/sync-design-tokens.mjs`), so they are deliberately not routed
 * through this — a slash-joined label there would be a lie.
 */

/** Categories whose token keys are Figma variable names verbatim. */
export type SlotCategory = 'text' | 'icon';

const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

/**
 * The Figma variable name for a rung — the exact string in the
 * designer's variable list.
 *
 * @example
 * figmaSlotFor('text', 'default', 'b2')            // 'text/default/b2'
 * figmaSlotFor('text', 'default', 'body on-color') // 'text/default/body on-color'
 * figmaSlotFor('icon', 'primary', '3')             // 'icon/primary/3'
 */
export function figmaSlotFor(
  category: SlotCategory,
  group: string,
  token: string
): string {
  return `${category}/${group}/${token}`;
}

/**
 * The property path for a rung. Bare numbers and names carrying a space
 * need bracket access, which is worth showing literally rather than
 * leaving someone to guess at `text.default.body on-color`.
 *
 * @example
 * accessorFor('text', 'default', 'b2')            // 'text.default.b2'
 * accessorFor('text', 'default', 'body on-color') // "text.default['body on-color']"
 * accessorFor('icon', 'primary', '3')             // 'icon.primary[3]'
 */
export function accessorFor(
  category: SlotCategory,
  group: string,
  token: string
): string {
  if (/^\d+$/.test(token)) return `${category}.${group}[${token}]`;
  if (IDENTIFIER.test(token)) return `${category}.${group}.${token}`;
  return `${category}.${group}['${token}']`;
}
