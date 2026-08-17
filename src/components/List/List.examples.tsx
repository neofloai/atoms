import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the list family. Read by `scripts/generate.ts`
 * and served through the MCP `get_component` tool and the docs site.
 *
 * The props table covers all six parts. Props belonging to a part other
 * than `List` are prefixed with the component that owns them, since the
 * table is one flat list.
 */
export const data: ComponentExamplesData = {
  name: 'List',
  category: 'Layout',
  tagline:
    'A vertical index of rows inside a page — a settings panel, a stack of people, a set of records with a control each. Each row is a band with 16px inside it and a hairline underneath. Not the app navigation rail: that is `ToggleButton` inside a `permanent` Drawer — see the Dashboard pattern.',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=3648-25970&m=dev',
  props: [
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description:
        'The rows. A `ListItem` for a row that displays, a `ListItemButton` for one that responds to the pointer.',
    },
    {
      name: 'dense',
      type: 'boolean',
      default: 'false',
      description:
        'Compacts the type in every row below it, through context. The 16px inset is held at both densities, because the design draws one row.',
    },
    {
      name: 'subheader',
      type: 'ReactNode',
      default: '—',
      description:
        'A heading rendered above the first row. Unstyled — the design draws no subheader, so anything passed here keeps its own type.',
    },
    {
      name: 'component',
      type: 'ElementType',
      default: "'ul'",
      description:
        'The root element. `component="nav"` for a navigation list, `component="div"` when the rows are not list items.',
    },
    {
      name: 'ListItem secondaryAction',
      type: 'ReactNode',
      default: '—',
      description:
        'The trailing control — a `Switch`, a `Radio`, a `Button`, one or two `IconButton`s. Laid out in flow, so the row text shortens to make room for it rather than running underneath.',
    },
    {
      name: 'ListItem disablePadding',
      type: 'boolean',
      default: 'false',
      description:
        'Hands the row inset to a nested `ListItemButton`, so the button fill reaches the row edges on hover. Use it whenever a button is nested inside an item.',
    },
    {
      name: 'ListItem alignItems',
      type: "'center' | 'flex-start'",
      default: "'center'",
      description:
        'Where the leading element sits against a text block taller than it is. Switch to `flex-start` once a row runs to three lines or more.',
    },
    {
      name: 'ListItemButton selected',
      type: 'boolean',
      default: 'false',
      description:
        'Marks the current row. Tints it with the primary subtle rung and keeps it there under the pointer.',
    },
    {
      name: 'ListItemButton disabled',
      type: 'boolean',
      default: 'false',
      description:
        'Greys the whole band — surface, hairline, title, subtitle, and any leading glyph — and stops the pointer.',
    },
    {
      name: 'ListItemButton component',
      type: 'ElementType',
      default: "'div'",
      description:
        'The root element. `component="a"` with an `href` turns the row into a link, and `href` alone is enough.',
    },
    {
      name: 'ListItemText primary',
      type: 'ReactNode',
      default: '—',
      description: 'The row title, in 13/20.',
    },
    {
      name: 'ListItemText secondary',
      type: 'ReactNode',
      default: '—',
      description:
        'The subtitle, in 12/16 directly under the title. Passing it is what makes a row two lines.',
    },
    {
      name: 'ListItemText inset',
      type: 'boolean',
      default: 'false',
      description:
        'Indents a row that has no leading element so it lines up with rows that do.',
    },
  ],
  examples: [
    {
      title: 'A settings list',
      description: 'Rows that display, each with its own trailing control.',
      code: [
        '<List>',
        '  <ListItem secondaryAction={<Switch defaultChecked />}>',
        '    <ListItemText primary="Email digest" secondary="Every Monday at 9am" />',
        '  </ListItem>',
        '  <ListItem secondaryAction={<Switch />}>',
        '    <ListItemText primary="Desktop alerts" secondary="Off while presenting" />',
        '  </ListItem>',
        '</List>',
      ].join('\n'),
    },
    {
      title: 'Navigation inside a page',
      description:
        'Rows that respond. `selected` marks the current one; a row with an `href` is a link. This is in-page navigation — a settings sub-nav, a table of contents, a folder tree. The app-level rail down the side of the screen is a different construct: `ToggleButton` rows inside a `permanent` Drawer, which is what the Dashboard pattern uses.',
      code: [
        '<List component="nav">',
        '  <ListItemButton selected>',
        '    <ListItemIcon>',
        '      <FolderIcon size={16} />',
        '    </ListItemIcon>',
        '    <ListItemText primary="Invoices" />',
        '  </ListItemButton>',
        '  <ListItemButton component="a" href="/reports">',
        '    <ListItemIcon>',
        '      <ChartBarIcon size={16} />',
        '    </ListItemIcon>',
        '    <ListItemText primary="Reports" />',
        '  </ListItemButton>',
        '</List>',
      ].join('\n'),
    },
    {
      title: 'People, with avatars and two trailing actions',
      description:
        'The leading avatar sizes itself: `md` beside two lines, `sm` beside one.',
      code: [
        '<List>',
        '  <ListItem',
        '    secondaryAction={',
        '      <>',
        '        <IconButton size="sm" variant="secondary" aria-label="Edit member">',
        '          <PencilSimpleIcon size={16} />',
        '        </IconButton>',
        '        <IconButton size="sm" variant="secondary" aria-label="Open profile">',
        '          <CaretRightIcon size={16} />',
        '        </IconButton>',
        '      </>',
        '    }',
        '  >',
        '    <ListItemAvatar>',
        '      <Avatar size="md">OP</Avatar>',
        '    </ListItemAvatar>',
        '    <ListItemText primary="Olivia Park" secondary="olivia@neoflo.ai" />',
        '  </ListItem>',
        '</List>',
      ].join('\n'),
    },
    {
      title: 'A clickable row with a separate trailing target',
      description:
        'Nest the button inside the item and pass `disablePadding`, so the row fill reaches both edges while the switch stays its own target.',
      code: [
        '<ListItem disablePadding secondaryAction={<Switch defaultChecked />}>',
        '  <ListItemButton>',
        '    <ListItemText primary="Two-factor auth" secondary="Required for admins" />',
        '  </ListItemButton>',
        '</ListItem>',
      ].join('\n'),
    },
    {
      title: 'A disabled row',
      code: [
        '<ListItemButton disabled>',
        '  <ListItemText primary="Export to CSV" secondary="Available on Team plans" />',
        '</ListItemButton>',
      ].join('\n'),
    },
  ],
  dos: [
    'Use `ListItemButton` for a row that navigates or selects, and `ListItem` for one that only displays — the hover, focus, and disabled states live on the button',
    'Pass `disablePadding` on a `ListItem` whenever you nest a `ListItemButton` inside it, so the row fill reaches both edges',
    'Reach for `secondaryAction` for the trailing control rather than adding it as the last child, so the title shortens instead of colliding with it',
    'Size the leading element yourself — `Avatar size="sm"` beside a one-line row, `size="md"` beside two',
    'Switch `alignItems="flex-start"` once a row runs to three lines or more, so the avatar stays with the title',
  ],
  donts: [
    "Don't nest an `IconButton` or a `Switch` inside a `ListItemButton` — put it in the item's `secondaryAction`, where it is a separate target",
    "Don't add a bottom border to a row; every row already ends on one, and it turns primary on focus and grey when disabled",
    "Don't wrap a row in a `Card` for a surface — the row paints `card 1` itself",
    "Don't use a list for tabular data with more than one column of values; that is `Table`, or `DataGrid` when the table is the screen's work",
    "Don't build the app's primary navigation rail out of `List`/`ListItemButton` — the rail is `ToggleButton` rows inside a `permanent` Drawer, which is what carries the selected tint, the icon-only collapsed width, and the tooltips that appear when the labels drop out. Start from the Dashboard pattern rather than writing a shell from scratch",
  ],
  relatedComponents: [
    'Menu',
    'MenuItem',
    'Table',
    'Accordion',
    // The two a reader lands here looking for by mistake. `List` and an
    // app rail look alike in a screenshot and are different constructs,
    // so the comparison is one call away rather than a rediscovery.
    'ToggleButton',
    'Drawer',
  ],
};
