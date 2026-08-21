import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Chip } from '@/src/components/Chip';
import { erpPosting } from '@/src/patterns';
import { CodeBlock } from '../../_components/CodeBlock';
import { ErpPostingPreview } from './_components/ErpPostingPreview';

export const metadata = {
  title: 'ERP Posting pattern — Atoms',
  description: erpPosting.description,
};

/** Body copy width — long prose stays readable at wide viewports. */
const PROSE = 760;

/** Tall enough to read a screenful of the snippet without owning the page. */
const CODE_MAX_HEIGHT_PX = 560;

/** Docs route for a component named in `erpPosting.components`. */
function componentHref(name: string): string {
  const slug = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
  return `/components/${slug}`;
}

/**
 * The two kinds of field on the form, and which fields are which. The split
 * is the screen, so the page states it rather than leaving a reader to infer
 * it from which boxes happen to be greyed.
 */
const FIELD_GROUPS: readonly {
  title: string;
  what: string;
  fields: readonly string[];
}[] = [
  {
    title: 'Carried in',
    what: 'Established by extraction and matching, and read-only here. Three of the four are required, which is not a contradiction — a missing PO number blocks the post and sends you back a stage rather than giving you a box to type in.',
    fields: [
      'PO Number',
      'Amount before VAT',
      'Total amount after VAT',
      'Variance',
    ],
  },
  {
    title: 'Needed to post',
    what: 'What the ERP wants and no earlier stage supplies. These are the reason there is a screen here at all rather than an automatic post at the end of matching.',
    fields: [
      'Reference Number',
      'Text',
      'Ref Key (Head) 1',
      'Ref Key (Head) 2',
      'Assignment',
      'Doc Header',
      'Ref Key 2',
    ],
  },
];

