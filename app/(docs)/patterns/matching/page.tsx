import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Chip } from '@/src/components/Chip';
import { matching } from '@/src/patterns';
import { CodeBlock } from '../../_components/CodeBlock';
import { MatchingPreview } from './_components/MatchingPreview';

export const metadata = {
  title: 'Matching pattern — Atoms',
  description: matching.description,
};

/** Body copy width — long prose stays readable at wide viewports. */
const PROSE = 760;

/** Tall enough to read a screenful of the snippet without owning the page. */
const CODE_MAX_HEIGHT_PX = 560;

/**
 * The width the preview is shown at, rather than the width of the docs column.
 *
 * Two panels of seven columns do not fit in a 900px column, and squeezing them
 * in is the one thing that would misrepresent the pattern: the whole argument
 * is that the invoice and its receipts are legible side by side. So the frame
 * keeps its own proportions and this container scrolls — one scrollbar on the
 * outside instead of two inside, and the page itself never scrolls sideways.
 */
const PREVIEW_WIDTH_PX = 1320;

/** Docs route for a component named in `matching.components`. */
function componentHref(name: string): string {
  const slug = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return `/components/${slug}`;
}

/**
 * The four statuses a line can hold, and what each one means. The set is the
 * screen's vocabulary, so the page states it rather than leaving a reader to
 * infer it from four coloured glyphs.
 */
const STATUSES: readonly { title: string; what: string }[] = [
  {
    title: 'Matched',
    what: 'The receipts allocated to this line agree with it on quantity and on money. Nothing is asked of the reader.',
  },
  {
    title: 'Probable',
    what: 'Receipts were found for the item, and they do not add up. This is the status the screen exists for: a binary matched/unmatched would file it under one or the other and lose the only thing worth showing.',
  },
  {
    title: 'No match',
    what: 'No receipt exists at all. On a goods line that means the delivery has not been booked; on a service line it means one never will be.',
  },
  {
    title: 'Accepted',
    what: 'Not a match — a person deciding the line is payable without one, by ticking the row. It reads differently on the row because it is a different kind of fact.',
  },
];

