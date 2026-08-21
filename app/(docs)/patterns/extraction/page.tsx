import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Chip } from '@/src/components/Chip';
import { extraction } from '@/src/patterns';
import { CodeBlock } from '../../_components/CodeBlock';
import { ExtractionPreview } from './_components/ExtractionPreview';

export const metadata = {
  title: 'Extraction pattern — Atoms',
  description: extraction.description,
};

/** Body copy width — long prose stays readable at wide viewports. */
const PROSE = 760;

/** Tall enough to read a screenful of the snippet without owning the page. */
const CODE_MAX_HEIGHT_PX = 560;

/**
 * The width the preview is shown at, rather than the width of the docs column.
 *
 * A page of document beside a table of fields does not fit in a 900px column,
 * and squeezing it in is the one thing that would misrepresent the pattern: the
 * whole argument is that you can look from one to the other. So the frame keeps
 * its own proportions and this container scrolls — one scrollbar on the outside
 * instead of two inside, and the page itself never scrolls sideways.
 */
const PREVIEW_WIDTH_PX = 1320;

/** Docs route for a component named in `extraction.components`. */
function componentHref(name: string): string {
  const slug = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return `/components/${slug}`;
}

/**
 * The four rules the screen checks, stated rather than left to be inferred
 * from which rows happen to be tinted.
 */
const RULES: readonly { title: string; what: string }[] = [
  {
    title: 'Required and empty',
    what: 'A field the workflow cannot proceed without, holding nothing. The plainest rule, and the one most validation stops at.',
  },
  {
    title: 'Either, or',
    what: 'A purchase order number or a goods-receipt number. Neither row can be required on its own, because filling either one satisfies the rule — so the rule sits across the pair and both rows light up together.',
  },
  {
    title: 'The amounts against each other',
    what: 'Net plus tax has to come to the total. A required field that is filled in wrongly passes every emptiness check ever written, which is why presence is not the only test.',
  },
  {
    title: 'The amounts against the lines',
    what: 'The line items have to come to the net. This one lives on the other tab and gives its own verdict there, with three answers rather than two — before the net is captured there is nothing to compare against, and a check that has not run is not a check that failed.',
  },
];

