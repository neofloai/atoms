import type { ComponentExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for `AccountMenu`. Read by `scripts/generate.ts` and
 * served through the MCP `get_component` tool and the docs site.
 *
 * `figmaUrl` is the account flyout in the navigation sheet (4564:6122).
 * Until 4.2.0 this was a copy-paste example on `Menu`; the keywords that
 * used to point there point here now.
 */
export const data: ComponentExamplesData = {
  name: 'AccountMenu',
  category: 'Navigation',
  figmaUrl:
    'https://www.figma.com/design/iDCodnA5uZ14EdttjSMCT1/Product-Design-System?node-id=4564-6122',
  tagline:
    'The account dropdown at the end of the app bar — the signed-in user\'s avatar, and the panel it opens: the user\'s name, address and role, your rows, a System / Light / Dark theme switch and Sign out. One element in the `Navbar`\'s row; it renders its own trigger and holds its own open state.',
  keywords: [
    'account',
    'account menu',
    'account dropdown',
    'user menu',
    'user dropdown',
    'profile',
    'profile menu',
    'profile dropdown',
    'avatar menu',
    'avatar dropdown',
    'navbar menu',
    'navbar dropdown',
    'top bar menu',
    'sign out',
    'log out',
    'logout',
    'theme switch',
    'theme toggle',
    'dark mode toggle',
    'settings menu',
  ],
  props: [
    {
      name: 'user',
      type: '{ name: string; email?: string; role?: string; initials?: string; avatarSrc?: string }',
      default: '—',
      description:
        'Required. The signed-in user: the avatar on the trigger, and the panel\'s header — name, address in caption ink, and the role as a small grey tag. `initials` defaults to the first letters of the first and last words of `name`; `avatarSrc` shows a photo instead.',
    },
    {
      name: 'children',
      type: 'ReactNode',
      default: '—',
      description:
        'The rows between the header and the theme switch: `MenuItem`s with a 16px glyph, and a `Divider` between groups. Choosing a row closes the menu, so its `onClick` only does its own work. Pass the rows themselves, not a Fragment around them.',
    },
    {
      name: 'onSignOut',
      type: '() => void',
      default: '—',
      description:
        'Fired by the Sign out row, last in the panel in the `error` tone. Omit it to leave Sign out out.',
    },
    {
      name: 'showThemeSwitch',
      type: 'boolean',
      default: 'true',
      description:
        'The System / Light / Dark switch on a row of its own. It is wired to `NeofloThemeProvider`\'s colour scheme, so it needs nothing else; pressing it leaves the menu open so the change can be seen.',
    },
    {
      name: 'avatarColor',
      type: 'AvatarColor',
      default: "'error'",
      description: 'Colour role of the avatar, on the trigger and in the header.',
    },
    {
      name: 'labels',
      type: 'Partial<{ trigger, theme, system, light, dark, signOut }>',
      default: '—',
      description:
        'Replaces the words the menu draws itself — the trigger\'s accessible name, the theme row and its three options, and Sign out. Any subset; the rest stay English.',
    },
    {
      name: 'ref',
      type: 'Ref<HTMLButtonElement>',
      default: '—',
      description: 'Forwarded to the trigger — the avatar button.',
    },
  ],
  examples: [
    {
      title: 'In the app bar',
      description:
        'The trailing element of the `Navbar`\'s row, after a flexible gap and Ask Neo. The rows are yours: three groups divided by rules — the account\'s own pages, then help. The theme switch and Sign out come with the component.',
      code: [
        'import { AccountMenu, Box, Divider, IconButton, MenuItem, Navbar, Stack } from "@neofloai/atoms";',
        'import {',
        '  BookOpenIcon,',
        '  BugIcon,',
        '  ChartBarIcon,',
        '  CreditCardIcon,',
        '  GearSixIcon,',
        '  QuestionIcon,',
        '  StarFourIcon,',
        '} from "@neofloai/atoms/icons";',
        '',
        'const user = {',
        '  name: "John Doe",',
        '  email: "john.doe@neo.com",',
        '  role: "Tenant Owner",',
        '};',
        '',
        '<Navbar>',
        '  <Stack direction="row" sx={{ flex: 1, alignItems: "center", gap: 2 }}>',
        '    <Box sx={{ flex: 1 }} />',
        '    <IconButton variant="primary" appearance="outline" size="sm" aria-label="Ask Neo">',
        '      <StarFourIcon />',
        '    </IconButton>',
        '    <AccountMenu user={user} onSignOut={signOut}>',
        '      <MenuItem onClick={() => navigate("/settings")}>',
        '        <GearSixIcon size={16} />',
        '        Settings',
        '      </MenuItem>',
        '      <MenuItem onClick={() => navigate("/billing")}>',
        '        <CreditCardIcon size={16} />',
        '        Billings',
        '      </MenuItem>',
        '      <MenuItem onClick={() => navigate("/reporting")}>',
        '        <ChartBarIcon size={16} />',
        '        Reporting',
        '      </MenuItem>',
        '      <Divider />',
        '      <MenuItem onClick={() => navigate("/help")}>',
        '        <QuestionIcon size={16} />',
        '        Help',
        '      </MenuItem>',
        '      <MenuItem onClick={() => window.open(DOCS_URL)}>',
        '        <BookOpenIcon size={16} />',
        '        Documentation',
        '      </MenuItem>',
        '      <MenuItem onClick={reportIssue}>',
        '        <BugIcon size={16} />',
        '        Report an issue',
        '      </MenuItem>',
        '    </AccountMenu>',
        '  </Stack>',
        '</Navbar>',
      ].join('\n'),
    },
    {
      title: 'Rows that are links',
      description:
        'A row that goes to a page is a `MenuItem` rendered as your router\'s link, so it opens in a new tab on a middle click and shows its address on hover. The menu still closes when it is chosen.',
      code: [
        'import { Link } from "react-router";',
        '',
        '<AccountMenu user={user} onSignOut={signOut}>',
        '  <MenuItem component={Link} to="/settings">',
        '    <GearSixIcon size={16} />',
        '    Settings',
        '  </MenuItem>',
        '</AccountMenu>',
      ].join('\n'),
    },
    {
      title: 'Just the user and Sign out',
      description:
        'With no rows the panel is the header, the theme switch and Sign out. Turn the theme switch off for an app pinned to one scheme.',
      code: [
        '<AccountMenu',
        '  user={{ name: "Priya Raman", email: "priya@neo.com" }}',
        '  onSignOut={signOut}',
        '  showThemeSwitch={false}',
        '/>',
      ].join('\n'),
    },
    {
      title: 'In another language',
      description:
        '`labels` replaces the words the menu draws itself. Your rows are already yours to translate.',
      code: [
        '<AccountMenu',
        '  user={user}',
        '  onSignOut={signOut}',
        '  labels={{',
        '    trigger: "Compte",',
        '    theme: "Thème",',
        '    system: "Système",',
        '    light: "Clair",',
        '    dark: "Sombre",',
        '    signOut: "Se déconnecter",',
        '  }}',
        '/>',
      ].join('\n'),
    },
  ],
  dos: [
    'Put it last in the `Navbar`\'s row, after a `<Box sx={{ flex: 1 }} />`, so it sits at the trailing edge on every screen of the shell',
    'Give each row a 16px glyph, and divide groups with a `Divider` — the account\'s own pages, then help',
    'Pass `onSignOut` rather than adding your own Sign out row, so it comes last and in the `error` tone',
    'Leave the theme switch on unless the app is pinned to one scheme; it is already wired to the provider',
  ],
  donts: [
    "Don't put the account menu in the sidebar — the rail's footer is the `WorkspaceSwitcher`",
    "Don't close the menu from a row's `onClick`; choosing a row already closes it",
    "Don't wrap the rows in a Fragment; pass them as direct children so the menu can read them",
    "Don't rebuild the panel from `Menu` for an app shell — that is this component, and a copy stops tracking the design system the day it is pasted",
  ],
  relatedComponents: ['Navbar', 'WorkspaceSwitcher', 'Menu', 'MenuItem', 'Avatar'],
};
