import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `WorkspaceSwitcher`. Read by `scripts/generate.ts`
 * and served through the MCP `get_component` tool and the docs site.
 *
 * `figmaUrl` is the side nav with the workspace menu open (4564:6288).
 * Until 4.2.0 this was a copy-paste example on `Menu` and written out by
 * hand in the dashboard pattern's rail.
 */
export const data: ComponentExamplesData = {
  name: 'WorkspaceSwitcher',
  category: 'Navigation',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=4564-6288',
  tagline:
    'The workspace switcher at the foot of the sidebar — the current workspace\'s square avatar and name, and the list it opens upwards to switch workspace or create one. Goes last in a `Drawer`, under a nav that takes the slack; it draws the rule above itself.',
  keywords: [
    'workspace',
    'workspace switcher',
    'workspace menu',
    'workspace picker',
    'workspace selector',
    'workspace dropdown',
    'switch workspace',
    'create workspace',
    'organization switcher',
    'org switcher',
    'tenant switcher',
    'team switcher',
    'account switcher',
    'sidebar footer',
    'sidebar menu',
    'sidebar dropdown',
    'rail footer',
    'nav footer',
  ],
  props: [
    {
      name: 'workspaces',
      type: '{ id: string; name: string; initials?: string; color?: AvatarColor }[]',
      default: '—',
      description:
        'Required. Every workspace the user can switch to, in list order. `initials` defaults to the first letters of the first two words, or a one-word name\'s first two letters; `color` is the square avatar\'s role and defaults to `primary` — give each workspace its own.',
    },
    {
      name: 'value',
      type: 'string',
      default: '—',
      description:
        'The current workspace\'s `id`, when you hold the state. Pair it with `onChange`.',
    },
    {
      name: 'defaultValue',
      type: 'string',
      default: 'the first workspace',
      description:
        'The workspace it starts on when the switcher holds its own state.',
    },
    {
      name: 'onChange',
      type: '(id: string) => void',
      default: '—',
      description:
        'Fired with the chosen workspace\'s `id`. Not fired when the current one is chosen again.',
    },
    {
      name: 'onCreate',
      type: '() => void',
      default: '—',
      description:
        'Fired by the Create workspace row, which closes the list behind a rule. Omit it to leave the row out.',
    },
    {
      name: 'collapsed',
      type: 'boolean',
      default: 'false',
      description:
        'The folded rail: the trigger is the square avatar alone on the rail\'s axis, with the name in a tooltip. Pass the rail\'s own collapsed state.',
    },
    {
      name: 'labels',
      type: 'Partial<{ heading, create }>',
      default: '—',
      description:
        'Replaces the list\'s `Workspaces` heading and the Create workspace row. Any subset; the rest stay English.',
    },
    {
      name: 'ref',
      type: 'Ref<HTMLDivElement>',
      default: '—',
      description: 'Forwarded to the footer block.',
    },
  ],
  examples: [
    {
      title: 'At the foot of the rail',
      description:
        'The last thing in the `Drawer`. The nav above it takes the slack with `flex: 1`, which pins the switcher to the bottom edge; the switcher draws its own rule and inset. It opens upwards, 8px clear of the trigger, with the current workspace filled and checked.',
      code: [
        'import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, WorkspaceSwitcher } from "@neofloai/atoms";',
        '',
        'const WORKSPACES = [',
        '  { id: "finance", name: "Finance", color: "primary" },',
        '  { id: "procurement", name: "Procurement", color: "success" },',
        '] as const;',
        '',
        'const [workspaceId, setWorkspaceId] = React.useState("finance");',
        '',
        '<Drawer variant="permanent" size="sm">',
        '  <List variant="nav" component="nav" sx={{ flex: 1, p: 1.5 }}>',
        '    {NAV.map(({ key, label, Icon }) => (',
        '      <ListItemButton key={key} selected={active === key} onClick={() => setActive(key)}>',
        '        <ListItemIcon>',
        '          <Icon size={16} />',
        '        </ListItemIcon>',
        '        <ListItemText primary={label} />',
        '      </ListItemButton>',
        '    ))}',
        '  </List>',
        '',
        '  <WorkspaceSwitcher',
        '    workspaces={WORKSPACES}',
        '    value={workspaceId}',
        '    onChange={setWorkspaceId}',
        '    onCreate={openCreateWorkspace}',
        '  />',
        '</Drawer>',
      ].join('\n'),
    },
    {
      title: 'Holding its own state',
      description:
        'For a prototype, leave out `value` and the switcher keeps the current workspace itself, starting on the first one or on `defaultValue`. `onChange` still reports each switch.',
      code: [
        '<WorkspaceSwitcher',
        '  workspaces={WORKSPACES}',
        '  defaultValue="procurement"',
        '/>',
      ].join('\n'),
    },
    {
      title: 'In a folded rail',
      description:
        'Pass the rail\'s collapsed state through. Folded, the trigger is the square avatar alone, centred on the rail\'s axis with the nav glyphs above it, and the name moves into a tooltip.',
      code: [
        '<Drawer variant="permanent" size={collapsed ? 64 : "sm"}>',
        '  <List variant="nav" component="nav" sx={{ flex: 1 }}>…</List>',
        '  <WorkspaceSwitcher',
        '    workspaces={WORKSPACES}',
        '    value={workspaceId}',
        '    onChange={setWorkspaceId}',
        '    collapsed={collapsed}',
        '  />',
        '</Drawer>',
      ].join('\n'),
    },
  ],
  dos: [
    'Put it last in the `Drawer`, after a nav with `flex: 1`, so it sits on the bottom edge',
    'Give each workspace its own avatar colour, so the trigger says where you are before you read it',
    'Pass `onCreate` when the user can make a workspace; the row and its rule come with it',
    'Pass `collapsed` from the rail itself, so the folded trigger lines up with the nav glyphs',
  ],
  donts: [
    "Don't put the account menu in the rail's footer — it belongs at the end of the `Navbar`, as `AccountMenu`",
    "Don't draw your own rule or padding around it; the switcher is the footer and carries both",
    "Don't use it for anything but workspaces — a list of pages belongs in the nav above it",
    "Don't show it in a floating rail called up over a workflow; the main rail is where the workspace is changed",
  ],
  relatedComponents: ['Drawer', 'List', 'AccountMenu', 'Menu', 'Avatar'],
};
