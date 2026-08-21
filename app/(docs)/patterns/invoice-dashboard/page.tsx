import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Chip } from '@/src/components/Chip';
import { invoiceDashboard } from '@/src/patterns';
import { CodeBlock } from '../../_components/CodeBlock';
import { InvoiceDashboardPreview } from './_components/InvoiceDashboardPreview';

export const metadata = {
  title: 'Invoice Dashboard pattern — Atoms',
  description: invoiceDashboard.description,
};

/** Body copy width — long prose stays readable at wide viewports. */
const PROSE = 760;

/** Tall enough to read a screenful of the snippet without owning the page. */
const CODE_MAX_HEIGHT_PX = 560;

/** Docs route for a component named in `invoiceDashboard.components`. */
function componentHref(name: string): string {
  const slug = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return `/components/${slug}`;
}

/** The four stages, and the chip role each one is drawn in. */
const STAGES: readonly {
  label: string;
  variant: 'information' | 'warning' | 'success' | 'error';
  variantName: string;
  what: string;
}[] = [
  {
    label: 'Extraction',
    variant: 'information',
    variantName: 'information',
    what: 'OCR and contextual extraction have run; every field carries a confidence score and the ones the model is unsure of are flagged for review.',
  },
  {
    label: 'Matching',
    variant: 'warning',
    variantName: 'warning',
    what: 'Metadata and line items are being matched. Fields that disagree show red, and acknowledging the same field three times commits it to memory — so this is the stage that is genuinely waiting on a person.',
  },
  {
    label: 'ERP Posting',
    variant: 'success',
    variantName: 'success',
    what: 'The last stage. Everything extracted, matched and validated is posted from here, along with the extra fields the posting itself needs. Simulate checks the accounting first and surfaces the error the ERP throws if there is one.',
  },
  {
    label: 'Error',
    variant: 'error',
    variantName: 'error',
    what: 'The stage failed. This is the only status that also carries a glyph, so a failed invoice is legible without relying on hue.',
  },
];

export default function InvoiceDashboardPatternPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Patterns
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {invoiceDashboard.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {invoiceDashboard.description}
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Where it sits in invoice processing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This is the front door of the <strong>invoice processing</strong>{' '}
            workflow. Every invoice in the workflow is on it, whatever stage it
            has reached, and the screen&apos;s whole job is to get you from a
            list to the one invoice that needs you. Nothing else belongs in the
            table — the moment it lists anything but invoices, the status
            column stops meaning one thing and <code>Review</code> stops
            having one destination.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The three screens after it — extraction review, matching, and ERP
            posting — are stages of a single record rather than separate
            queues. That is why there is one list and not three: the row
            already carries the stage, so <code>Review</code> opens the
            invoice wherever it is stuck without needing a label per stage.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            The status column is the screen
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Every other column tells you <em>which</em> invoice this is. The
            status tells you what it is waiting for, and it is the only field
            on the row that changes where the button goes. It is scanned down
            a column rather than read row by row, which is why the four stages
            take the four <em>semantic</em> chip roles — the same ones every
            other status pill in the library uses:
          </Typography>
          <Stack component="ul" spacing={1.5} sx={{ pl: 0, m: 0, listStyle: 'none' }}>
            {STAGES.map((stage) => (
              <Stack
                key={stage.label}
                component="li"
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ alignItems: { sm: 'flex-start' } }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ flexShrink: 0, alignItems: 'center', minWidth: 200 }}
                >
                  <Chip size="sm" variant={stage.variant} label={stage.label} />
                  <Typography variant="caption" color="text.disabled">
                    <code>{stage.variantName}</code>
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {stage.what}
                </Typography>
              </Stack>
            ))}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Read down the column those four are a progression — the machine is
            working, a person is needed, everything is validated, a stage has
            failed — and that is why the roles are the semantic ones rather than
            the hues in the frame, which paints matching purple and posting
            blue. One vocabulary across the library is worth more than
            per-screen fidelity: someone who has learned that amber means a row
            is waiting on them should not have to relearn it per table.{' '}
            <Link href="/components/chip">Chip</Link> does carry{' '}
            <code>purple</code> and <code>orange</code>, but they are
            decorative roles that stand for no state, so a reader could not tell
            from them which of two stages was the bad one.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Three questions, three controls
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The tabs ask which queue, the search box asks whether a row
            mentions something, and the panel asks whether a row is one of a
            set. They are genuinely different questions, and a row has to
            answer all three — so the rule lives in one function rather than in
            any one control. Split across them, &ldquo;filtered&rdquo; would
            eventually mean something different in each.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            That is also why the tabs sit <em>above</em> the toolbar and not
            inside the panel. Open against Closed is not a facet: it decides
            which queue you are looking at, and burying it among vendors and
            statuses would hide the one control that changes what the page is.
            Both facets in the panel are columns on screen, for the same
            reason — filtering on something the table does not show reads as a
            broken control.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <code>Upload Invoice</code> stays in the title band rather than the
            toolbar. It adds work to the queue instead of changing what the
            table shows, and it is the one filled button on the screen because
            it is the only thing here that creates something.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            The row, cell by cell
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The two identity columns flex and the three on the right are fixed,
            so the table absorbs the rail folding by giving and taking from the
            names — never from the amount or the button, which are the two
            things read down a column. The amount is set in{' '}
            <code>fontFamilies.mono</code> and right-aligned: lined-up decimal
            points are the only reason a reader can compare two figures without
            reading either of them. The currency mark stays in the caption
            colour, because it is identical on every row.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <code>Action</code> holds one control in three states — Review,
            View, and a disabled Processing — in the same place and at the same
            width. A row that finishes processing becomes one of the other two
            on its own, and moving or removing the control in the meantime
            would make the table jump under the cursor. The external-link
            button beside it is the same destination in a new tab, which is
            what makes it an icon rather than a second label.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Built from
          </Typography>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            {/* The anchor is the interactive element and the chip is the
                shape of it — `clickable` would put a button inside a link. */}
            {invoiceDashboard.components.map((name) => (
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
              Live. Switch queues with the tabs, search the table, and open the
              panel to narrow it — the trigger keeps the count once the panel
              closes. Fold the rail with the toggle to watch the name columns
              give up their width rather than the amount or the button.
            </Typography>
          </Stack>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <InvoiceDashboardPreview />
          </Paper>
          <Typography variant="body2" color="text.secondary">
            The invoices, the facet options and the rail&apos;s items are the
            application&apos;s, so the snippet imports them rather than
            inventing them. Everything that is layout, and every decision about
            which token a stage is drawn in, is in it.
          </Typography>
          <CodeBlock maxHeight={CODE_MAX_HEIGHT_PX}>
            {invoiceDashboard.code}
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
              {invoiceDashboard.dos.map((item) => (
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
              {invoiceDashboard.donts.map((item) => (
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
