import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the list family. Read by `scripts/generate.ts`
 * and served through the MCP `get_component` tool and the docs site.
 *
 * The props table covers all seven parts. Props belonging to a part other
 * than `List` are prefixed with the component that owns them, since the
 * table is one flat list.
 */
export const data: ComponentExamplesData = {
  name: 'List',
  category: 'Layout',
  tagline:
    'A vertical index of rows — a settings panel, a stack of people, a set of records with a control each, where each row is a band with 16px inside it and a hairline underneath. With `variant="nav"` it is also the app sidebar: 28px rows inside a `Drawer`, the way MUI builds a navigation drawer.',
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
      name: 'variant',
      type: "'default' | 'nav'",
      default: "'default'",
      description:
        "The treatment. `default` is the list frame's 16px bands under a hairline. `nav` is the app sidebar: 28px rows on 4px corners, 4px apart, the label in `text/default/b2` and the glyph in `icon/default/b2`, the current page on a grey fill in `b1`. A nested `List` inherits it and draws the second level behind a branch rule at a 40px indent.",
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
        'A heading rendered above the first row. Pass a `ListSubheader` with `component="div"`, which sets the label in the mono section type and lines it up with the rows\' 16px inset.',
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
        'Marks the current row. Tints it with the primary subtle rung and keeps it there under the pointer. In a `nav` list it is the current page: a grey fill behind `b1` ink at Medium.',
    },
    {
      name: 'ListItemButton aria-current',
      type: "'page' | 'true'",
      default: '—',
      description:
        'In a `nav` list, `\'true\'` on a parent row whose current page is out of sight — a shut group or a folded rail — gives it the current page\'s ink and weight without the fill.',
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
    {
      name: 'ListSubheader children',
      type: 'ReactNode',
      default: '—',
      description:
        'The label over a group of rows — DM Mono Medium at 12/16 in caption ink. Also the group label inside a `Menu`, where it lines up with the item labels instead.',
    },
    {
      name: 'ListSubheader disableSticky',
      type: 'boolean',
      default: 'false',
      description:
        'Stops the label sticking to the top while the rows scroll. Sticky labels take their container\'s fill to cover the rows under them, so turn it off where the container has no fill of its own.',
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
        'Rows that respond. `selected` marks the current one; a row with an `href` is a link. This is in-page navigation — a settings sub-nav, a table of contents, a folder tree. The app sidebar is the same parts with `variant="nav"`, below.',
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
      title: 'The app sidebar',
      description:
        'MUI\'s navigation drawer, drawn as the sidebar: a `nav` list of `ListItemButton`s in a `permanent` Drawer. Rows are 28px and 4px apart; the glyph sits 12px from the label at both levels. A section label is a `ListSubheader` — as a button it folds its rows away in a `Collapse`. A level is a `Collapse` holding a nested `List`, which takes the 40px indent and the branch rule on its own. The parent of a current page that is out of sight takes `aria-current="true"`.',
      code: [
        '<Drawer variant="permanent" size="sm">',
        '  <List variant="nav" component="nav" sx={{ p: 1.5 }}>',
        '    <ListItemButton selected>',
        '      <ListItemIcon>',
        '        <HouseIcon size={16} />',
        '      </ListItemIcon>',
        '      <ListItemText primary="Home" />',
        '    </ListItemButton>',
        '    <ListSubheader component="button" onClick={toggleSection} aria-expanded={sectionOpen}>',
        '      Workflows',
        '      <CaretDownIcon size={14} />',
        '    </ListSubheader>',
        '    <Collapse in={sectionOpen}>',
        '      <ListItemButton onClick={toggleGroup} aria-expanded={groupOpen}>',
        '        <ListItemIcon>',
        '          <FileTextIcon size={16} />',
        '        </ListItemIcon>',
        '        <ListItemText primary="Invoice Processing" />',
        '        <CaretDownIcon size={14} />',
        '      </ListItemButton>',
        '      <Collapse in={groupOpen}>',
        '        <List component="div">',
        '          <ListItemButton>',
        '            <ListItemIcon>',
        '              <BriefcaseIcon size={16} />',
        '            </ListItemIcon>',
        '            <ListItemText primary="Work area" />',
        '          </ListItemButton>',
        '        </List>',
        '      </Collapse>',
        '    </Collapse>',
        '  </List>',
        '</Drawer>',
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
      title: 'A labelled group',
      description:
        'A `ListSubheader` names the rows under it in the mono section label — the same label the workspace switcher and the sidebar use. It takes the rows\' 16px inset, so the label and the row text start on one line.',
      code: [
        '<List subheader={<ListSubheader component="div">Recent</ListSubheader>}>',
        '  <ListItemButton>',
        '    <ListItemText primary="Q3 vendor audit" />',
        '  </ListItemButton>',
        '  <ListItemButton>',
        '    <ListItemText primary="Duplicate invoices" />',
        '  </ListItemButton>',
        '</List>',
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
    'Build the app sidebar as `List variant="nav"` inside a `permanent` Drawer, and nest a level as a `Collapse` holding a `List` — the indent and branch rule come with it',
    'Fold a sidebar to an icon strip by leaving out `ListItemText` and centring the 28px row, with a `Tooltip` naming each glyph',
  ],
  donts: [
    "Don't nest an `IconButton` or a `Switch` inside a `ListItemButton` — put it in the item's `secondaryAction`, where it is a separate target",
    "Don't add a bottom border to a row; every row already ends on one, and it turns primary on focus and grey when disabled",
    "Don't wrap a row in a `Card` for a surface — the row paints `card 1` itself",
    "Don't use a list for tabular data with more than one column of values; that is `Table`, or `DataGrid` when the table is the screen's work",
    "Don't build the app sidebar from the default list — its 16px bands and hairlines are an index of rows. Pass `variant=\"nav\"`, and start from the Dashboard pattern for the whole shell",
    "Don't give a parent row in a `nav` list `selected` — it opens a level rather than being a page; mark it `aria-current=\"true\"` only while its current page is out of sight",
  ],
  relatedComponents: [
    'Menu',
    'MenuItem',
    'Table',
    'Accordion',
    // The panel a `nav` list goes in, and the collapse a level opens
    // behind.
    'Drawer',
    'Collapse',
  ],
};
