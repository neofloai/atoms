import { matchingCode } from './matchingCode';

import type { PatternExamplesData } from '@/src/types/docs';

/**
 * Docs + MCP data for the `matching` pattern. Read by `scripts/generate.ts`
 * and served through the MCP `get_pattern` tool and the docs site, so the
 * snippet a reader copies and the one an agent is handed are the same string.
 */
export const data: PatternExamplesData = {
  name: 'Matching',
  slug: 'matching',
  description:
    'The third stage of the invoice processing workflow: an invoice that has been read, set against the purchase order it quotes and the goods receipts booked under it. One tab compares the header fields, the other allocates receipts to invoice lines, and neither edits the invoice — the answers this screen produces are an allocation and a decision.',
  code: matchingCode,
  components: [
    'Navbar',
    'Drawer',
    'Tabs',
    'Table',
    'Checkbox',
    'Chip',
    'Button',
    'IconButton',
    'TextField',
    'Tooltip',
    'Card',
    'Divider',
    'Alert',
    'Typography',
  ],
  dos: [
    'Derive every status, count and variance from the allocation on each render — one clicked checkbox has to change the row it is in, the filter counts, the tab count and whether `Validate` answers, all in the same paint',
    'Report the quantity gap and the money gap separately: the right quantity at the wrong price is a pricing dispute and the right price at the wrong quantity is a short delivery, and one combined figure hides which of the two you have',
    'Keep a third status between matched and unmatched — a receipt group that is plausibly right but does not add up is the case the screen exists for, and a binary puts it in one bucket or the other and loses it',
    'Put the invoice line id in the same column position in both panels, so the join between a line and its receipts reads across without anyone counting rows',
    'Let a difference in how something is written be acknowledged, and send a difference in what is owed back upstream: an amount that disagrees with the purchase order means one of the two documents was read wrong',
    'Show the acknowledgement count before the click rather than after — the third acknowledgement is the one that saves the rule, and nobody can tell that this click is the one that matters unless the count is already on screen',
    'Close each receipt group with a row stating what the allocation comes to, tinted by whether it balances: the group is the answer to the line, and an answer needs a row of its own',
    'Gate `Validate` on decisions rather than on the numbers agreeing, and name the tab that is still open in the tooltip — the user is one click from the work, not one guess from it',
  ],
  donts: [
    "Don't tint a row for every state you have a word for. A page where matched rows are green and probable rows are amber makes the red ones harder to find, not easier; a fill marks a row that wants something and the status glyph carries the rest",
    "Don't let this screen edit the invoice. The amount is extraction's to fix, and a matching screen that can rewrite the document it is checking has stopped being a check",
    "Don't store the status on the line: it goes stale the moment a receipt is allocated, and the row then disagrees with the numbers printed inside it",
    "Don't match on quantity alone. Two receipts can come to exactly the right quantity at two different unit prices, and the invoice is then over by the difference with every quantity on the page agreeing",
    "Don't offer `Accept` on a line that still has candidate receipts — accepting a difference you could still resolve files the work away instead of doing it",
    "Don't count an accepted line in the variance. The reader has already answered it, and a figure that can never reach zero stops being read — which is the same reason the tolerance exists",
    "Don't hide either half of the comparison behind a diff view: the reader is deciding which of two documents to believe, and both have to be legible to decide that",
  ],
};
