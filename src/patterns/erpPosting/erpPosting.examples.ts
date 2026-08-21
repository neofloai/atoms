import { erpPostingCode } from './erpPostingCode';

import type { PatternExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the `erp-posting` pattern. Read by
 * `scripts/generate.ts` and served through the MCP `get_pattern` tool and
 * the docs site, so the snippet a reader copies and the one an agent is
 * handed are the same string.
 */
export const data: PatternExamplesData = {
  name: 'ERP Posting',
  slug: 'erp-posting',
  description:
    'The last stage of the invoice processing workflow: everything extracted, matched and validated is posted to the ERP from here, along with the extra fields the posting itself needs. Simulate checks the accounting first and surfaces the error the ERP throws if there is one.',
  code: erpPostingCode,
  components: [
    'Navbar',
    'Drawer',
    'IconButton',
    'Button',
    'Tooltip',
    'Alert',
    'Grid',
    'TextField',
    'Select',
    'Menu',
    'MenuItem',
    'Chip',
    'Divider',
    'DataGrid',
    'Typography',
  ],
  dos: [
    'Split the header fields by where their value came from: the ones extraction and matching established are read-only here, and the ones the ERP needs are the reason this screen exists at all',
    'Keep a carried field `required` even though it is `disabled` — a missing PO number blocks the post and sends the user back a stage, which is a precondition rather than a contradiction',
    'Gate `Proceed` on a clean `Simulate` pass, so the only way to reach the ERP is to have already asked it what it would say',
    'Derive the findings from the record on every render — fixing a line has to clear the finding that named it in the same paint, and a stored list goes stale the moment the record changes under it',
    'Return errors and advisories as one list and let `severity` carry the difference: the user asked one question, so the answer is one answer',
    'Compute the variance rather than storing it, and leave the field read-only — zero is the only acceptable value, which makes it a check and not a field',
    'Offer `Fix value` only on a line the check actually rejected, and keep `Split` on every other line, because splitting is about the accounting rather than about anything being wrong',
    'Set line numbers and line totals in `fontFamilies.mono` — an index you scan for and a figure you compare against its neighbours are the same kind of reading, and proportional digits defeat both',
  ],
  donts: [
    "Don't let this screen edit an amount or a PO number; changing those means changing the invoice, and the extraction and matching screens exist to do that",
    "Don't enable `Proceed` before a simulate pass to save the user a click — the error then surfaces in the accounting system, where it costs a reversal instead of a fix",
    "Don't split the findings into an error panel and a warning panel: the reader would have to work out which region a message landed in before they could read it, when the colour already says",
    "Don't block the post on an advisory. A withholding-tax notice is the ERP telling you how it will post, not refusing to, and treating the two the same trains the user to dismiss both",
    "Don't put the message for a rejected line inside the row; the grid has no sub-row to hold it, so the finding names its line and `rowState` tints the row it names",
    "Don't move or relabel `Proceed` as its state changes — the only thing the check alters is whether it answers, and a button that also moves makes the gate feel like a different control each time",
    "Don't repeat the tax code decision per row when every line takes the same one: the caret in the column header sets it on all of them, which is why those two headers carry a caret and the sortable ones do not",
  ],
};
