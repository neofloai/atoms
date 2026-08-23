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
    'A full application screen: a collapsing nav rail down the side with one level of nesting under its sections, an app bar above the page, and a searchable, filterable table filling the rest.',
  code: dashboardCode,
  components: [
    'Drawer',
    'Navbar',
    'IconButton',
    'ToggleButton',
    'Tooltip',
    'Collapse',
    'Menu',
    'MenuItem',
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
    'Stop the nav tree at one level of nesting — a rail that needs three needs a different navigation model, not a third indent',
    'Draw a parent whose child is the current page in the selected row\'s ink and weight but with no fill, so exactly one row carries the fill and the group still says the page is inside it',
    'Stand a hairline between the parent\'s glyph and the children\'s, which is what makes the indent read as descent rather than as a second list',
    'Move the second level into a flyout when the rail folds, anchored to the parent\'s glyph and headed with the parent\'s name — folded there is no width to indent into, and an icon alone cannot say which branch two rows belong to',
    'Open a group when the page arrives inside it, and leave a group the reader opened by hand open once they navigate away',
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
    "Don't leave a parent row selectable as if it were a page: it opens and closes the level under it, and giving it the fill as well means two rows claim to be where you are",
    "Don't indent the second level in a folded rail — there is no width to indent into, and clipping the labels leaves a column of glyphs that says nothing about which are children",
    "Don't rely on `ToggleButton`'s own selected fill for a nav row: it is `card 2`, exactly what the rail's paper is painted, so only the ink shifts and the row reads as emphasised rather than as current",
  ],
};
