import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `MenuItem`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 *
 * Its own entry rather than a section of `Menu`'s, because Figma draws
 * it as a separate component set (node 3204:121756) with a variant axis
 * of its own, and because `Menu` and `MenuItem` each have a prop called
 * `variant` that means something different.
 *
 * Both share the docs page at `/components/menu`.
 */
export const data: ComponentExamplesData = {
  name: 'MenuItem',
  category: 'Navigation',
  tagline:
    'One choice inside a Menu, in three label tones — the default, a de-emphasised row, and an accent row for the action that creates something.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3204-121756',
  props: [
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'action'",
      default: "'primary'",
      description:
        'Label tone. `primary` is body strength; `secondary` de-emphasises a row that informs rather than acts; `action` tints the row that creates something. Nothing to do with `Menu`\'s `variant`, which controls focus.',
    },
    {
      name: 'selected',
      type: 'boolean',
      default: 'false',
      description:
        'Marks the current choice with the `surface.primary.subtle` tint. Inside a `Menu` with the default `variant="selectedMenu"`, the selected item also takes initial focus.',
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description:
        'Inert row. Takes the disabled text token rather than MUI\'s 38% fade, and is skipped by arrow-key navigation while staying in the reading order.',
    },
    {
      name: 'dense',
      type: 'boolean',
      default: 'false',
      description:
        'Drops the label to `B2` and the row to 32px; the 8px inset is held at both densities, since the design specifies only one. Inherited from the parent list, so `slotProps={{ list: { dense: true } }}` on the Menu is usually the better place to set it.',
    },
    {
      name: 'divider',
      type: 'boolean',
      default: 'false',
      description:
        'Draws a hairline under this item, in the panel\'s own border token. A standalone `Divider` between items is the more usual way to separate groups, and gets its own margin.',
    },
    {
      name: 'disableGutters',
      type: 'boolean',
      default: 'false',
      description:
        'Removes the 8px horizontal inset, leaving the vertical one. For an item whose child supplies its own edge padding.',
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'false',
      description:
        'Focuses this item on first mount. Rarely needed — `Menu` already focuses the selected item, or the list.',
    },
    {
      name: 'onClick',
      type: '(event) => void',
      default: '—',
      description:
        'Fired on click and on Enter/Space. This is where the menu gets closed: selecting an item does not fire the Menu\'s `onClose`.',
    },
    {
      name: 'component',
      type: 'ElementType',
      default: "'li'",
      description:
        'Element rendered at the root — `component="a"` for a row that navigates. Typed loosely by MUI, so it will not type-check the element\'s own props (an `href` is accepted at runtime but unchecked).',
    },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description:
        'The row\'s content. A plain string, or a 16px glyph followed by a label — the 4px gap between them comes from the item. `ListItemIcon` / `ListItemText` also work.',
    },
    {
      name: 'sx',
      type: 'SxProps<Theme> | ((theme) => SxProps) | Array<…>',
      default: '—',
      description:
        'Styles resolved against the Neoflo theme. Also the way back to MUI\'s single-line behaviour: `sx={{ whiteSpace: "nowrap" }}`, since the design lets a long label wrap.',
    },
    {
      name: 'classes',
      type: 'Partial<MenuItemClasses>',
      default: '—',
      description:
        'Overrides for the generated class names (`root`, `selected`, `dense`, `divider`, `gutters`). `sx` is the shorter route for one-off styling.',
    },
    {
      name: 'ref',
      type: 'Ref<HTMLLIElement>',
      default: '—',
      description: 'Forwarded to the root element.',
    },
  ],
  examples: [
    {
      title: 'Tones',
      description:
        'The three tones from the Figma variant axis. `primary` is the default and carries the body text colour; `secondary` steps the label down to `B2` grey for a row that reports rather than acts; `action` takes the primary accent, for the one row that creates something. One `action` per menu, the way there is one primary button per section.',
      code: [
        '<MenuItem onClick={close}>Rename</MenuItem>',
        '<MenuItem variant="secondary" onClick={close}>',
        '  Move to archive',
        '</MenuItem>',
        '<MenuItem variant="action" onClick={close}>',
        '  New folder',
        '</MenuItem>',
      ].join('\n'),
    },
    {
      title: 'States',
      description:
        'Hover and keyboard focus share one tint, so a row reached by either route looks the same. `selected` marks the current choice with the primary tint and keeps it when hovered. `disabled` uses the disabled text token instead of MUI\'s opacity fade, which keeps the label readable rather than washing the whole row out.',
      code: [
        '<MenuItem selected onClick={close}>Name</MenuItem>',
        '<MenuItem onClick={close}>Date modified</MenuItem>',
        '<MenuItem disabled>Size (unavailable)</MenuItem>',
      ].join('\n'),
    },
    {
      title: 'With a glyph',
      description:
        'Icons are 16px in the design and inherit the row\'s colour, since Phosphor glyphs paint with `currentColor`. No size is forced on children — an icon is consumer content, and forcing a size would stretch anything that is not a glyph — so pass `size={16}`.',
      code: [
        '<MenuItem onClick={close}>',
        '  <PencilSimpleIcon size={16} />',
        '  Rename',
        '</MenuItem>',
        '<MenuItem variant="action" onClick={close}>',
        '  <PlusIcon size={16} />',
        '  New folder',
        '</MenuItem>',
      ].join('\n'),
    },
    {
      title: 'MUI list composition',
      description:
        'MUI\'s own icon-menu composition works unchanged. `ListItemIcon`\'s 36px reserved column is collapsed to the design\'s 4px gap and its colour set to inherit, so both routes look identical — use this one when a row needs a trailing shortcut or a two-line label.',
      code: [
        '<MenuItem onClick={close}>',
        '  <ListItemIcon>',
        '    <CopyIcon size={16} />',
        '  </ListItemIcon>',
        '  <ListItemText>Duplicate</ListItemText>',
        '  <Typography variant="body2" color="text.secondary">',
        '    ⌘D',
        '  </Typography>',
        '</MenuItem>',
      ].join('\n'),
    },
    {
      title: 'A row that navigates',
      description:
        'Set `component="a"` for a choice that is really a link, so it opens in a new tab, shows a URL on hover, and is reachable from the browser\'s own context menu. Accepted at runtime but not type-checked, because MUI types `component` loosely on `MenuItem`.',
      code: [
        '<MenuItem',
        '  component="a"',
        '  href="https://atoms.neoflo.ai/components/menu"',
        '  target="_blank"',
        '  rel="noreferrer"',
        '>',
        '  <ArrowSquareOutIcon size={16} />',
        '  Open documentation',
        '</MenuItem>',
      ].join('\n'),
    },
    {
      title: 'Long labels wrap',
      description:
        'The design gives the label `word-break: break-word` over a zero min-width, so a long label wraps inside the panel rather than widening it. MUI defaults to `nowrap`, which grows the panel instead and cannot be rescued with an ellipsis — a flexbox bug MUI documents as a Menu limitation. Give the panel a width and let the label wrap.',
      code: [
        '<Menu',
        '  anchorEl={anchorEl}',
        '  open={Boolean(anchorEl)}',
        '  onClose={close}',
        "  sx={{ '& .MuiMenu-paper': { maxWidth: 220 } }}",
        '>',
        '  <MenuItem onClick={close}>Share</MenuItem>',
        '  <MenuItem onClick={close}>',
        '    Move to a different workspace folder',
        '  </MenuItem>',
        '</Menu>',
      ].join('\n'),
    },
  ],
  dos: [
    'Close the menu from `onClick` — a selection never reaches the Menu\'s `onClose`',
    'Keep `variant="action"` to one row per menu, and put it last, where a "new…" row is expected',
    'Give every row a glyph or none, so the labels stay aligned with each other',
    'Use `selected` for the current choice instead of a checkmark glyph, so the tint and the initial focus both follow from one prop',
    'Write labels as verbs for rows that act ("Rename", "Duplicate") and leave `variant="secondary"` for the rows that do not',
  ],
  donts: [
    "Don't put an interactive control inside an item — a checkbox or a switch in a menu row leaves two focus targets in a list that only expects one",
    "Don't disable a row without saying why in the label or a nearby row; a dead choice with no explanation reads as a bug",
    "Don't hardcode the glyph size with `sx` on the item — pass `size={16}` on the icon, so the rule applies to the icon and not to every child",
    "Don't set `dense` on each item when the whole list is dense — `slotProps={{ list: { dense: true } }}` on the Menu does it once and is inherited",
    "Don't use `variant=\"secondary\"` as a substitute for `disabled` — one is a quieter label, the other is an inert row",
  ],
  relatedComponents: ['Menu', 'Select', 'Checkbox'],
};
