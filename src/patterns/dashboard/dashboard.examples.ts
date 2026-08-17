import { dashboardCode } from './dashboardCode';

import type { PatternExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the `dashboard` pattern. Read by
 * `scripts/generate.ts` and served through the MCP `get_pattern` tool and
 * the docs site, so the snippet a reader copies and the one an agent is
 * handed are the same string.
 */
export const data: PatternExamplesData = {
  name: 'Dashboard',
  slug: 'dashboard',
  description:
    'A full application screen: a collapsing nav rail down the side, an app bar above the page, and a searchable, filterable table filling the rest.',
  code: dashboardCode,
  components: [
    'Drawer',
    'Navbar',
    'IconButton',
    'ToggleButton',
    'Tooltip',
    'TextField',
    'Button',
    'Chip',
    'Filter',
    'DataGrid',
    'Divider',
  ],
  dos: [
    'Lay the screen out as a row — rail, then a column — so the rail owns the full height and the bar starts where it ends',
    'Put the collapse toggle at the leading edge of the bar: it is the one control whose position does not move when the rail folds',
    'Give the rail its folded width through `size={collapsed ? 64 : \'sm\'}`, so the space it reserves narrows with the panel and the change animates',
    'Let the title and toolbar bands be as tall as their contents and give the grid `flex: 1` with `minHeight: 0`, so the footer lands on the bottom edge at any window height',
    'Keep the toolbar to one row: free-text search on the left, the actions that change what the table shows on the right',
    'Badge the filter trigger with `countActiveFilters` — once the panel closes it is the only thing left saying the table is filtered',
    'Point the filter panel at the right edge of its trigger when the trigger sits at the right of the toolbar',
    'Let one `Clear Filters` reset the search box and the panel together, because a reader sees one filtered table rather than two controls',
  ],
  donts: [
    "Don't run the bar the full width above the rail — the brand mark is the top-left corner of the app, and a bar across the top leaves the toggle nothing to line up with",
    "Don't stack a second `Navbar size=\"md\"` under the app bar for the page title; the page header is a different screen, not a second band on this one",
    "Don't wrap the grid in a `Card` — it draws no border or radius of its own precisely so it can sit as a band between two hairlines",
    "Don't give the grid a fixed pixel height inside the shell; it takes the height it is given, and a fixed one leaves either a gap above the footer or rows below the fold",
    "Don't put per-page actions in the rail — it navigates between screens, and the bar and the toolbar are where the current screen's controls live",
  ],
};