export default function ExtractionPatternPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Patterns
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {extraction.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {extraction.description}
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Where it sits in invoice processing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The first stage of the <strong>invoice processing</strong> workflow,
            and the only one that touches the document itself.{' '}
            <Link href="/patterns/matching">Matching</Link> follows and asks
            whether what was read agrees with what was ordered and what arrived;
            it deliberately cannot edit the invoice, because the amount is this
            screen&apos;s to fix. <Link href="/patterns/erp-posting">ERP
            Posting</Link> is last.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The question here is narrower than it looks: not{' '}
            <em>is this invoice correct</em>, but{' '}
            <em>was it read correctly</em>. Those come apart. An invoice can be
            read perfectly and still be wrong, and that is matching&apos;s
            problem; a correct invoice read badly is this one&apos;s. Everything
            downstream is built on these thirteen fields, which is why the
            hand-off is shut while any of them is in doubt.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Two panels, and the link between them
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The page on the left, the fields that came off it on the right. The
            reader&apos;s whole job is looking from one to the other, so the two
            are connected rather than merely adjacent:{' '}
            <strong>selecting a field outlines the region it was read from</strong>{' '}
            and turns the viewer to that page. Checking a value against the
            document should not also mean finding it on the document.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            That link is the reason the page is drawn in code rather than
            embedded as an image. An image carries no tokens, cannot be copied
            into an application, and — the part that matters — has no regions to
            point at. Because the page and the fields come from one record, a
            field knows where it came from, and a field that came from{' '}
            <em>nowhere</em> can say so by outlining nothing. Two of the
            thirteen are in exactly that position, and a highlight landing on a
            plausible-looking region instead would be worse than none, because
            the reader would believe it.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Zoom, rotation and paging are real for the same reason: a viewer
            whose controls do nothing is a picture of a viewer. Zoom and
            rotation are one transform on the page rather than a re-layout, so
            the highlight moves with it — the outline is positioned in the
            page&apos;s own coordinates, inside the thing being transformed, and
            needs no arithmetic of its own.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            What counts as an issue
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Four rules, and the list they produce is the only state the screen
            keeps about its own health.
          </Typography>
          <Stack component="ul" spacing={1.5} sx={{ pl: 2.5, m: 0 }}>
            {RULES.map((rule) => (
              <Box component="li" key={rule.title}>
                <Typography variant="body2">
                  <strong>{rule.title}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {rule.what}
                </Typography>
              </Box>
            ))}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Everything visible is that list, recomputed on every render: the
            count in the alert, the count on the tab, which rows are tinted,
            which rows hold an input, and whether <code>Proceed</code> answers.
            One keystroke moves all five in the same paint. A verdict stored
            beside the values it was computed from goes stale on the first
            correction, and the row then disagrees with the value printed
            inside it.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            The flagged rows are the editable ones
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A flagged row holds a <code>TextField</code> rather than text. The
            row the screen is asking about is the row you can already type in —
            nobody has to discover that a cell is editable in order to fix the
            thing the alert just named.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No issue text sits on the row, and an earlier draft that put it
            there is worth describing because of how it failed. The reference
            rule names two rows, so the same sentence appeared twice on adjacent
            lines; the longest of them had to be truncated to hold the row&apos;s
            height, leaving <em>Total Amount before VAT/GST is …</em>, which
            tells a reader nothing they could not already see. The alert prints
            every issue in full and in one place. What a row owes is only that
            it is <em>one of them</em>, and it says that twice already — the
            fill, and an input carrying the error border.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Every row is pinned to one height for the same kind of reason. A{' '}
            <code>TextField</code> is 36px tall against a value&apos;s 20, so a
            row that swapped one for the other would grow and step the whole
            column below it down. The input is left unpadded and the row height
            does the centring, which keeps the table a grid whichever rows happen
            to be open.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Every other row becomes an input when it is clicked. Extraction is
            the stage that corrects a document&apos;s fields, and a screen that
            can only edit its own complaints is not that stage: the model can be
            confidently wrong, and a value nothing flagged is exactly the kind
            of error a person is here to catch.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The fill on those rows is <code>TableRow</code>&apos;s own{' '}
            <code>state=&quot;error&quot;</code> rather than a tint mixed here.
            The same condition on{' '}
            <Link href="/patterns/matching">Matching</Link> uses the same rung,
            which is the point of the state existing at all.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            The figure the invoice never printed
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Total Amount before VAT/GST</strong> opens empty, and it is
            empty for an honest reason: look at the document and there is no
            subtotal line. The invoice prints its four lines, then its tax, then
            its total, and never states the net in between. Extraction had
            nothing to read.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            It is recoverable two ways all the same — the total less the tax, and
            the sum of the lines — and that is what the screen uses it for. It
            does not fill the field in; a reader types the figure, and what they
            type is then checked against <em>both</em>. Put in something
            plausible but wrong and two issues appear rather than none, because
            the amounts stop adding up and the lines stop agreeing, and those are
            different facts about the same number. A field with two independent
            witnesses is a field a wrong value struggles to get past.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amounts are reprinted through whatever the <strong>Currency</strong>{' '}
            row says rather than carrying a symbol of their own, so correcting a
            mis-read currency reaches all of them at once and the three money
            rows cannot end up disagreeing about what they are denominated in.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            The error state is not a second screen
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The alert above the tabs — a count, then the issues under it — is
            what this screen looks like whenever the list is not empty, which
            includes the moment it opens. There is no separate error view to
            navigate to and no flag that puts the screen into one. Resolve both
            issues and the alert goes, the tab loses its count, and{' '}
            <code>Proceed</code> comes alive; break the arithmetic again and it
            all comes back. An error state you can only reach by rendering a
            different screen is a state nobody can test their way out of.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The alert is the only place an issue is spelled out, and the rows are
            the only place they are pointed at. Splitting it that way keeps one
            sentence per problem however many rows a rule names — the reference
            rule names two, and printing its sentence on both of them said the
            same thing twice for no reader&apos;s benefit.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Four gaps, left as gaps
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Four things this screen wants that the library does not have. None
            of them is worked around here — a screen that mixes its own version
            of a missing component is how two of them end up in the system.
          </Typography>
          <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>No segmented action group.</strong> The viewer&apos;s
              zoom, rotate and paging clusters want joined buttons under a
              shared border. <Link href="/components/toggle-button">
              ToggleButton</Link> groups are for selection and these are
              actions, so they are separate{' '}
              <Link href="/components/icon-button">IconButton</Link>s with the
              reading between them.
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>No assistant button.</strong> <code>Ask Neo</code> wants a
              gradient label and there is no gradient type and no assistant
              variant, so it is a stock outline{' '}
              <Link href="/components/button">Button</Link>.
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>The required mark.</strong> This screen paints the
              asterisk in error ink;{' '}
              <Link href="/components/text-field">TextField</Link> draws its own
              in the label&apos;s colour. Three screens have now asked for the
              first, which makes it the component&apos;s to settle rather than
              something to keep deciding per screen.
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              <strong>The alert runs a rung small for this use.</strong>{' '}
              <Link href="/components/alert">Alert</Link> sets its title at 13px
              over a 10px message, which is right for one line of consequence
              and tight for a bulleted list of them. The list is left at the
              component&apos;s size rather than overridden here.
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
            {extraction.components.map((name) => (
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
              Live, and the whole gate works. It opens on two issues and{' '}
              <code>Proceed</code> shut. Click <strong>Vendor Name</strong> and
              the block it was read from is outlined on the page; click{' '}
              <strong>Total Amount before VAT/GST</strong> and nothing is,
              because nothing on the document says it. Put <code>5000</code> in
              that field to watch one row raise two complaints — the amounts
              stop adding up <em>and</em> the lines stop agreeing, which are
              different facts. Correct it to <code>5450</code> and both go, and
              the <strong>Line items</strong> tab flips to{' '}
              <code>Matches the net</code>. Type a purchase order number into
              the first row and the last issue goes with it: the alert
              disappears, the tab loses its count, and <code>Proceed</code>{' '}
              answers. The viewer&apos;s zoom, rotation and pager all work; page
              two is empty, and says so.
            </Typography>
          </Stack>
          <Paper
            variant="outlined"
            sx={{ p: 3, borderRadius: 2, overflowX: 'auto' }}
          >
            <Box sx={{ minWidth: PREVIEW_WIDTH_PX }}>
              <ExtractionPreview />
            </Box>
          </Paper>
          <Typography variant="body2" color="text.secondary">
            The document, the fields and the rail&apos;s items are the
            application&apos;s, so the snippet carries them as data rather than
            inventing them — and the document pane is a stand-in for your own
            viewer. What is in it is the layout, the four rules, the derivation
            of the issue list from them, and the link between a field and the
            region it came from.
          </Typography>
          <CodeBlock maxHeight={CODE_MAX_HEIGHT_PX}>
            {extraction.code}
          </CodeBlock>
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
              {extraction.dos.map((item) => (
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
              {extraction.donts.map((item) => (
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