export default function MatchingPatternPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Patterns
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {matching.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {matching.description}
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Where it sits in invoice processing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The third stage of the <strong>invoice processing</strong> workflow.
            Extraction asked whether the document was read correctly; this asks
            whether what was read agrees with what was ordered and what
            arrived. <Link href="/patterns/erp-posting">ERP Posting</Link>{' '}
            follows, and only takes invoices that left here validated.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Nothing on this screen edits the invoice. That matters more than it
            sounds: a matching screen that can rewrite the document it is
            checking has stopped being a check. The two answers it produces are
            an <strong>allocation</strong> — which goods receipts satisfy which
            invoice line — and a <strong>decision</strong>, which is a
            difference someone has agreed to live with. Both are held as sets of
            ids, and every status, count and variance on the page is derived
            from them on render.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Two tabs, because there are two comparisons
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Invoice details</strong> compares eleven header fields —
            vendor, dates, terms, amounts — against the purchase order, one row
            each. Three columns: the field name in a tinted label column, then
            what each document says. Two value columns rather than one column
            and a diff, because the reader is deciding which of two documents to
            believe and both have to be legible to decide that. The decision
            sits inside the PO cell rather than in a fourth column, which keeps
            the action beside the value it is about.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Line items</strong> is the invoice on the left and the goods
            receipts on the right, six columns each. The receipts are grouped by
            the invoice line each one is a candidate for, and the checkbox in
            front of a receipt is the allocation: tick it and it counts toward
            that line. Each group is closed by a row stating what its allocation
            comes to, which is where the two variances are named.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The invoice rows have a checkbox of their own, in the same cell as
            the status glyph, and it opens ticked on a line that matched and
            clear on one that did not. That makes it the decision as well as the
            state: ticking a line that did not match is a person saying it is
            payable anyway, which is what the freight line needs and why there
            is no separate Accept button. A matched line&apos;s box is ticked and
            locked — unticking it would mean excluding a line that agrees, and
            that is not a decision this screen is for.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Both tabs carry a count of what is still open on them, and{' '}
            <code>Validate</code> is shut while either count is above zero. That
            is the reason for the counts: the tab you are not looking at is
            still holding work, and a gate that refuses without saying which
            half is the problem sends you looking for it.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Quantity and money fail separately
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A group is checked in both dimensions and reported in both, never
            rolled into one figure. The right quantity at the wrong price is a
            pricing dispute; the right price at the wrong quantity is a short
            delivery. One combined number tells you there is a problem and hides
            which one you have.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The second invoice line in the preview is the case for that.
            Three receipts are candidates for its sixty units, at two different
            unit prices, and the pair allocated when the screen opens comes to
            exactly sixty — with the invoice over by twelve dollars. Every
            quantity on the page agrees. Matching on quantity alone would call
            it done.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Four statuses, two fills
          </Typography>
          <Stack
            component="ul"
            spacing={2}
            sx={{ pl: 0, m: 0, listStyle: 'none' }}
          >
            {STATUSES.map((status) => (
              <Stack key={status.title} component="li" spacing={0.5}>
                <Typography variant="body2">
                  <strong>{status.title}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {status.what}
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            The four glyphs take their ink from the <code>icon</code> token
            group rather than <code>text</code>. The two hold the same values on
            every accent role today, so nothing visible turns on the choice —
            but they already differ on two rungs, and a glyph following the text
            ramp would move the day design splits another one. The rung is per
            role, not one rule for all four: the yellow ramp runs light-to-dark
            where green and red run dark-to-light, so warning takes{' '}
            <code>accent</code> where the others take{' '}
            <code>onColorHover</code>. Same intent, different rung, because the
            rule is <em>the one that reads on the surface</em>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Two of the four also tint their row, through{' '}
            <Link href="/components/table">Table</Link>&apos;s{' '}
            <code>state</code>: <strong>matched</strong> takes{' '}
            <code>success</code> and <strong>no match</strong> takes{' '}
            <code>error</code>. Those are the two outcomes the row component
            models, and they are the two the design system&apos;s own row set
            draws.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The other two stay untinted, for two different reasons.{' '}
            <strong>Probable</strong> would want a warning fill, and there is no
            warning rung to take — the design&apos;s <code>table-rows</code>{' '}
            State axis has six values and none of them is one, so a tint here
            would be a rung invented at a call site. Its glyph and its
            group&apos;s own subtotal row carry it instead.{' '}
            <strong>Accepted</strong> is untinted on purpose: a person overrode
            the check rather than the check passing, and <code>success</code>{' '}
            would say the second thing.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Selection outranks both. The row you are working on takes the
            neutral selected fill and keeps its bracket, so a matched row loses
            its green while it is the active one — which is the component&apos;s
            own precedence, and the right way round: the data state is still
            true when you look away, and the selection is not.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Acknowledge, and the third time
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A vendor whose registered name differs from its trading name will
            differ that way on every invoice it ever sends. So the header
            comparison offers <code>Acknowledge</code> on a difference in{' '}
            <em>how something is written</em> — and the third acknowledgement of
            the same field is written to memory, after which that field matches
            automatically and the question stops being asked.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The count is shown before the click, not after. &ldquo;2 of 3
            before&rdquo; beside the button is what tells the reader this click
            is the one that settles it; discovering that afterwards is not the
            same thing. In the preview, <strong>Vendor</strong> has been
            acknowledged twice already and <strong>Vendor Code</strong> once.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A difference in <em>what is owed</em> carries no such action. An
            amount that disagrees with the purchase order means one of the two
            documents was read wrong, and the answer is to read it again in
            extraction rather than to wave it through here. The amounts agree in
            this record, so the branch shows nothing — but it is the reason
            fields carry the flag at all rather than every mismatch getting the
            same button.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            The variance, and what a tolerance is for
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The bar under both panels compares the whole invoice against the
            whole allocation, and subtracts the lines someone accepted. That
            third term is the interesting one: freight is still owed, it just
            never arrived on a lorry, so leaving it in would report a gap the
            reader has already answered. A figure that can never reach zero
            stops being read — which is the same reason the tolerance exists.
            Five dollars against a twenty-nine thousand dollar invoice is not a
            dispute, and blocking on it teaches the user to accept everything.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Three gaps, left as gaps
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Every component here is stock: no <code>sx</code> reaches inside one
            to restyle it. Three things this screen would have drawn differently
            are therefore left alone, because a fix applied in eleven screens is
            how a design system stops being one.
          </Typography>
          <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              <code>Ask Neo</code> is a plain outline button. The assistant
              action is drawn with its label in a primary-to-purple gradient and
              a tinted border, and Atoms has neither gradient type nor an
              assistant variant. That belongs to{' '}
              <Link href="/components/button">Button</Link>.
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              The variance verdict sits in a plain{' '}
              <Link href="/components/card">Card</Link> with a{' '}
              <Link href="/components/chip">Chip</Link> carrying the colour,
              where a tinted status card with a matching border would say it in
              one element. A status card is a component to add.
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              The line you are working on is marked with{' '}
              <Link href="/components/table">Table</Link>&apos;s own selection —
              a hairline bracket above and below — where the design draws a 4px
              bar down the leading edge and a tinted row. That bracket is a
              decision the component argues for at length in its own source, so
              it stands and the difference is logged.
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              A probable line gets no row tint. <code>TableRowState</code> is{' '}
              <code>default | error | success</code> — which is not the
              component falling short of the design, it is the design: the{' '}
              <code>table-rows</code> State axis has six values and no warning
              among them. A warning row is a rung for the design system to add,
              not for a screen to invent.
            </Typography>
          </Stack>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Built from
          </Typography>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            {/* The anchor is the interactive element and the chip is the
                shape of it — `clickable` would put a button inside a link. */}
            {matching.components.map((name) => (
              <Link
                key={name}
                href={componentHref(name)}
                underline="none"
                sx={{ display: 'inline-flex' }}
              >
                <Chip
                  size="sm"
                  variant="secondary"
                  label={name}
                  sx={{ cursor: 'pointer' }}
                />
              </Link>
            ))}
          </Stack>
        </Stack>

        <Divider />

        <Stack spacing={3}>
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              The screen
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Live, and the whole gate works. It opens one matched line, two
              probable and one with no receipt at all, and{' '}
              <code>Validate</code> shut. On <strong>ILI-0002</strong>, untick{' '}
              <code>GRN-1071</code> and tick <code>GRN-1068</code> — same
              quantity, twelve dollars cheaper, and the group balances. On{' '}
              <strong>ILI-0003</strong>, tick <code>GRN-1090</code> to cover the
              twelve units it is short — both lines flip to matched and their
              own checkboxes tick themselves and lock. Then tick the freight
              line by hand, acknowledge the three header fields on the other
              tab, and the variance reads <code>Balanced</code>.
            </Typography>
          </Stack>
          <Paper
            variant="outlined"
            sx={{ p: 3, borderRadius: 2, overflowX: 'auto' }}
          >
            <Box sx={{ minWidth: PREVIEW_WIDTH_PX }}>
              <MatchingPreview />
            </Box>
          </Paper>
          <Typography variant="body2" color="text.secondary">
            The invoice, the receipts and the rail&apos;s items are the
            application&apos;s, so the snippet carries them as data rather than
            inventing them. What is in it is the layout, the allocation model,
            the four statuses derived from it, and the rule that decides whether{' '}
            <code>Validate</code> answers.
          </Typography>
          <CodeBlock maxHeight={CODE_MAX_HEIGHT_PX}>{matching.code}</CodeBlock>
        </Stack>

        <Divider />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={4}
          sx={{ maxWidth: PROSE }}
        >
          <Stack spacing={1.5} sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Do
            </Typography>
            <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
              {matching.dos.map((item) => (
                <Typography
                  key={item}
                  component="li"
                  variant="body2"
                  color="text.secondary"
                >
                  {item}
                </Typography>
              ))}
            </Stack>
          </Stack>
          <Stack spacing={1.5} sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Don&apos;t
            </Typography>
            <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
              {matching.donts.map((item) => (
                <Typography
                  key={item}
                  component="li"
                  variant="body2"
                  color="text.secondary"
                >
                  {item}
                </Typography>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Container>
  );
}
