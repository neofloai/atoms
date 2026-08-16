/**
 * Single source of truth for the docs-site left navigation.
 *
 * Adding a new component, pattern, or foundation page is a one-line
 * entry here — the sidebar renders directly from this list. Order in
 * the array is the order shown in the UI.
 *
 * Mark unfinished pages with `disabled: true` to keep them visible in
 * the navigation (so the team can see what's coming) without producing
 * dead links.
 */

export interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly disabled?: boolean;
}

export interface NavSection {
  readonly title: string;
  readonly items: readonly NavItem[];
}

export const navigation: readonly NavSection[] = [
  {
    title: 'Getting started',
    items: [
      { label: 'Introduction', href: '/' },
      { label: 'Installation', href: '/installation' },
      { label: 'MCP endpoint', href: '/mcp-guide' },
      { label: 'Help', href: '/help' },
    ],
  },
  {
    title: 'Foundations',
    items: [
      { label: 'Brand', href: '/branding' },
      { label: 'Favicon', href: '/branding#favicon' },
      { label: 'Tokens', href: '/tokens' },
      { label: 'Typography', href: '/tokens#typography' },
      { label: 'Spacing', href: '/tokens#spacing' },
      { label: 'Responsive', href: '/tokens#responsive' },
      { label: 'Elevation', href: '/tokens#elevation' },
      { label: 'Radius', href: '/tokens#radius' },
      { label: 'Icons', href: '/icons' },
    ],
  },
  {
    title: 'Components',
    items: [
      { label: 'Alert', href: '/components/alert' },
      { label: 'Avatar', href: '/components/avatar' },
      { label: 'Badge', href: '/components/badge' },
      { label: 'Box', href: '/components/box' },
      { label: 'Stack', href: '/components/stack' },
      { label: 'Grid', href: '/components/grid' },
      { label: 'Container', href: '/components/container' },
      { label: 'Divider', href: '/components/divider' },
      { label: 'Card', href: '/components/card' },
      { label: 'Dialog', href: '/components/dialog' },
      { label: 'Drawer', href: '/components/drawer' },
      { label: 'Navbar', href: '/components/navbar' },
      { label: 'Button', href: '/components/button' },
      { label: 'IconButton', href: '/components/icon-button' },
      { label: 'Chip', href: '/components/chip' },
      { label: 'Link', href: '/components/link' },
      { label: 'TextField', href: '/components/text-field' },
      { label: 'Select', href: '/components/select' },
      { label: 'DatePicker', href: '/components/date-picker' },
      { label: 'TimePicker', href: '/components/time-picker' },
      { label: 'Checkbox', href: '/components/checkbox' },
      { label: 'Radio', href: '/components/radio' },
      { label: 'Switch', href: '/components/switch' },
      { label: 'Slider', href: '/components/slider' },
      { label: 'ToggleButton', href: '/components/toggle-button' },
      { label: 'Table', href: '/components/table' },
      { label: 'DataGrid', href: '/components/data-grid' },
      { label: 'Tabs', href: '/components/tabs' },
      { label: 'Stepper', href: '/components/stepper' },
      { label: 'Accordion', href: '/components/accordion' },
      { label: 'List', href: '/components/list' },
      { label: 'Menu', href: '/components/menu' },
      { label: 'Tooltip', href: '/components/tooltip' },
      { label: 'Skeleton', href: '/components/skeleton' },
      { label: 'Progress', href: '/components/progress' },
      { label: 'Animations', href: '/components/animations' },
    ],
  },
  {
    title: 'Patterns',
    items: [
      { label: 'Dashboard', href: '/patterns/dashboard', disabled: true },
      { label: 'Settings', href: '/patterns/settings', disabled: true },
      { label: 'Auth', href: '/patterns/auth', disabled: true },
    ],
  },
];

export const DRAWER_WIDTH = 272;
export const APP_BAR_HEIGHT = 56;