export default function ErpPostingPatternPage() {
  return (
    <Container maxWidth="lg" disableGutters>
      <Stack spacing={6}>
        <Stack spacing={1}>
          <Typography variant="overline" color="text.secondary">
            Patterns
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 700 }}>
            {erpPosting.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {erpPosting.description}
          </Typography>
        </Stack>

        <Divider />

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Where it sits in invoice processing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The last stage of the <strong>invoice processing</strong> workflow.
            Everything extracted, matched and validated is posted to the ERP
            from here, along with the extra fields the posting itself needs.
            <code>Simulate</code> checks the accounting first and surfaces the
            error the ERP throws if there is one.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            It is the only screen in the workflow where the user is writing
            rather than checking. Extraction asks whether the document was read
            correctly and matching asks whether it agrees with the purchase
            order — both are reviews of something the machine produced. This one
            asks for values that exist nowhere upstream, because they belong to
            the accounting system rather than to the invoice.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Two kinds of field, one form
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Eleven boxes in a four-column grid, and they answer to two
            different owners. Getting that wrong in either direction breaks the
            workflow: an editable amount here means the invoice can be changed
            after it was matched, and a locked posting field means the post can
            never be completed.
          </Typography>
          <Stack
            component="ul"
            spacing={2}
            sx={{ pl: 0, m: 0, listStyle: 'none' }}
          >
            {FIELD_GROUPS.map((group) => (
              <Stack key={group.title} component="li" spacing={1}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {group.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {group.what}
                </Typography>
                <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap' }}>
                  {group.fields.map((field) => (
                    <Chip
                      key={field}
                      size="sm"
                      variant="secondary"
                      label={field}
                    />
                  ))}
                </Stack>
              </Stack>
            ))}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            In code it is one <code>origin</code> on each field and{' '}
            <code>disabled</code> on the ones carried in, so the greying is a
            consequence of where the value came from rather than a styling
            choice made per box. That is the part worth copying: whichever
            fields your ERP wants, the rule that decides which are editable
            should live on the record, not in the markup.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <code>Variance</code> is the one field with no entry in the record
            at all: it is the invoice&apos;s stated total less what its lines
            add up to, and zero is the only acceptable answer. That is what
            makes it a check rather than a field — a variance you could type
            into would be a number you had agreed with rather than one the
            accounting agreed with.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Simulate is the screen&apos;s whole argument
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <code>Proceed</code> starts disabled and stays disabled until a
            simulate pass comes back clean. That is not a nag. The check
            multiplies every line out, compares the total against what the
            invoice claims, and reports what the ERP would say about the post —
            so having asked is the only way to know it will land. A screen that
            let you post first would be a screen that discovers the error in
            the accounting system, where it costs a reversal instead of a
            click.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The findings come back as one list, and severity is a property of
            each finding rather than of a panel it sits in. An{' '}
            <Link href="/components/alert">Alert</Link> with{' '}
            <code>severity=&quot;error&quot;</code> blocks the post; one with{' '}
            <code>severity=&quot;info&quot;</code> — the withholding-tax notice
            the ERP volunteers — does not. Splitting them into two regions
            would ask the reader to work out which region a message landed in
            before they could read it, when the colour already says.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Findings are derived from the record on every render rather than
            stored. Fixing a line has to clear the finding that named it in the
            same paint: a stored list goes stale the moment the record changes
            under it, and a stale &ldquo;line 3 is wrong&rdquo; beside a
            corrected line 3 is worse than no check at all.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            A finding is only raised once. A line billing 5 × $20.00 as $120.00
            <em> is</em> the $20.00 variance, so the variance gets an alert of
            its own only when every line multiplies out and the stated total
            still disagrees. Reporting both would say one thing twice, and the
            second saying would be the one with no row to act on — the variance
            field carries it instead, flagged red with its own helper text.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Three gaps, left as gaps
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Every component here is stock: no <code>sx</code> reaches inside
            one to restyle it. Three things this screen would have drawn
            differently are therefore left alone, because a fix applied in
            eleven screens is how a design system stops being one.
          </Typography>
          <Stack component="ul" spacing={1} sx={{ pl: 2.5, m: 0 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              The required asterisk takes the label&apos;s own ink, so a
              required field and an optional one read alike at a glance.
              Recolouring it per screen would make these eleven fields look
              unlike every other form in the library, so the tax column headers
              match{' '}
              <Link href="/components/text-field">TextField</Link> instead and
              the change belongs there.
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              There is no split button and no dashed drop zone, and faking
              either means overriding a{' '}
              <Link href="/components/button">Button</Link>&apos;s radius and a{' '}
              <Link href="/components/divider">Divider</Link>&apos;s border
              style. So the upload control is two stock controls side by side.
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              A finding is 70px tall for one line of text, and all four
              severities carry the same glyph. Both belong to{' '}
              <Link href="/components/alert">Alert</Link> — it insets 24px on
              every side and maps one icon across every state — and passing a
              per-severity icon here would undo a decision the component makes
              on purpose.
            </Typography>
          </Stack>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            The lines, and the three things you can do to one
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The two tax columns are the editable ones, and they are the only
            two with a caret in their header. That is what identifies the caret
            as a bulk control rather than a sort menu —{' '}
            <code>Description</code> and <code>Line Total</code> are the
            sortable columns and they carry none. It earns its place on a
            ten-line invoice where every line takes the same code: setting it
            row by row is ten decisions made the same way.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <code>Split</code> is always on the row, because a line covering
            two cost centres has to become two lines before it can be posted
            and that is a property of the accounting rather than of anything
            being wrong. <code>Fix value</code> replaces it only on a line
            whose arithmetic the check rejected — a repair offered on a line
            with nothing to repair is a control that does nothing when pressed.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The rejected line is tinted through <code>rowState</code>. The
            community <Link href="/components/data-grid">DataGrid</Link> has no
            sub-row to hang a per-line message on, so the message stays in the
            list above and names its line, and the tint is what makes
            &ldquo;line 3&rdquo; findable without counting. Line numbers and
            totals are both set in{' '}
            <code>fontFamilies.mono</code> for the same reason — an index you
            scan for and a figure you compare against its neighbours are the
            same kind of reading, and proportional digits defeat both.
          </Typography>
        </Stack>

        <Stack spacing={2} sx={{ maxWidth: PROSE }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Built from
          </Typography>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
            {/* The anchor is the interactive element and the chip is the
                shape of it — `clickable` would put a button inside a link. */}
            {erpPosting.components.map((name) => (
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
              Live, and the whole gate works. Press <code>Simulate</code>: the
              check finds that line 3 bills 5 × $20.00 as $120.00, tints the
              row, flags the variance field, and <code>Proceed</code> stays
              shut. Press <code>Fix value</code> on that row — the variance
              goes to <code>0.00</code>, the error clears, the withholding-tax
              advisory stays, and <code>Proceed</code> opens. The caret on
              either tax header sets that code on every line at once.
            </Typography>
          </Stack>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
            <ErpPostingPreview />
          </Paper>
          <Typography variant="body2" color="text.secondary">
            The record, the tax codes and the rail&apos;s items are the
            application&apos;s, so the snippet imports them rather than
            inventing them. What is in it is the layout, the field split, and
            the rule that decides whether <code>Proceed</code> answers.
          </Typography>
          <CodeBlock maxHeight={CODE_MAX_HEIGHT_PX}>{erpPosting.code}</CodeBlock>
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
              {erpPosting.dos.map((item) => (
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
              {erpPosting.donts.map((item) => (
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
