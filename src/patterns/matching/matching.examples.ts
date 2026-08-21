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
    'Derive every status, count and variance from the allocation on each render — one clicked checkbox has to change the row it is in, the tab count and whether `Validate` answers, all in the same paint',
    'Report the quantity gap and the money gap separately: the right quantity at the wrong price is a pricing dispute and the right price at the wrong quantity is a short delivery, and one combined figure hides which of the two you have',
    'Keep a third status between matched and unmatched — a receipt group that is plausibly right but does not add up is the case the screen exists for, and a binary puts it in one bucket or the other and loses it',
    'Tint a matched row `success` and an unmatched one `error` through the row state, and let selection outrank both: the data state is still true when the reader looks away and the selection is not',
    'Give a matched line a ticked, locked checkbox and an unmatched one a clear box: the leading cell then carries the state and the decision at once, and ticking a line that did not match is the person saying it is payable anyway',
    'Let a difference in how something is written be acknowledged, and send a difference in what is owed back upstream: an amount that disagrees with the purchase order means one of the two documents was read wrong',
    'Show the acknowledgement count before the click rather than after — the third acknowledgement is the one that saves the rule, and nobody can tell that this click is the one that matters unless the count is already on screen',
    'Close each receipt group with a row stating what the allocation comes to, tinted by whether it balances, and stack each gap under the figure it is about — the quantity delta under the quantity, the money delta under the money',
    'Gate `Validate` on decisions rather than on the numbers agreeing, and name the tab that is still open in the tooltip — the user is one click from the work, not one guess from it',
  ],
  donts: [
    "Don't invent a row fill for a state the row component does not model. `TableRowState` is `default | error | success` and carries no warning, so a probable line takes its glyph and its subtotal row rather than an amber tint mixed at the call site",
    "Don't let this screen edit the invoice. The amount is extraction's to fix, and a matching screen that can rewrite the document it is checking has stopped being a check",
    "Don't store the status on the line: it goes stale the moment a receipt is allocated, and the row then disagrees with the numbers printed inside it",
    "Don't match on quantity alone. Two receipts can come to exactly the right quantity at two different unit prices, and the invoice is then over by the difference with every quantity on the page agreeing",
    "Don't add a separate Accept button when the row already has a checkbox: a leading cell that opens ticked where the line matched is already asking whether to include it, and two controls for one decision is one too many",
    "Don't count an accepted line in the variance. The reader has already answered it, and a figure that can never reach zero stops being read — which is the same reason the tolerance exists",
    "Don't hide either half of the comparison behind a diff view: the reader is deciding which of two documents to believe, and both have to be legible to decide that",
  ],
};
