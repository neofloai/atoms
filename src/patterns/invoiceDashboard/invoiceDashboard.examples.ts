import { invoiceDashboardCode } from './invoiceDashboardCode';

import type { PatternExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the `invoice-dashboard` pattern. Read by
 * `scripts/generate.ts` and served through the MCP `get_pattern` tool and
 * the docs site, so the snippet a reader copies and the one an agent is
 * handed are the same string.
 */
export const data: PatternExamplesData = {
  name: 'Invoice Dashboard',
  slug: 'invoice-dashboard',
  description:
    'The entry screen of the invoice processing workflow: every invoice in the queue with the stage it is parked at, and a Review button that opens each one wherever it is stuck.',
  code: invoiceDashboardCode,
  components: [
    'Drawer',
    'Navbar',
    'IconButton',
    'Typography',
    'Button',
    'Tabs',
    'TextField',
    'Filter',
    'Chip',
    'DataGrid',
    'Link',
    'Tooltip',
    'Progress',
    'Divider',
  ],
  dos: [
    'Keep the queue to invoices — one row is one invoice, and the stage column is what makes a single list enough for the whole invoice processing workflow',
    'Let the Status chip decide where Review goes: extraction, matching and ERP posting are stages of one record, so the row already says which screen to open',
    'Draw the stage chips in the semantic roles every other status pill in the library uses — `information`, `warning`, `success`, `error` — so amber means the same thing in this table as in the next one',
    'Put the error state on the chip with `icon={<WarningCircleIcon />}`, so a failed invoice is legible in greyscale and not by hue alone',
    'Flex the two identity columns and fix Status, Amount and Action, so the table absorbs the rail folding by giving and taking from the names',
    'Set the amount in `fontFamilies.mono` and right-align it — lined-up decimal points are the only reason a reader can compare two figures without reading either',
    'Keep the Action control in one place across all three of its states, disabled included, so the table does not jump under the cursor when a row finishes processing',
    'Split the queue with `Tabs` above the toolbar and narrow it with `Filter` inside — Open vs Closed is a different question from the facets, and mixing them hides one behind the other',
  ],
  donts: [
    "Don't mix other work into this table — the moment it lists anything but invoices, the stage column stops meaning one thing and Review stops having one destination",
    "Don't tint the whole row for a failed invoice with `rowState`; the chip carries the error, and a tinted row makes the Action column compete with the status for the same glance",
    "Don't reach for `purple` or `orange` for a stage: they are decorative roles that stand for no state, so a reader cannot tell from them which of two stages is the one that went wrong",
    "Don't spell the stage into the button (`Review extraction`, `Review match`) — the label would change width row to row for information the chip beside it already gives",
    "Don't drop the Action column into the horizontal scroll region on a narrow screen; it is the only way into the workflow, so it keeps a fixed width and the names ellipsise instead",
    "Don't put Upload Invoice in the toolbar — it adds work to the queue rather than changing what the table shows, which is why it sits in the title band as the one filled button on the screen",
    "Don't give the grid a fixed pixel height inside the shell; it takes the height it is given, and a fixed one leaves either a gap above the footer or rows below the fold",
  ],
};
