/**
 * Figma slot name -> Atoms token name, for the `text` and `icon`
 * colour categories.
 *
 * Designers read these tokens in Figma, where the variables are named
 * after the type-scale rung they pair with (`text/default/b2`) or by a
 * bare tier number (`text/primary/3`). This package renames them to
 * descriptive slots on the way in, so the two vocabularies genuinely
 * differ and a designer cannot map one to the other by eye. Every rung
 * below therefore carries both names on the tokens page.
 *
 * The mapping is the inverse of `DEFAULT_SLOTS` / `ACCENT_TIERS` in
 * `scripts/sync-design-tokens.mjs`, which is where the rename happens.
 * If a future Figma export renumbers a ladder, that script is what
 * changes and this file has to change with it.
 *
 * Checked against the `component` collection export (light + dark,
 * 2026-09-04): all 78 text/icon rungs map, every value matches in both
 * modes, and neither side carries a rung the other does not.
 *
 * Only the rungs Figma spells *differently* are listed. `heading`,
 * `subtle` and `disabled/default` are identical in both vocabularies,
 * so a second label would just repeat the first; `figmaSlotFor`
 * returns null for those.
 */

/** Category of colour token that carries a Figma slot translation. */
export type SlotCategory = 'text' | 'icon';

/**
 * The neutral `default` group. Figma names these after the type-scale
 * rung each one pairs with -- `b1` is body copy, `b2` the caption
 * beneath it, `b3` the placeholder -- rather than after the role.
 * `heading` and `subtle` are spelled the same in both.
 *
 * The four `OnColor` cuts differ only in case and spacing, which is
 * exactly the kind of difference that is invisible until someone
 * searches the Figma variable list for `bodyOnColor` and finds nothing.
 */
const DEFAULT_SLOTS: Readonly<Record<string, string>> = {
  body: 'b1',
  caption: 'b2',
  placeholder: 'b3',
  headingOnColor: 'heading on-color',
  bodyOnColor: 'body on-color',
  captionOnColor: 'caption on-color',
  placeholderOnColor: 'placeholder on-color',
};

/**
 * `disabled` carries two rungs and Figma hyphenates the second.
 * `default` matches, so only `onColor` needs saying.
 */
const DISABLED_SLOTS: Readonly<Record<string, string>> = {
  onColor: 'on-color',
};

/**
 * The accent roles, which Figma numbers instead of naming. The ladder
 * runs darkest first, so tier 1 is the deepest ink and tier 4 the
 * lightest.
 */
const ACCENT_SLOTS: Readonly<Record<string, string>> = {
  body: '1',
  caption: '2',
  accent: '3',
  onColorHover: '4',
};

const ACCENT_ROLES: ReadonlySet<string> = new Set([
  'primary',
  'information',
  'success',
  'error',
  'warning',
  'orange',
  'purple',
]);

/**
 * Groups where Figma starts the ladder at `0` rather than `1`.
 *
 * It is the same rung either way -- both resolve to `body` -- so this
 * exists only so the label matches what the designer actually sees in
 * the variable list. These ladders run `0, 2, 3, 4`: there is no tier
 * `1` on them at all, which is why the numbering cannot simply be
 * shifted by one.
 *
 * `text/warning` and `text/orange` are zero-based but `icon/warning` is
 * not, so the two categories genuinely differ here -- confirmed against
 * the export rather than assumed symmetric.
 */
const ZERO_BASED: Readonly<Record<SlotCategory, ReadonlySet<string>>> = {
  text: new Set(['warning', 'orange']),
  icon: new Set(['orange']),
};

/**
 * The Figma variable name for a token rung, or null when Figma spells
 * it exactly as this package does.
 *
 * @example
 * figmaSlotFor('text', 'default', 'caption')     // 'text/default/b2'
 * figmaSlotFor('icon', 'primary', 'accent')      // 'icon/primary/3'
 * figmaSlotFor('text', 'default', 'bodyOnColor') // 'text/default/body on-color'
 * figmaSlotFor('text', 'default', 'subtle')      // null -- same name in both
 */
export function figmaSlotFor(
  category: SlotCategory,
  group: string,
  token: string
): string | null {
  if (group === 'default') {
    const slot = DEFAULT_SLOTS[token];
    return slot ? `${category}/${group}/${slot}` : null;
  }

  if (group === 'disabled') {
    const slot = DISABLED_SLOTS[token];
    return slot ? `${category}/${group}/${slot}` : null;
  }

  if (ACCENT_ROLES.has(group)) {
    const slot = ACCENT_SLOTS[token];
    if (!slot) return null;
    const numbered =
      token === 'body' && ZERO_BASED[category].has(group) ? '0' : slot;
    return `${category}/${group}/${numbered}`;
  }

  return null;
}
