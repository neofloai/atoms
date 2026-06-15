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
    ],
  },
  {
    title: 'Foundations',
    items: [
      { label: 'Brand', href: '/branding' },
      { label: 'Tokens', href: '/tokens' },
      { label: 'Typography', href: '/tokens#typography' },
      { label: 'Spacing', href: '/tokens#spacing' },
      { label: 'Elevation', href: '/tokens#elevation' },
      { label: 'Radius', href: '/tokens#radius' },
      { label: 'Icons', href: '/icons' },
    ],
  },
  {
    title: 'Components',
    items: [
      { label: 'Avatar', href: '/components/avatar' },
      { label: 'Button', href: '/components/button' },
      { label: 'IconButton', href: '/components/icon-button' },
      { label: 'Chip', href: '/components/chip' },
      { label: 'TextField', href: '/components/text-field' },
      { label: 'Checkbox', href: '/components/checkbox' },
      { label: 'Radio', href: '/components/radio' },
      { label: 'Card', href: '/components/card', disabled: true },
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
