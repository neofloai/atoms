import { extractionCode } from './extractionCode';

import type { PatternExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the `extraction` pattern. Read by `scripts/generate.ts`
 * and served through the MCP `get_pattern` tool and the docs site, so the
 * snippet a reader copies and the one an agent is handed are the same string.
 */
export const data: PatternExamplesData = {
  name: 'Extraction',
  slug: 'extraction',
  description:
    'The first stage of the invoice processing workflow: a document arrives, a model reads it, and a person confirms what was read before anything downstream believes it. The page sits beside the fields that came off it, every issue is derived from the values on each render, and the one thing the screen will not do is let an invoice through with an unresolved one.',
  code: extractionCode,
  components: [
    'Navbar',
    'Drawer',
    'Tabs',
    'Table',
    'TextField',
    'Alert',
    'Chip',
    'Button',
    'IconButton',
    'Tooltip',
    'Divider',
    'Typography',
  ],
  dos: [
    'Derive the issue list from the values on every render, and let the alert count, the tab count, the tinted rows and whether `Proceed` answers all read from that one list — a stored verdict goes stale on the first keystroke and the row then disagrees with the value printed inside it',
    'Put the document beside the fields, and make selecting a field point at the region it was read from: a reader checking a value against the page should not also have to find the page',
    'Say so when a field was read from nothing. A missing value whose highlight lands on a plausible-looking region is worse than no highlight at all, because the reader will believe it',
    'Let the flagged rows be the editable ones without a click: the row the screen is asking about is the row you can already type in, so nobody has to discover that a cell is editable to fix the thing the alert just named',
    'Check a corrected figure against everything that bears on it rather than the nearest thing — the net here is tested against the total less the tax and against the sum of the lines, so a plausible wrong number has two chances to be caught instead of one',
    'Keep the reference rule across both of its rows. A purchase order number and a goods receipt number are alternatives, so neither can be required on its own and both have to light up for the message to make sense',
    'Reprint every amount through the currency the record says, so correcting a mis-read currency reaches all of them at once and the money rows cannot disagree about what they are denominated in',
    'Give the line items their own verdict on their own tab, and give it three answers — agrees, disagrees, and nothing to compare against yet — because a check that has not run is not a check that failed',
    'Gate the hand-off on the issue list being empty and name the count in the tooltip: a disabled button that will not say what it is waiting for makes the reader hunt for work the screen already knows about',
  ],
  donts: [
    "Don't drop a screenshot in as the document. It carries no tokens, it cannot be copied into an app, and it costs the one thing the pane is for — with the page drawn from the same record as the fields, a field can point at where it came from",
    "Don't let extraction ask whether the invoice matches a purchase order. That is matching's question, and this screen has no receipts to answer it with; what it settles is whether the document was read correctly",
    "Don't mix a fill for a flagged cell at the call site. `TableRow` models the state on the row, so take the component's version — a tint invented in one screen is a rung the design system does not have, and the same condition then gets drawn two ways on two screens",
    "Don't validate only for presence. A required field that is filled in wrongly passes every emptiness check ever written, which is why the amounts are also checked against each other and against the lines",
    "Don't report one missing field as two problems. Before the net is captured the line items have nothing to disagree with, and calling that a second failure doubles the count for a single blank",
    "Don't print an issue's sentence on every row it names. One rule here names two rows, so the same line landed twice in adjacent cells and the longest had to be truncated to hold the row's height — say it once in the summary, and let the rows say only that they are the ones",
    "Don't enable the hand-off while an issue is open. Everything downstream — matching, posting, payment — is built on these fields being right, and a screen that can be skipped is a screen that will be",
  ],
};
