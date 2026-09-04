import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `Menu`. Read by `scripts/generate.ts` and served
 * through the MCP `get_component` tool and the docs site.
 *
 * `MenuItem` is documented separately (`src/components/MenuItem/
 * MenuItem.examples.tsx`) because Figma draws it as its own component
 * set with its own variant axis, and because a shared props table would
 * have to carry two different props both called `variant`.
 */
export const data: ComponentExamplesData = {
  name: 'Menu',
  category: 'Navigation',
  tagline:
    'Floating panel of choices anchored to a control — the branded surface around MUI Menu, with the full MUI prop surface intact.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3228-62331',
  props: [
    {
      name: 'open',
      type: 'boolean',
      default: '—',
      description:
        'Required. Whether the panel is shown. A menu is always controlled — there is no uncontrolled mode.',
    },
    {
      name: 'anchorEl',
      type: 'HTMLElement | (() => HTMLElement) | null',
      default: '—',
      description:
        'The element the panel positions itself against, normally the trigger. Capture it from the click event with `event.currentTarget`.',
    },
    {
      name: 'onClose',
      type: '(event, reason) => void',
      default: '—',
      description:
        'Fired when the menu asks to close. `reason` is `"escapeKeyDown"`, `"backdropClick"`, or `"tabKeyDown"` — note that selecting an item is *not* one of them, so each item closes the menu itself.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description:
        'The choices, as `MenuItem` elements. MUI\'s menu compositions also work: a `Divider` between groups, a `ListSubheader` above one.',
    },
    {
      name: 'variant',
      type: "'menu' | 'selectedMenu'",
      default: "'selectedMenu'",
      description:
        'MUI\'s focus behaviour, unrelated to `MenuItem`\'s tone `variant`. `selectedMenu` opens with focus on the selected item; `menu` opens with focus on the list, leaving the selection alone.',
    },
    {
      name: 'anchorOrigin',
      type: '{ vertical, horizontal }',
      default: "{ vertical: 'top', horizontal: 'left' }",
      description:
        'Which point of the anchor the panel attaches to. Inherited from `Popover`, along with `transformOrigin`, `anchorPosition`, and `anchorReference`.',
    },
    {
      name: 'transformOrigin',
      type: '{ vertical, horizontal }',
      default: "{ vertical: 'top', horizontal: 'left' }",
      description:
        'Which point of the panel meets `anchorOrigin`. Pair the two to open a menu above, or right-aligned to, its trigger.',
    },
    {
      name: 'autoFocus',
      type: 'boolean',
      default: 'true',
      description:
        'Focuses the list when no focusable child is found. Turning it off moves focus to the modal container instead, which breaks keyboard operation unless you manage focus yourself.',
    },
    {
      name: 'disableAutoFocusItem',
      type: 'boolean',
      default: 'false',
      description:
        'Opens with focus on the list rather than the active item. Departs from the WAI-ARIA menu-button pattern, so prefer `variant="menu"` if the goal is only to leave the selection unfocused.',
    },
    {
      name: 'transitionDuration',
      type: "'auto' | number | { appear, enter, exit }",
      default: "'auto'",
      description:
        'Length of the open/close transition. `auto` scales it to the panel size. Use `slots.transition` to swap `Grow` for another transition entirely.',
    },
    {
      name: 'slots / slotProps',
      type: '{ root, paper, list, transition, backdrop }',
      default: '{}',
      description:
        'Replaces or configures the parts. `slotProps.list` reaches the `MenuList` (for `dense`), `slotProps.paper` the panel (for `sx`, though see the note below on specificity).',
    },
    {
      name: 'sx',
      type: 'SxProps<Theme> | ((theme) => SxProps) | Array<…>',
      default: '—',
      description:
        'Styles resolved against the Neoflo theme. Reach the panel through a descendant selector — `sx={{ "& .MuiMenu-paper": { minWidth: 240 } }}` — since the wrapper\'s panel styles outrank a bare `slotProps.paper.sx`.',
    },
    {
      name: 'classes',
      type: 'Partial<MenuClasses>',
      default: '—',
      description:
        'Overrides for the generated class names (`root`, `paper`, `list`). `sx` is the shorter route for one-off styling.',
    },
    {
      name: 'ref',
      type: 'Ref<HTMLElement>',
      default: '—',
      description: 'Forwarded to the root element.',
    },
  ],
  examples: [
    {
      title: 'Basic menu',
      description:
        'A menu is always controlled: hold the anchor element in state, derive `open` from it, and clear it to close. Selecting an item does not close the menu on its own — `onClose` never fires for a selection — so each item closes it in its own handler. That is deliberate on MUI\'s part, and it is what lets an item do work before the panel goes away.',
      code: [
        'const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);',
        'const close = () => setAnchorEl(null);',
        '',
        '<Button onClick={(event) => setAnchorEl(event.currentTarget)}>',
        '  Actions',
        '</Button>',
        '<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>',
        '  <MenuItem onClick={close}>Rename</MenuItem>',
        '  <MenuItem onClick={close}>Duplicate</MenuItem>',
        '  <MenuItem onClick={close}>Move to folder</MenuItem>',
        '</Menu>',
      ].join('\n'),
    },
    {
      title: 'Icons and tones',
      description:
        'Glyphs are 16px in the design, and they take the item\'s own colour — Phosphor icons paint with `currentColor`, so a `variant="action"` row tints its glyph and its label together. Keep icons on either all rows or none: a menu where only some rows have one reads as a mistake rather than a hierarchy.',
      code: [
        '<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>',
        '  <MenuItem onClick={close}>',
        '    <PencilSimpleIcon size={16} />',
        '    Rename',
        '  </MenuItem>',
        '  <MenuItem onClick={close}>',
        '    <CopyIcon size={16} />',
        '    Duplicate',
        '  </MenuItem>',
        '  <MenuItem variant="action" onClick={close}>',
        '    <PlusIcon size={16} />',
        '    New folder',
        '  </MenuItem>',
        '</Menu>',
      ].join('\n'),
    },
    {
      title: 'Selected item',
      description:
        'When a menu reports a current choice, mark it with `selected` on the item — it takes the `surface.primary.subtle` tint, and `Menu`\'s default `variant="selectedMenu"` opens with focus already on it. Use `variant="menu"` on the Menu to keep the tint without moving initial focus.',
      code: [
        'const [sort, setSort] = React.useState("name");',
        '',
        '<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>',
        '  {["name", "date", "size"].map((option) => (',
        '    <MenuItem',
        '      key={option}',
        '      selected={option === sort}',
        '      onClick={() => {',
        '        setSort(option);',
        '        close();',
        '      }}',
        '    >',
        '      {option}',
        '    </MenuItem>',
        '  ))}',
        '</Menu>',
      ].join('\n'),
    },
    {
      title: 'Sections and secondary rows',
      description:
        'A `Divider` between groups picks up the panel\'s own border token, and `variant="secondary"` de-emphasises a row that informs rather than acts. MUI gives a `MenuItem`-adjacent `Divider` its own vertical margin, so no spacing is needed around it.',
      code: [
        '<Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>',
        '  <MenuItem onClick={close}>Share</MenuItem>',
        '  <MenuItem onClick={close}>Copy link</MenuItem>',
        '  <Divider />',
        '  <MenuItem variant="secondary" disabled>',
        '    Edited 2 days ago',
        '  </MenuItem>',
        '</Menu>',
      ].join('\n'),
    },
    {
      title: 'Positioning',
      description:
        'The panel is a `Popover`, so it takes the same positioning props. Pair `anchorOrigin` and `transformOrigin` to right-align a menu under an icon button — the usual fix for a trigger near the right edge of a toolbar, where the default left alignment would push the panel off-screen.',
      code: [
        '<Menu',
        '  anchorEl={anchorEl}',
        '  open={Boolean(anchorEl)}',
        '  onClose={close}',
        '  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}',
        '  transformOrigin={{ vertical: "top", horizontal: "right" }}',
        '>',
        '  <MenuItem onClick={close}>Profile</MenuItem>',
        '  <MenuItem onClick={close}>Settings</MenuItem>',
        '</Menu>',
      ].join('\n'),
    },
    {
      title: 'Dense list',
      description:
        'The design specifies a single density, so `dense` is MUI\'s knob rather than a Neoflo variant, and it changes the type only: the label drops to `B2` and the row to 32px, while the 8px inset is held at both densities. Worth it for a long list of short strings; unnecessary otherwise. Set it once on the list rather than on every item — MUI 9.2.0 gives an item that *inherits* `dense` the dense styles without the `MuiMenuItem-dense` class, so target the list if you need to hang your own styles off it.',
      code: [
        '<Menu',
        '  anchorEl={anchorEl}',
        '  open={Boolean(anchorEl)}',
        '  onClose={close}',
        '  slotProps={{ list: { dense: true } }}',
        '>',
        '  {lineHeights.map((value) => (',
        '    <MenuItem key={value} onClick={close}>',
        '      {value}',
        '    </MenuItem>',
        '  ))}',
        '</Menu>',
      ].join('\n'),
    },
    {
      title: 'Scrolling and width',
      description:
        'A panel taller than the viewport scrolls internally; MUI caps it at `calc(100% - 96px)` by default. Both the cap and a width belong on the panel, which needs a descendant selector because the wrapper\'s own panel styles outrank a bare `slotProps.paper.sx`.',
      code: [
        '<Menu',
        '  anchorEl={anchorEl}',
        '  open={Boolean(anchorEl)}',
        '  onClose={close}',
        '  sx={{',
        "    '& .MuiMenu-paper': { maxHeight: 240, minWidth: 220 },",
        '  }}',
        '>',
        '  {timezones.map((zone) => (',
        '    <MenuItem key={zone} onClick={close}>',
        '      {zone}',
        '    </MenuItem>',
        '  ))}',
        '</Menu>',
      ].join('\n'),
    },
  ],
  dos: [
    'Close the menu from each item\'s `onClick` — a selection does not fire `onClose`, so nothing else will',
    'Capture the anchor with `event.currentTarget` and derive `open` from it, so one piece of state drives both',
    'Mark the current choice with `selected` rather than a checkmark glyph — the tint and the initial focus both follow from it',
    'Reach the panel through `sx={{ "& .MuiMenu-paper": { … } }}` when it needs a width or a height cap',
  ],
  donts: [
    "Don't use a Menu for form input — a bound list of values with a label and validation is a `Select`, which is a field rather than a floating panel",
    "Don't put a text field, or anything else focusable and non-menu, inside a Menu — the list owns arrow-key focus, and the WAI-ARIA menu pattern has no place for an input",
    "Don't nest a Menu inside a Menu; MUI has no submenu, and a second popover anchored inside the first is a trap on both keyboard and touch",
    "Don't reach for `autoFocus={false}` to stop the panel stealing focus — it leaves the menu unoperable by keyboard; `variant=\"menu\"` is almost always what was meant",
    "Don't paint the panel yourself — the surface, border, corners, and shadow all come from the design, and `sx` on the Menu root styles the modal wrapper, not the panel",
  ],
  relatedComponents: ['MenuItem', 'Select', 'IconButton'],
};
